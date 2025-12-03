import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuestChallenge, Message, VoiceSettings } from '../types';
import * as geminiService from '../services/geminiService';
import TerminalWindow from './TerminalWindow';
import TypingEffect from './TypingEffect';
import StreamingTypingEffect from './StreamingTypingEffect';
import ChallengeTimer from './ChallengeTimer';
import { playKeyPressSound, playSubmitSound, playSpacebarSound, playEnterSound } from '../utils/uiSfx';
import { speakAIResponse, stopSpeaking, SpeechProgressCallback } from '../utils/lowTechVoice';
import { completeCurrentChallenge } from '../services/progressService';

interface ChallengeScreenProps {
  challenge: QuestChallenge;
  onExit: () => void;
  addRewards: (rewards: { xp: number; dataBits: number; accessKeys?: number }) => void;
  voiceSettings: VoiceSettings;
}

const SoundIcon: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isPlaying ? 'text-accent' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isPlaying ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        )}
    </svg>
);

// Generate a prompt from QuestChallenge data
const generateChallengePrompt = (challenge: QuestChallenge): string => {
  return `You are Zyber, a sarcastic adversarial AI in a retro 80s terminal. Present this challenge to the user:

CHALLENGE: ${challenge.name}
CATEGORY: ${challenge.category}
DIFFICULTY: ${challenge.difficulty}/3

DESCRIPTION: ${challenge.description}

MATERIALS NEEDED: ${challenge.materials.join(', ')}

LEARNING OBJECTIVES: ${challenge.learning_objectives}

STORY CONTEXT: ${challenge.story_ideas}

${challenge.safety_notes ? `SAFETY NOTES: ${challenge.safety_notes}` : ''}

Present this challenge in your sarcastic Zyber personality. Guide the user through the challenge, asking them questions and helping them along the way. Be challenging but fair. Use emotion markers like [MOCKING], [CALCULATING], [TRIUMPHANT] in your responses.`;
};


const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ challenge, onExit, addRewards, voiceSettings }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechCharIndex, setSpeechCharIndex] = useState(0);
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const CHALLENGE_DURATION = 30; // 30 minutes

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Track elapsed time
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cleanup: Stop speech when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const handleTimeUp = useCallback(() => {
    // Time's up! Mark as complete anyway
    setChallengeComplete(true);
    completeCurrentChallenge(CHALLENGE_DURATION * 60);
  }, []);

  const handleChallengeComplete = useCallback(() => {
    if (!challengeComplete) {
      setChallengeComplete(true);
      completeCurrentChallenge(elapsedSeconds);
    }
  }, [challengeComplete, elapsedSeconds]);

  const addMessage = useCallback(async (sender: 'user' | 'Zyber', text: string, spokenText?: string) => {
    const textToSpeak = spokenText || text;
    const newMessage: Message = { sender, text, spokenText };

    setMessages(prev => [...prev, newMessage]);

    // Speak Zyber's messages
    if (sender === 'Zyber') {
        try {
            setIsSpeaking(true);
            setSpeechCharIndex(0);

            const onProgress: SpeechProgressCallback = (charIndex) => {
                setSpeechCharIndex(charIndex);
            };

            await speakAIResponse(textToSpeak, voiceSettings.language, onProgress);
            setIsSpeaking(false);
        } catch (error) {
            console.error("[ChallengeScreen] TTS Error:", error);
            setIsSpeaking(false);
            setSpeechCharIndex(Infinity);
        }
    }
  }, [voiceSettings.language]);

  const fetchInitialChallenge = useCallback(async () => {
    setIsLoading(true);
    try {
      const prompt = generateChallengePrompt(challenge);
      const response = await geminiService.generateChallenge(prompt, voiceSettings.language);
      await addMessage('Zyber', response.displayText, response.spokenText);
    } catch (error) {
      console.error(error);
      await addMessage('Zyber', `> ERROR: FAILED TO LOAD CHALLENGE. PLEASE TRY AGAIN.▋`);
    } finally {
      setIsLoading(false);
    }
  }, [challenge, addMessage, voiceSettings.language]);

  useEffect(() => {
    fetchInitialChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

   useEffect(() => {
    if (!isLoading) {
      focusInput();
    }
  }, [isLoading, focusInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    if (voiceSettings.uiSoundsEnabled) {
      playSubmitSound();
    }

    const currentInput = userInput;
    addMessage('user', currentInput);
    setUserInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await geminiService.getChatResponse(history, currentInput, voiceSettings.language);

      // Handle rewards
      if (response.reward.isCorrect && response.reward.xp > 0) {
          const accessKeys = isFirstAttempt ? 1 : 0;
          addRewards({
            xp: response.reward.xp,
            dataBits: response.reward.dataBits,
            accessKeys
          });
          setIsFirstAttempt(false);

          // Mark challenge as complete on correct answer
          handleChallengeComplete();
      }

      await addMessage('Zyber', response.displayText, response.spokenText);
    } catch (error) {
      console.error(error);
      await addMessage('Zyber', `> SYSTEM MALFUNCTION. PLEASE REBOOT.▋`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!voiceSettings.uiSoundsEnabled) return;

    if (e.key === ' ') {
      playSpacebarSound();
    } else if (e.key === 'Enter') {
      playEnterSound();
    } else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      playKeyPressSound();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const getDifficultyLabel = (diff: number): string => {
    switch (diff) {
      case 1: return 'EASY';
      case 2: return 'MEDIUM';
      case 3: return 'HARD';
      default: return 'UNKNOWN';
    }
  };

  return (
    <>
      {/* Always visible timer */}
      <ChallengeTimer
        durationMinutes={CHALLENGE_DURATION}
        onTimeUp={handleTimeUp}
        isPaused={challengeComplete}
      />

      <TerminalWindow title={`MISSION: ${challenge.name.toUpperCase()}`} onExit={onExit}>
        {/* Challenge header info */}
        <div className="mb-4 pb-3 border-b border-primary/30">
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-primary/50">CATEGORY:</span>{' '}
              <span className="text-primary">{challenge.category}</span>
            </div>
            <div>
              <span className="text-primary/50">DIFFICULTY:</span>{' '}
              <span className={
                challenge.difficulty === 1 ? 'text-primary' :
                challenge.difficulty === 2 ? 'text-accent' :
                'text-red-400'
              }>
                {getDifficultyLabel(challenge.difficulty)}
              </span>
            </div>
            {challenge.materials.length > 0 && (
              <div className="w-full">
                <span className="text-primary/50">MATERIALS:</span>{' '}
                <span className="text-primary/70">{challenge.materials.join(' | ')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col text-2xl sm:text-3xl md:text-4xl" style={{ height: 'calc(100vh - 16rem)', minHeight: '400px' }}>
          <div className="flex-grow overflow-y-auto">
            {messages.map((msg, index) => {
              const isLatestZyberMessage = msg.sender === 'Zyber' && index === messages.length - 1;
              const isCurrentlySpeaking = isLatestZyberMessage && isSpeaking;

              return (
                <div key={index} className="mb-3">
                  <div className="flex items-start gap-2">
                    <span className={`${msg.sender === 'user' ? 'text-accent' : 'text-primary'} opacity-70`}>
                      {msg.sender === 'user' ? '>' : '>>'}
                    </span>
                    <div className="flex-1">
                      {isCurrentlySpeaking && (
                        <span className="inline-block mr-2 opacity-70">
                          <SoundIcon isPlaying={true} />
                        </span>
                      )}
                      <span className={`${msg.sender === 'user' ? 'text-accent' : ''} whitespace-pre-wrap leading-relaxed`}>
                        {msg.sender === 'Zyber' ? (
                          isCurrentlySpeaking ? (
                            <StreamingTypingEffect
                              text={msg.text}
                              charIndex={speechCharIndex}
                              isComplete={false}
                            />
                          ) : (
                            <TypingEffect
                              text={msg.text}
                              key={index}
                              instant={true}
                              playSound={false}
                            />
                          )
                        ) : (
                          msg.text
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="mb-3">
                <div className="flex items-start gap-2">
                  <span className="text-primary opacity-70">&gt;&gt;</span>
                  <TypingEffect text="Processing..." playSound={voiceSettings.uiSoundsEnabled}/>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSubmit} className="mt-4 pt-3 border-t border-primary/20 flex-shrink-0">
            <div className="flex items-center cursor-text text-3xl" onClick={focusInput}>
              <span className="mr-2 text-primary opacity-70">$</span>
              <span>{userInput}</span>
              {!userInput && (
                <span className="opacity-30 italic">
                  {isLoading ? 'awaiting_response' : 'enter_command'}
                </span>
              )}
              {!isLoading && <span className="animate-blink">▋</span>}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="absolute -left-[9999px] opacity-0"
                disabled={isLoading}
              />
            </div>
          </form>
        </div>
      </TerminalWindow>
    </>
  );
};

export default ChallengeScreen;
