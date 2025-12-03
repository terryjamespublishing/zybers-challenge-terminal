import React, { useState, useEffect, useMemo } from 'react';
import { playKeyPressSound } from '../utils/uiSfx';
import { playTypingSound } from '../utils/terminalSounds';
import { stripEmotionTags } from '../utils/lowTechVoice';

interface TypingEffectProps {
  text: string;
  speed?: number;
  delay?: number;
  instant?: boolean;
  playSound?: boolean;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text, speed = 50, delay = 0, instant = false, playSound = false }) => {
  // Strip emotion tags from text for display (e.g., "[MOCKING] Hello" -> "Hello")
  const cleanText = useMemo(() => stripEmotionTags(text), [text]);

  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (instant) {
      setDisplayedText(cleanText);
      return;
    }

    const delayTimeout = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(delayTimeout);
  }, [delay, instant, cleanText]);

  useEffect(() => {
    if (!isStarted || instant) return;

    if (displayedText.length < cleanText.length) {
      const timeoutId = setTimeout(() => {
        if (playSound) {
          playTypingSound();
        }
        setDisplayedText(cleanText.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timeoutId);
    }
  }, [displayedText, cleanText, speed, isStarted, instant, playSound]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
};

export default TypingEffect;