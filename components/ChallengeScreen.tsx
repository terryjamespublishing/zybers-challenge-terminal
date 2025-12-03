import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChallengeCategory, Message, VoiceSettings } from '../types';
import * as geminiService from '../services/geminiService';
import TerminalWindow from './TerminalWindow';
import TypingEffect from './TypingEffect';
import { playKeyPressSound, playSubmitSound, playSpacebarSound, playEnterSound } from '../utils/uiSfx';
import { speakAIResponse, stopSpeaking } from '../utils/lowTechVoice';

interface ChallengeScreenProps {
  challenge: ChallengeCategory;
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


const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ challenge, onExit, addRewards, voiceSettings }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isEscapeProtocol = challenge.title === 'Escape Protocol';

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Countdown timer for Escape Protocol
  useEffect(() => {
    if (!isEscapeProtocol) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isEscapeProtocol]);

  // Cleanup: Stop speech when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const addMessage = useCallback(async (sender: 'user' | 'Zyber', text: string, spokenText?: string) => {
    const textToSpeak = spokenText || text;
    const newMessage: Message = { sender, text, spokenText };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Speak Zyber's messages using the new low-tech voice with emotions
    if (sender === 'Zyber') {
        try {
            setIsSpeaking(true);
            console.log('[ChallengeScreen] 🤖 Speaking with Dalek voice:', textToSpeak);
            await speakAIResponse(textToSpeak, voiceSettings.language);
            setIsSpeaking(false);
        } catch (error) {
            console.error("[ChallengeScreen] TTS Error:", error);
            setIsSpeaking(false);
        }
    }
  }, [voiceSettings.language]);

  const fetchInitialChallenge = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await geminiService.generateChallenge(challenge.prompt, voiceSettings.language);
      await addMessage('Zyber', response.displayText, response.spokenText);
    } catch (error) {
      console.error(error);
      await addMessage('Zyber', `> ERROR: FAILED TO LOAD CHALLENGE. PLEASE TRY AGAIN.▋`);
    } finally {
      setIsLoading(false);
    }
  }, [challenge.prompt, addMessage, voiceSettings.language]);

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

      // Use structured reward data from AI response
      if (response.reward.isCorrect && response.reward.xp > 0) {
          const accessKeys = isFirstAttempt ? 1 : 0;
          addRewards({ 
            xp: response.reward.xp, 
            dataBits: response.reward.dataBits, 
            accessKeys 
          });
          setIsFirstAttempt(false);
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

    // Play different sounds for different keys
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

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getASCIIDigit = (digit: string): string[] => {
    const digits: { [key: string]: string[] } = {
      '0': [
        '  ██████  ',
        ' ██    ██ ',
        '██      ██',
        '██      ██',
        '██      ██',
        ' ██    ██ ',
        '  ██████  '
      ],
      '1': [
        '    ██    ',
        '  ████    ',
        '    ██    ',
        '    ██    ',
        '    ██    ',
        '    ██    ',
        '  ██████  '
      ],
      '2': [
        '  ██████  ',
        ' ██    ██ ',
        '       ██ ',
        '     ██   ',
        '   ██     ',
        ' ██       ',
        ' █████████'
      ],
      '3': [
        '  ██████  ',
        ' ██    ██ ',
        '       ██ ',
        '   █████  ',
        '       ██ ',
        ' ██    ██ ',
        '  ██████  '
      ],
      '4': [
        '      ██  ',
        '     ███  ',
        '    ████  ',
        '   ██ ██  ',
        '  ████████',
        '      ██  ',
        '      ██  '
      ],
      '5': [
        ' █████████',
        ' ██       ',
        ' ██       ',
        ' ███████  ',
        '       ██ ',
        ' ██    ██ ',
        '  ██████  '
      ],
      '6': [
        '  ██████  ',
        ' ██    ██ ',
        '██        ',
        '███████   ',
        '██     ██ ',
        '██     ██ ',
        ' ███████  '
      ],
      '7': [
        ' █████████',
        '       ██ ',
        '      ██  ',
        '     ██   ',
        '    ██    ',
        '   ██     ',
        '  ██      '
      ],
      '8': [
        '  ██████  ',
        ' ██    ██ ',
        ' ██    ██ ',
        '  ██████  ',
        ' ██    ██ ',
        ' ██    ██ ',
        '  ██████  '
      ],
      '9': [
        '  ██████  ',
        ' ██    ██ ',
        ' ██    ██ ',
        '  ███████ ',
        '       ██ ',
        ' ██    ██ ',
        '  ██████  '
      ],
      ':': [
        '          ',
        '   ████   ',
        '   ████   ',
        '          ',
        '   ████   ',
        '   ████   ',
        '          '
      ]
    };
    return digits[digit] || digits['0'];
  };

  const renderASCIITime = (timeStr: string): string[] => {
    const chars = timeStr.split('');
    const digitArrays = chars.map(c => getASCIIDigit(c));
    
    const lines: string[] = [];
    for (let i = 0; i < 7; i++) {
      let line = '';
      for (const digitArray of digitArrays) {
        line += digitArray[i] + '  ';
      }
      lines.push(line);
    }
    return lines;
  };

  const timeColor = timeRemaining < 300 ? 'text-red-500' : timeRemaining < 600 ? 'text-yellow-500' : 'text-primary';

  return (
    <TerminalWindow title={`SESSION: ${challenge.title.toUpperCase()}`} onExit={onExit}>
      {isEscapeProtocol && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className={`font-mono font-bold text-center ${timeColor} opacity-30 select-none`} 
               style={{ 
                 fontSize: 'clamp(8rem, 18vw, 16rem)',
                 textShadow: `0 0 20px currentColor, 0 0 40px currentColor`,
                 lineHeight: '1',
                 letterSpacing: '0.3em',
                 fontVariantNumeric: 'tabular-nums'
               }}>
            [{formatTime(timeRemaining)}]
          </div>
        </div>
      )}
      <div className="flex flex-col text-2xl sm:text-3xl md:text-4xl" style={{ height: 'calc(100vh - 12rem)', minHeight: '400px' }}>
        <div className="flex-grow overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-start gap-2">
                <span className={`${msg.sender === 'user' ? 'text-accent' : 'text-primary'} opacity-70`}>
                  {msg.sender === 'user' ? '>' : '>>'}
                </span>
                <div className="flex-1">
                  {msg.sender === 'Zyber' && isSpeaking && index === messages.length - 1 && (
                    <span className="inline-block mr-2 opacity-70">
                      <SoundIcon isPlaying={true} />
                    </span>
                  )}
                  <span className={`${msg.sender === 'user' ? 'text-accent' : ''} whitespace-pre-wrap leading-relaxed`}>
                    {msg.sender === 'Zyber' ? <TypingEffect text={msg.text} key={index} instant={index < messages.length - 1} playSound={voiceSettings.uiSoundsEnabled}/> : msg.text}
                  </span>
                </div>
              </div>
            </div>
          ))}
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
  );
};

export default ChallengeScreen;