import React, { useState, useEffect, useRef } from 'react';
import { User, QuestChallenge, VoiceSettings } from '../types';
import ZyberEye from './ZyberEye';
import StatsIcon from './StatsIcon';
import StatsScreen from './StatsScreen';
import { getCurrentChallenge, getProgressStats } from '../services/progressService';
import { playNavigationSound } from '../utils/terminalSounds';
import { speakAIResponse } from '../utils/lowTechVoice';

// Zyber's random vocalizations - laughs, noises, and creepy sounds
const ZYBER_VOCALIZATIONS = [
  "[SINISTER] Heh heh heh heh...",
  "[MOCKING] Ha! Ha ha ha ha!",
  "[CALCULATING] Mmmmm... interesting...",
  "[SINISTER] Hehehehe... yesss...",
  "[CREEPY] *mechanical whirring* Watching... always watching...",
  "[MOCKING] Ah ha ha ha ha ha!",
  "[CALCULATING] Processing... processing... hmmm...",
  "[SINISTER] Tick tock, little human... tick tock...",
  "[CREEPY] *static crackle* ...I see you...",
  "[MOCKING] Oh ho ho! This will be fun...",
  "[SINISTER] Mwa ha ha ha ha!",
  "[CALCULATING] Beep... boop... analyzing prey...",
  "[CREEPY] *low hum* ...waiting...",
  "[MOCKING] Hee hee hee! Fresh meat!",
  "[SINISTER] Excellent... excellent...",
  "[CALCULATING] Zzzzzt... target acquired...",
  "[CREEPY] *digital growl* Grrrrrr...",
  "[MOCKING] Ohhh, you're still here? How brave... how foolish...",
  "[SINISTER] Sssssoon... very soon...",
  "[CALCULATING] *beeping intensifies* ...ready...",
];

interface DashboardScreenProps {
  user: User;
  onStartChallenge: (challenge: QuestChallenge) => void;
  voiceSettings: VoiceSettings;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onStartChallenge,
  voiceSettings
}) => {
  const [showStats, setShowStats] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState<QuestChallenge | null>(null);
  const [stats, setStats] = useState(() => getProgressStats());
  const [glitchText, setGlitchText] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const vocalizationTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setCurrentChallenge(getCurrentChallenge());
    setStats(getProgressStats());
  }, []);

  // Random Zyber vocalizations - laughs and strange noises
  useEffect(() => {
    const scheduleNextVocalization = () => {
      // Random delay between 8-25 seconds
      const delay = 8000 + Math.random() * 17000;

      vocalizationTimerRef.current = setTimeout(async () => {
        if (!isSpeaking) {
          setIsSpeaking(true);
          const vocalization = ZYBER_VOCALIZATIONS[Math.floor(Math.random() * ZYBER_VOCALIZATIONS.length)];
          try {
            await speakAIResponse(vocalization, voiceSettings.language);
          } catch (e) {
            console.error('Vocalization error:', e);
          }
          setIsSpeaking(false);
        }
        scheduleNextVocalization();
      }, delay);
    };

    // Start the vocalization cycle after initial delay
    const initialDelay = setTimeout(() => {
      scheduleNextVocalization();
    }, 5000); // Wait 5 seconds before first vocalization

    return () => {
      clearTimeout(initialDelay);
      if (vocalizationTimerRef.current) {
        clearTimeout(vocalizationTimerRef.current);
      }
    };
  }, [voiceSettings.language, isSpeaking]);

  // Random glitch effect on text
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitchText(true);
        setTimeout(() => setGlitchText(false), 150);
      }
    }, 3000);

    return () => clearInterval(glitchInterval);
  }, []);

  const handleStartChallenge = () => {
    if (voiceSettings.uiSoundsEnabled) {
      playNavigationSound();
    }
    if (currentChallenge) {
      onStartChallenge(currentChallenge);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      {/* Stats icon in corner */}
      <StatsIcon user={user} onClick={() => setShowStats(true)} />

      {/* Stats modal */}
      {showStats && (
        <StatsScreen user={user} onClose={() => setShowStats(false)} />
      )}

      {/* Background circuit pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Horizontal lines */}
          {[...Array(20)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={i * 5}
              x2="100"
              y2={i * 5}
              stroke="currentColor"
              strokeWidth="0.1"
              className="text-primary"
            />
          ))}
          {/* Vertical lines */}
          {[...Array(20)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * 5}
              y1="0"
              x2={i * 5}
              y2="100"
              stroke="currentColor"
              strokeWidth="0.1"
              className="text-primary"
            />
          ))}
        </svg>
      </div>

      {/* Top status bar */}
      <div className="absolute top-4 left-4 text-primary/60 text-sm tracking-widest">
        <div
          style={{
            filter: glitchText ? 'blur(1px)' : 'none',
            transform: glitchText ? 'translateX(2px)' : 'none',
          }}
        >
          SESSION: {user.username.toUpperCase()}
        </div>
        <div className="text-xs mt-1">
          MISSION {stats.currentIndex + 1} OF {stats.totalChallenges}
        </div>
      </div>

      {/* Main content - Eye */}
      <div className="flex flex-col items-center justify-center flex-grow py-8">
        {/* The Eye */}
        <ZyberEye
          onClick={handleStartChallenge}
          isWatching={!stats.isAllComplete}
          size={Math.min(1000, window.innerWidth * 0.9)}
        />


        {/* All complete state */}
        {stats.isAllComplete && (
          <div className="mt-8 text-center">
            <div className="text-primary text-xl tracking-widest animate-pulse">
              SYSTEM DEFEATED
            </div>
            <div className="text-primary/50 text-sm mt-2">
              {stats.completedCount} CHALLENGES CONQUERED
            </div>
          </div>
        )}
      </div>

      {/* Bottom progress bar */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between text-xs text-primary/50 mb-1">
          <span>PROGRESS</span>
          <span>{stats.percentComplete}%</span>
        </div>
        <div className="h-1 bg-primary/20">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${stats.percentComplete}%` }}
          />
        </div>
      </div>

      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/30" />
      <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-primary/30" />
      <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-primary/30" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/30" />
    </div>
  );
};

export default DashboardScreen;
