import React, { useState, useEffect } from 'react';
import { playKeyPressSound } from '../utils/uiSfx';
import { playTypingSound } from '../utils/terminalSounds';

interface TypingEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  instant?: boolean;
  playSound?: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 50, delay = 0, instant = false, playSound = false }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (instant) {
      setDisplayedText(text);
      return;
    }

    const delayTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [delay, instant, text]);

  useEffect(() => {
    if (!isStarted || instant) return;

    if (displayedText.length < text.length) {
      const timeoutId = setTimeout(() => {
        if (playSound) {
          playTypingSound();
        }
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, text, speed, isStarted, instant, playSound]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
};

export default TypingEffect;