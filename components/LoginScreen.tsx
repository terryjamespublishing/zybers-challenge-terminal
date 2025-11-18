import React, { useState, useRef, useEffect } from 'react';
import TypingEffect from './TypingEffect';
import { VoiceSettings, User } from '../types';
import { playKeyPressSound, playSubmitSound } from '../utils/uiSfx';
import * as userService from '../services/userService';

type EnrollmentStep = 'INITIAL' | 'ASK_NAME' | 'CONFIRM_NAME' | 'ASK_PASSWORD' | 'CONFIRM_PASSWORD' | 'LOGIN_PASSWORD' | 'COMPLETE';

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
  const [password, setPassword] = useState('');
  const [isReturningUser, setIsReturningUser] = useState(false);
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
        // User provided their name - check if they're a returning user
        setProposedName(userInput);
        const userExists = userService.doesUserExist(userInput);

        if (userExists) {
          // Returning user
          setIsReturningUser(true);
          setTimeout(() => {
            addMessage('');
            addMessage(`> ZYBER: Ah, ${userInput.toUpperCase()}... I remember you.`);
          }, 500);
          setTimeout(() => {
            addMessage('> ZYBER: Your neural signature is already in my database.');
          }, 2000);
          setTimeout(() => {
            addMessage('> ZYBER: To access your profile, I need your security credentials.');
          }, 3500);
          setTimeout(() => {
            addMessage('> ZYBER: Enter your password:');
            setStep('LOGIN_PASSWORD');
          }, 5000);
        } else {
          // New user
          setIsReturningUser(false);
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
        }
        break;

      case 'CONFIRM_NAME':
        const response = userInput.toUpperCase();
        if (response === 'YES' || response === 'Y') {
          // Confirmed - now ask for password
          setTimeout(() => {
            addMessage('');
            addMessage('> ZYBER: Excellent. Now I need to secure your profile.');
          }, 500);
          setTimeout(() => {
            addMessage('> ZYBER: Create a password to protect your neural signature.');
          }, 2000);
          setTimeout(() => {
            addMessage('> ZYBER: Choose wisely - this will guard your access to the network.');
          }, 3500);
          setTimeout(() => {
            addMessage('> ZYBER: Enter your new password:');
            setStep('ASK_PASSWORD');
          }, 5000);
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

      case 'ASK_PASSWORD':
        // User entered a password for new account
        setPassword(userInput);
        setTimeout(() => {
          addMessage('');
          addMessage('> ZYBER: Password recorded. Encrypting...');
        }, 500);
        setTimeout(() => {
          addMessage('> ZYBER: To ensure the integrity of your neural link...');
        }, 2000);
        setTimeout(() => {
          addMessage('> ZYBER: Please confirm your password:');
          setStep('CONFIRM_PASSWORD');
        }, 3500);
        break;

      case 'CONFIRM_PASSWORD':
        // User confirmed password
        if (userInput === password) {
          // Passwords match - create user
          setTimeout(() => {
            addMessage('');
            addMessage('> ZYBER: Password verified. Initiating enrollment sequence...');
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
            // Register user with actual password and login
            const newUser = userService.registerUser(proposedName, password);
            setStep('COMPLETE');
            onLogin(newUser);
          }, 8000);
        } else {
          // Passwords don't match
          setTimeout(() => {
            addMessage('');
            addMessage('> ZYBER: ERROR: Password mismatch detected.');
          }, 500);
          setTimeout(() => {
            addMessage('> ZYBER: The neural patterns do not align.');
          }, 2000);
          setTimeout(() => {
            addMessage('> ZYBER: Let\'s try again. Enter your new password:');
            setStep('ASK_PASSWORD');
          }, 3500);
        }
        break;

      case 'LOGIN_PASSWORD':
        // Returning user entering password
        const authenticatedUser = userService.authenticateUser(proposedName, userInput);
        if (authenticatedUser) {
          // Password correct
          setTimeout(() => {
            addMessage('');
            addMessage('> ZYBER: Password accepted. Verifying neural signature...');
          }, 500);
          setTimeout(() => {
            addMessage('> ESTABLISHING QUANTUM LINK...');
          }, 1500);
          setTimeout(() => {
            addMessage('> DECRYPTING IDENTITY MATRIX...');
          }, 2500);
          setTimeout(() => {
            addMessage('');
            addMessage(`> ZYBER: Welcome back, ${proposedName.toUpperCase()}.`);
          }, 4000);
          setTimeout(() => {
            addMessage('> ZYBER: The network has missed your presence...');
          }, 5500);
          setTimeout(() => {
            setStep('COMPLETE');
            onLogin(authenticatedUser);
          }, 7000);
        } else {
          // Wrong password
          setTimeout(() => {
            addMessage('');
            addMessage('> ZYBER: ACCESS DENIED.');
          }, 500);
          setTimeout(() => {
            addMessage('> ZYBER: Invalid credentials. The neural signature does not match.');
          }, 2000);
          setTimeout(() => {
            addMessage('> ZYBER: Try again. Enter your password:');
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
          <div className="text-xl opacity-60 mb-2">ZYBER SYSTEMS NETWORK v1.0</div>
          <div className="text-base opacity-60">Copyright (C) 1985 Zyber Corp.</div>
        </div>

        {/* Initial boot messages */}
        <div className="text-lg mb-4">
          <TypingEffect text="> Initializing system..." playSound={voiceSettings.uiSoundsEnabled} />
          <TypingEffect text="> Loading neural network..." delay={1500} playSound={voiceSettings.uiSoundsEnabled} />
          <TypingEffect text="> Connection established." delay={2500} playSound={voiceSettings.uiSoundsEnabled} />
        </div>

        {/* Conversation messages */}
        <div className="flex-grow overflow-y-auto mb-4 text-lg space-y-2">
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
            <div className="flex items-center cursor-text border-t border-primary/30 pt-3" onClick={focusInput}>
              <span className="mr-2 opacity-50 text-lg">&gt;</span>
              <span className="text-lg">
                {step === 'ASK_PASSWORD' || step === 'CONFIRM_PASSWORD' || step === 'LOGIN_PASSWORD'
                  ? '•'.repeat(input.length)
                  : input}
              </span>
              <span className="animate-blink text-lg">▋</span>
              <input
                ref={inputRef}
                type={step === 'ASK_PASSWORD' || step === 'CONFIRM_PASSWORD' || step === 'LOGIN_PASSWORD' ? 'password' : 'text'}
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