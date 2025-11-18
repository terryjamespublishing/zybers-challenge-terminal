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
    <div className="flex flex-col justify-center h-[90vh] text-2xl sm:text-3xl md:text-4xl px-4">
      <div className="w-full max-w-3xl bg-transparent">
        <div className="mb-8 opacity-80">
          <div className="text-xl sm:text-2xl opacity-60 mb-2">ZYBER SYSTEMS NETWORK v1.0</div>
          <div className="text-lg sm:text-xl opacity-60">Copyright (C) 1985 Zyber Corp.</div>
        </div>
        
        <TypingEffect text="> Initializing system..." playSound={voiceSettings.uiSoundsEnabled} />
        <TypingEffect text="> Loading neural network..." delay={1500} playSound={voiceSettings.uiSoundsEnabled} />
        <TypingEffect text="> Connection established." delay={2500} playSound={voiceSettings.uiSoundsEnabled} />
        
        <form onSubmit={handleSubmit} className="mt-8 animate-fade-in bg-transparent" style={{ animationDelay: '4s' }}>
          <div className="mb-3 opacity-70">{getPrompt()}</div>
          <div className="flex items-center cursor-text border-b border-primary/30 pb-1 bg-transparent" onClick={focusInput}>
            <span className="mr-2 opacity-50">$</span>
            <span>{displayedValue}</span>
            <span className="animate-blink">▋</span>
            <input
              ref={inputRef}
              id="authInput"
              type={step === 'USERNAME' ? 'text' : 'password'}
              value={inputValue}
              onChange={handleInputChange}
              className="absolute -left-[9999px] opacity-0 bg-transparent"
              autoFocus
              maxLength={20}
              autoCapitalize="none"
              autoComplete="off"
              style={{ background: 'transparent' }}
            />
          </div>
          {error && <p className="text-red-500 mt-4 text-lg opacity-80">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;