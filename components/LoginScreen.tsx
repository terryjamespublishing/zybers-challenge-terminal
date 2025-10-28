import React, { useState, useRef, useEffect } from 'react';
import TypingEffect from './TypingEffect';
import { VoiceSettings, User } from '../types';
import { playKeyPressSound, playSubmitSound } from '../utils/uiSfx';
import * as userService from '../services/userService';

type AuthStep = 'USERNAME' | 'PASSWORD_EXISTING' | 'PASSWORD_NEW';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  voiceSettings: VoiceSettings;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, voiceSettings }) => {
  const [step, setStep] = useState<AuthStep>('USERNAME');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (voiceSettings.uiSoundsEnabled) {
      playSubmitSound();
    }
    setError(null);

    if (step === 'USERNAME') {
        if (!username.trim()) return;
        if (userService.doesUserExist(username.trim())) {
            setStep('PASSWORD_EXISTING');
        } else {
            setStep('PASSWORD_NEW');
        }
    } else { // Password steps
        if (!password.trim()) return;
        if (step === 'PASSWORD_EXISTING') {
            const user = userService.authenticateUser(username.trim(), password.trim());
            if (user) {
                onLogin(user);
            } else {
                setError('> ACCESS DENIED. INVALID CREDENTIALS.');
                setPassword('');
            }
        } else if (step === 'PASSWORD_NEW') {
            const user = userService.registerUser(username.trim(), password.trim());
            onLogin(user);
        }
    }
  };
  
  // Refocus input when step changes
  useEffect(() => {
      inputRef.current?.focus();
  }, [step]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (voiceSettings.uiSoundsEnabled) {
      playKeyPressSound();
    }
    const { value } = e.target;
    if (step === 'USERNAME') {
        setUsername(value.toUpperCase());
    } else {
        setPassword(value);
    }
  };
  
  const focusInput = () => inputRef.current?.focus();

  const getPrompt = () => {
    switch (step) {
        case 'USERNAME':
            return '> ENTER USER_ID:';
        case 'PASSWORD_EXISTING':
            return `> PASSWORD FOR ${username}:`;
        case 'PASSWORD_NEW':
            return `> CREATE PASSWORD FOR ${username}:`;
    }
  };

  const displayedValue = step === 'USERNAME' ? username : password.replace(/./g, '*');
  const inputValue = step === 'USERNAME' ? username : password;

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-2xl sm:text-3xl md:text-5xl px-4">
      <div className="w-full max-w-2xl">
        <TypingEffect text="ZYBER CHALLENGE TERMINAL v1.0" playSound={voiceSettings.uiSoundsEnabled} />
        <TypingEffect text="> CONNECTING TO MAINFRAME..." delay={2000} playSound={voiceSettings.uiSoundsEnabled} />
        <TypingEffect text="> CONNECTION ESTABLISHED." delay={3500} playSound={voiceSettings.uiSoundsEnabled} />
        
        <form onSubmit={handleSubmit} className="mt-8 animate-fade-in" style={{ animationDelay: '4.5s' }}>
          <label htmlFor="authInput" className="block mb-2">{getPrompt()}</label>
          <div className="flex items-center cursor-text" onClick={focusInput}>
            <span className="mr-2 text-green-400">$</span>
            <span>{displayedValue}</span>
            <span className="animate-blink">▋</span>
            <input
              ref={inputRef}
              id="authInput"
              type={step === 'USERNAME' ? 'text' : 'password'}
              value={inputValue}
              onChange={handleInputChange}
              className="absolute -left-[9999px] opacity-0"
              autoFocus
              maxLength={20}
              autoCapitalize="none"
              autoComplete="off"
            />
          </div>
          {error && <p className="text-red-500 mt-4 text-2xl animate-pulse">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;