import React, { useMemo } from 'react';
import { stripEmotionTags } from '../utils/lowTechVoice';

interface StreamingTypingEffectProps {
  text: string;
  charIndex: number; // How many characters to show (synced with speech)
  isComplete?: boolean; // If true, show full text
}

/**
 * StreamingTypingEffect - displays text progressively synchronized with speech
 * Unlike TypingEffect which animates on a timer, this component shows text
 * up to a given character index, which is updated by speech boundary events.
 */
const StreamingTypingEffect: React.FC<StreamingTypingEffectProps> = ({
  text,
  charIndex,
  isComplete = false
}) => {
  // Strip emotion tags from text for display
  const cleanText = useMemo(() => stripEmotionTags(text), [text]);

  // Determine how much text to show
  const displayedText = useMemo(() => {
    if (isComplete) {
      return cleanText;
    }
    // Show text up to the current character index, but extend to word boundary
    // This makes the streaming feel more natural
    let endIndex = Math.min(charIndex, cleanText.length);

    // If we're in the middle of a word, extend to the end of the word
    if (endIndex < cleanText.length && endIndex > 0) {
      const nextSpace = cleanText.indexOf(' ', endIndex);
      const nextNewline = cleanText.indexOf('\n', endIndex);

      // Find the nearest word boundary
      let nearestBoundary = cleanText.length;
      if (nextSpace >= 0 && nextSpace < nearestBoundary) nearestBoundary = nextSpace;
      if (nextNewline >= 0 && nextNewline < nearestBoundary) nearestBoundary = nextNewline;

      // Only extend if the word isn't too long (prevents showing huge chunks)
      if (nearestBoundary - endIndex < 15) {
        endIndex = nearestBoundary;
      }
    }

    return cleanText.slice(0, endIndex);
  }, [cleanText, charIndex, isComplete]);

  return <p className="whitespace-pre-wrap">{displayedText}</p>;
};

export default StreamingTypingEffect;
