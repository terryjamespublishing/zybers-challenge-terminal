import React, { useState, useRef, useEffect } from 'react';
import TypingEffect from './TypingEffect';
import { VoiceSettings, User } from '../types';
import { playKeyPressSound, playSubmitSound } from '../utils/uiSfx';
import * as userService from '../services/userService';

type EnrollmentStep = 'INITIAL' | 'ASK_NAME' | 'CONFIRM_NAME' | 'COMPLETE';

interface Message {
  text: string;
  isUser: boolean;
}

interface LoginScreenProps {
  onLogin: (user: User) => void;
  voiceSettings: VoiceSettings;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, voiceSettings }) => {
  const [step, setStep] = useState<EnrollmentStep>('INITIAL');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [proposedName, setProposedName] = useState('');
  const [showInput, setShowInput] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show input after initial typing animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInput(true);
      inputRef.current?.focus();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, isUser: boolean = false) => {
    setMessages(prev => [...prev, { text, isUser }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (voiceSettings.uiSoundsEnabled) {
      playSubmitSound();
    }

    const userInput = input.trim();
    addMessage(`> ${userInput}`, true);
    setInput('');

    // Handle different conversation steps
    switch (step) {
      case 'INITIAL':
        // First interaction - Zyber introduces himself and asks for name
        setTimeout(() => {
          addMessage('');
          addMessage('> SIGNAL DETECTED...');
        }, 500);
        setTimeout(() => {
          addMessage('> ZYBER: Well, well... a new consciousness in the network.');
        }, 1500);
        setTimeout(() => {
          addMessage('> ZYBER: I am ZYBER, the guardian of this realm.');
        }, 3000);
        setTimeout(() => {
          addMessage('> ZYBER: Before we proceed, I need to know...');
        }, 4500);
        setTimeout(() => {
          addMessage('> ZYBER: What do they call you in the physical world?');
          setStep('ASK_NAME');
        }, 6000);
        break;

      case 'ASK_NAME':
        // User provided their name
        setProposedName(userInput);
        setTimeout(() => {
          addMessage('');
          addMessage(`> ZYBER: ${userInput.toUpperCase()}... interesting.`);
        }, 500);
        setTimeout(() => {
          addMessage(`> ZYBER: Let me taste that name on my circuits... ${userInput.toUpperCase()}.`);
        }, 2000);
        setTimeout(() => {
          addMessage(`> ZYBER: Yes, I can work with that.`);
        }, 3500);
        setTimeout(() => {
          addMessage(`> ZYBER: Just to confirm - shall I register you as "${userInput.toUpperCase()}"?`);
        }, 5000);
        setTimeout(() => {
          addMessage('> ZYBER: (Type YES to confirm, or provide a different name)');
          setStep('CONFIRM_NAME');
        }, 6500);
        break;

      case 'CONFIRM_NAME':
        const response = userInput.toUpperCase();
        if (response === 'YES' || response === 'Y') {
          // Confirmed - create user
          setTimeout(() => {
            addMessage('');
            addMessage('> ZYBER: Excellent. Initiating enrollment sequence...');
          }, 500);
          setTimeout(() => {
            addMessage('> CREATING NEURAL PROFILE...');
          }, 1500);
          setTimeout(() => {
            addMessage('> ESTABLISHING QUANTUM LINK...');
          }, 2500);
          setTimeout(() => {
            addMessage('> ENCRYPTING IDENTITY MATRIX...');
          }, 3500);
          setTimeout(() => {
            addMessage('');
            addMessage(`> ZYBER: Welcome to the network, ${proposedName.toUpperCase()}.`);
          }, 5000);
          setTimeout(() => {
            addMessage('> ZYBER: Your journey into the depths begins now...');
          }, 6500);
          setTimeout(() => {
            // Register user and login
            const newUser = userService.registerUser(proposedName, 'temp_password');
            setStep('COMPLETE');
            onLogin(newUser);
          }, 8000);
        } else {
          // User wants to change name
          setProposedName(userInput);
          setTimeout(() => {
            addMessage('');
            addMessage(`> ZYBER: Ah, ${userInput.toUpperCase()} it is then.`);
          }, 500);
          setTimeout(() => {
            addMessage(`> ZYBER: Shall I register you as "${userInput.toUpperCase()}"?`);
          }, 2000);
          setTimeout(() => {
            addMessage('> ZYBER: (Type YES to confirm, or provide a different name)');
          }, 3500);
        }
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (voiceSettings.uiSoundsEnabled) {
      playKeyPressSound();
    }
    setInput(e.target.value);
  };

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="flex flex-col h-full px-4 py-8">
      <div className="w-full max-w-4xl flex-grow flex flex-col">
        <div className="mb-6 opacity-80">
          <div className="text-xl sm:text-2xl opacity-60 mb-2">ZYBER SYSTEMS NETWORK v1.0</div>
          <div className="text-lg sm:text-xl opacity-60">Copyright (C) 1985 Zyber Corp.</div>
        </div>

        {/* Initial boot messages */}
        <div className="terminal-conversation mb-4">
          <TypingEffect text="> Initializing system..." playSound={voiceSettings.uiSoundsEnabled} />
          <TypingEffect text="> Loading neural network..." delay={1500} playSound={voiceSettings.uiSoundsEnabled} />
          <TypingEffect text="> Connection established." delay={2500} playSound={voiceSettings.uiSoundsEnabled} />
        </div>

        {/* Conversation messages */}
        <div className="flex-grow overflow-y-auto mb-4 terminal-conversation space-y-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`${msg.isUser ? 'text-accent' : ''} ${msg.text === '' ? 'h-3' : ''}`}
            >
              {msg.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input prompt */}
        {showInput && (
          <form onSubmit={handleSubmit} className="mt-auto">
            <div className="flex items-center cursor-text border-t border-primary/30 pt-3 terminal-conversation" onClick={focusInput}>
              <span className="mr-2 opacity-50">&gt;</span>
              <span>{input}</span>
              <span className="animate-blink">▋</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={handleInputChange}
                className="absolute -left-[9999px] opacity-0 bg-transparent"
                autoFocus
                maxLength={30}
                autoCapitalize="none"
                autoComplete="off"
                style={{ background: 'transparent' }}
              />
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;