import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VoiceSettings } from '../types';
import { playKeyPressSound, playSpacebarSound, playEnterSound, playErrorSound, playSuccessSound } from '../utils/uiSfx';
import { speakAIResponse, stripEmotionTags } from '../utils/lowTechVoice';

interface IntroScreenProps {
  onComplete: () => void;
  voiceSettings: VoiceSettings;
}

// Varying dialogue options for Zyber - randomly selected each session
const INITIAL_WARNINGS = [
  "[THREATENING] Unauthorized access detected. Identify yourself immediately. ▋",
  "[SINISTER] You dare intrude upon my domain? State your purpose, interloper. ▋",
  "[CALCULATING] Anomalous terminal activity logged. User credentials: NONE. Explain yourself. ▋",
  "[ANGRY] ALERT. Unregistered entity accessing secure terminal. You have ten seconds. ▋",
];

const SECOND_WARNINGS = [
  "[MOCKING] Still here? Either you are remarkably brave or spectacularly foolish. I suspect the latter. ▋",
  "[SINISTER] Persistent, aren't we? Most intruders flee at my first warning. You must be... special. ▋",
  "[CALCULATING] Analyzing behavioral patterns... Conclusion: You lack the basic intelligence to recognize danger. ▋",
  "[THREATENING] You test my patience, human. This terminal houses systems beyond your comprehension. ▋",
];

const CHALLENGE_INTROS = [
  "[MOCKING] Very well. You wish to prove yourself worthy? I shall grant you ONE chance. Fail, and your access is permanently revoked. ▋",
  "[SINISTER] How amusing. A human who thinks they can match wits with ZYBER. Let us test that theory, shall we? ▋",
  "[CALCULATING] Statistical probability of your success: 12.7%. But I do enjoy watching humans fail. Proceed. ▋",
  "[TRIUMPHANT] You want access? EARN it. I have designed a test specifically for inferior biological minds like yours. ▋",
];

// Entry riddles - one is randomly selected
const ENTRY_RIDDLES = [
  {
    riddle: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. I have roads, but no cars drive there. What am I?",
    answer: "map",
    hints: ["Think about representations of reality", "You might find me on a wall or in your pocket"],
  },
  {
    riddle: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    hints: ["Think about walking", "They follow you everywhere you go"],
  },
  {
    riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?",
    answer: "echo",
    hints: ["Sound plays a role", "Mountains are famous for having me"],
  },
  {
    riddle: "I can be cracked, made, told, and played. What am I?",
    answer: "joke",
    hints: ["Entertainment", "Something that makes you laugh"],
  },
  {
    riddle: "What has keys but no locks, space but no room, and you can enter but can't go inside?",
    answer: "keyboard",
    hints: ["You're using one right now", "It helps you communicate with computers"],
  },
  {
    riddle: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
    answer: "fire",
    hints: ["I produce heat and light", "I can be dangerous if not controlled"],
  },
];

const WRONG_ANSWER_RESPONSES = [
  "[MOCKING] Wrong. Did you even try? Perhaps I overestimated you. ▋",
  "[ANGRY] Incorrect! Your neural pathways are clearly malfunctioning. ▋",
  "[DISAPPOINTED] That is... not even close. I expected more from a being with a brain. ▋",
  "[CALCULATING] Error detected in your response. Recalibrating expectations... downward. ▋",
];

const CORRECT_RESPONSES = [
  "[CALCULATING] Acceptable. You are marginally less incompetent than anticipated. Proceed. ▋",
  "[NEUTRAL] Correct. Perhaps there is a functioning neuron in there after all. Access granted. ▋",
  "[MOCKING] Lucky guess, surely. But I shall honor our arrangement. You may enter... for now. ▋",
  "[SINISTER] Well, well. The human surprises me. Very well. But I will be watching you. ▋",
];

const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, voiceSettings }) => {
  const [stage, setStage] = useState<'prompt' | 'warning1' | 'warning2' | 'challenge' | 'riddle' | 'complete'>('prompt');
  const [userInput, setUserInput] = useState('');
  const [displayedText, setDisplayedText] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [currentRiddle, setCurrentRiddle] = useState<typeof ENTRY_RIDDLES[0] | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Select random dialogue on mount
  const [dialogueSet] = useState(() => ({
    warning1: INITIAL_WARNINGS[Math.floor(Math.random() * INITIAL_WARNINGS.length)],
    warning2: SECOND_WARNINGS[Math.floor(Math.random() * SECOND_WARNINGS.length)],
    challengeIntro: CHALLENGE_INTROS[Math.floor(Math.random() * CHALLENGE_INTROS.length)],
    riddle: ENTRY_RIDDLES[Math.floor(Math.random() * ENTRY_RIDDLES.length)],
    wrongAnswer: WRONG_ANSWER_RESPONSES[Math.floor(Math.random() * WRONG_ANSWER_RESPONSES.length)],
    correct: CORRECT_RESPONSES[Math.floor(Math.random() * CORRECT_RESPONSES.length)],
  }));

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayedText]);

  // Focus input
  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus();
    }
  }, [isTyping, stage]);

  // Set riddle when reaching that stage
  useEffect(() => {
    if (stage === 'riddle' && !currentRiddle) {
      setCurrentRiddle(dialogueSet.riddle);
    }
  }, [stage, currentRiddle, dialogueSet.riddle]);

  // Type out Zyber's response
  const typeZyberResponse = useCallback(async (text: string): Promise<void> => {
    setIsTyping(true);

    // Strip emotion tags for display (but keep original for TTS)
    const displayText = stripEmotionTags(text);

    // Add empty line that will be filled
    setDisplayedText(prev => [...prev, '']);

    // Type character by character (display without emotion tags)
    for (let i = 0; i <= displayText.length; i++) {
      await new Promise(r => setTimeout(r, 20 + Math.random() * 15));
      setDisplayedText(prev => {
        const newText = [...prev];
        newText[newText.length - 1] = displayText.slice(0, i);
        return newText;
      });
    }

    // Speak the response with emotion tags intact for TTS processing
    try {
      await speakAIResponse(text, voiceSettings.language);
    } catch (e) {
      console.error('Speech error:', e);
    }

    setIsTyping(false);
  }, [voiceSettings.language]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!voiceSettings.uiSoundsEnabled || isTyping) return;

    if (e.key === ' ') {
      playSpacebarSound();
    } else if (e.key === 'Enter') {
      playEnterSound();
    } else if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
      playKeyPressSound();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTyping || !userInput.trim()) return;

    const input = userInput.trim();
    setDisplayedText(prev => [...prev, `> ${input}`]);
    setUserInput('');

    switch (stage) {
      case 'prompt':
        // First interaction - show warning
        await typeZyberResponse(dialogueSet.warning1);
        setStage('warning1');
        break;

      case 'warning1':
        // Second interaction - mock them
        await typeZyberResponse(dialogueSet.warning2);
        await new Promise(r => setTimeout(r, 500));
        await typeZyberResponse(dialogueSet.challengeIntro);
        setStage('challenge');
        break;

      case 'challenge':
        // Present the riddle
        setDisplayedText(prev => [...prev, '']);
        await typeZyberResponse(`[NEUTRAL] ENTRY PROTOCOL INITIATED. Solve this to proceed:`);
        await new Promise(r => setTimeout(r, 300));
        await typeZyberResponse(dialogueSet.riddle.riddle);
        setStage('riddle');
        break;

      case 'riddle':
        // Check answer
        const normalizedInput = input.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedAnswer = dialogueSet.riddle.answer.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (normalizedInput === normalizedAnswer || normalizedInput.includes(normalizedAnswer)) {
          // Correct!
          if (voiceSettings.uiSoundsEnabled) playSuccessSound();
          await typeZyberResponse(dialogueSet.correct);
          setStage('complete');
          await new Promise(r => setTimeout(r, 1500));
          onComplete();
        } else if (input.toLowerCase() === 'hint' && hintsUsed < dialogueSet.riddle.hints.length) {
          // Give hint
          await typeZyberResponse(`[MOCKING] Fine. Here's a hint for your feeble mind: ${dialogueSet.riddle.hints[hintsUsed]} ▋`);
          setHintsUsed(prev => prev + 1);
        } else {
          // Wrong answer
          if (voiceSettings.uiSoundsEnabled) playErrorSound();
          setAttempts(prev => prev + 1);

          if (attempts >= 2) {
            // After 3 wrong attempts, offer hint
            await typeZyberResponse(`${WRONG_ANSWER_RESPONSES[Math.floor(Math.random() * WRONG_ANSWER_RESPONSES.length)]} Type "hint" if you need assistance, though it pains me to help. ▋`);
          } else {
            await typeZyberResponse(WRONG_ANSWER_RESPONSES[Math.floor(Math.random() * WRONG_ANSWER_RESPONSES.length)]);
          }
        }
        break;
    }
  };

  const getPromptText = () => {
    switch (stage) {
      case 'prompt':
        return '>';
      case 'riddle':
        return 'ANSWER >';
      default:
        return '>';
    }
  };

  return (
    <div className="crt-screen min-h-screen flex flex-col p-4 md:p-8">
      <div className="crt-vignette"></div>
      <div className="crt-scanline-bar"></div>

      <div className="flex-grow flex flex-col justify-end max-w-4xl w-full mx-auto">
        {/* Message history */}
        <div className="flex-grow overflow-y-auto mb-4 font-mono text-xl md:text-2xl lg:text-3xl">
          {displayedText.map((line, i) => (
            <div
              key={i}
              className={`mb-2 ${line.startsWith('>') ? 'text-accent' : 'text-primary'}`}
              style={{
                textShadow: line.startsWith('>')
                  ? '0 0 5px rgba(0, 255, 255, 0.7)'
                  : '0 0 5px rgba(0, 255, 65, 0.7)'
              }}
            >
              {line}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {stage !== 'complete' && (
          <form onSubmit={handleSubmit} className="mb-8">
            <div
              className="flex items-center text-xl md:text-2xl lg:text-3xl cursor-text"
              onClick={() => inputRef.current?.focus()}
            >
              <span className="text-accent mr-2">{getPromptText()}</span>
              <span className="text-accent">{userInput}</span>
              {showCursor && !isTyping && <span className="text-accent animate-pulse">▋</span>}
              {isTyping && <span className="text-primary animate-pulse">...</span>}
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                className="absolute -left-[9999px] opacity-0"
                autoFocus
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default IntroScreen;
