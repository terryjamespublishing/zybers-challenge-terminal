import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChallengeCategory, Message, VoiceSettings } from '../types';
import * as geminiService from '../services/geminiService';
import TerminalWindow from './TerminalWindow';
import TypingEffect from './TypingEffect';
import { playKeyPressSound, playSubmitSound } from '../utils/uiSfx';

interface ChallengeScreenProps {
  challenge: ChallengeCategory;
  onExit: () => void;
  addRewards: (rewards: { xp: number; dataBits: number; accessKeys?: number }) => void;
  voiceSettings: VoiceSettings;
  onVoiceSettingsChange: (settings: VoiceSettings) => void;
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


const ChallengeScreen: React.FC<ChallengeScreenProps> = ({ challenge, onExit, addRewards, voiceSettings, onVoiceSettingsChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstAttempt, setIsFirstAttempt] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [playingMessage, setPlayingMessage] = useState<Message | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioFxNodesRef = useRef<{ oscillator: OscillatorNode } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Safari requires a user gesture to create an AudioContext
    const initAudio = () => {
        if (!audioContext) {
            const context = new (window.AudioContext || (window as any).webkitAudioContext)();
            setAudioContext(context);
        }
        document.removeEventListener('click', initAudio);
    };
    document.addEventListener('click', initAudio);
    return () => document.removeEventListener('click', initAudio);
  }, [audioContext]);


  const playAudio = useCallback((message: Message) => {
    if (!audioContext || !message.audio) return;
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    
    if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        if (audioFxNodesRef.current) {
            audioFxNodesRef.current.oscillator.stop();
        }
    }
    
    let finalNode: AudioNode = audioContext.destination;
    let carrierOscillator: OscillatorNode | null = null;
    
    if (voiceSettings.vocoderEnabled) {
        const modulatorGain = audioContext.createGain();
        modulatorGain.connect(audioContext.destination);
    
        carrierOscillator = audioContext.createOscillator();
        carrierOscillator.type = 'sawtooth';
        carrierOscillator.frequency.value = voiceSettings.vocoderFrequency;
    
        const carrierGain = audioContext.createGain();
        carrierGain.gain.value = 0.7;
    
        carrierOscillator.connect(carrierGain);
        carrierGain.connect(modulatorGain.gain);
        carrierOscillator.start();
        
        finalNode = modulatorGain;
    }

    audioFxNodesRef.current = carrierOscillator ? { oscillator: carrierOscillator } : null;
    
    const source = audioContext.createBufferSource();
    source.buffer = message.audio;
    source.connect(finalNode);
    source.onended = () => {
        setPlayingMessage(null);
        audioSourceRef.current = null;
        if (carrierOscillator) carrierOscillator.stop();
        audioFxNodesRef.current = null;
    }
    source.start(0);
    audioSourceRef.current = source;
    setPlayingMessage(message);
  }, [audioContext, voiceSettings]);

  const addMessage = useCallback(async (sender: 'user' | 'Zyber', text: string, spokenText?: string) => {
    let audio: AudioBuffer | undefined = undefined;
    const textToSpeak = spokenText || text;

    if (sender === 'Zyber' && audioContext && voiceSettings.voiceOutputEnabled) {
        try {
            const audioBuffer = await geminiService.textToSpeech(textToSpeak, audioContext, voiceSettings);
            audio = audioBuffer;
        } catch (error) {
            console.error("TTS Error:", error);
        }
    }
    const newMessage: Message = { sender, text, spokenText, audio };
    setMessages(prev => [...prev, newMessage]);
    if (audio) {
        playAudio(newMessage);
    }
  }, [audioContext, playAudio, voiceSettings]);

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

    // Check for QUIET command
    if (currentInput.toUpperCase() === 'QUIET') {
      const newVoiceEnabled = !voiceSettings.voiceOutputEnabled;
      onVoiceSettingsChange({ ...voiceSettings, voiceOutputEnabled: newVoiceEnabled });
      addMessage('user', currentInput);
      setUserInput('');
      const statusMsg = newVoiceEnabled
        ? '> VOICE OUTPUT ENABLED.▋'
        : '> VOICE OUTPUT DISABLED.▋';
      await addMessage('Zyber', statusMsg);
      return;
    }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (voiceSettings.uiSoundsEnabled) {
      playKeyPressSound();
    }
    setUserInput(e.target.value);
  };

  return (
    <TerminalWindow title={`SESSION: ${challenge.title.toUpperCase()}`} onExit={onExit}>
      <div className="flex flex-col text-xl sm:text-2xl md:text-3xl h-full">
        <div className="flex-grow overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="mb-3">
              <div className="flex items-start gap-2">
                <span className={`${msg.sender === 'user' ? 'text-accent' : 'text-primary'} opacity-70`}>
                  {msg.sender === 'user' ? '>' : '>>'}
                </span>
                <div className="flex-1">
                  {msg.sender === 'Zyber' && msg.audio && (
                    <button onClick={() => playAudio(msg)} className="focus:outline-none inline-block mr-2 opacity-70 hover:opacity-100">
                      <SoundIcon isPlaying={playingMessage === msg} />
                    </button>
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
        <form onSubmit={handleSubmit} className="mt-4 pt-3 flex-shrink-0">
          <div className="flex items-center cursor-text text-2xl" onClick={focusInput}>
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