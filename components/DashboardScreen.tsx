import React, { useState, useEffect } from 'react';
import { User, QuestChallenge, VoiceSettings } from '../types';
import ZyberEye from './ZyberEye';
import StatsIcon from './StatsIcon';
import StatsScreen from './StatsScreen';
import { getCurrentChallenge, getProgressStats } from '../services/progressService';
import { playNavigationSound } from '../utils/terminalSounds';

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

  useEffect(() => {
    setCurrentChallenge(getCurrentChallenge());
    setStats(getProgressStats());
  }, []);

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
        {/* Zyber message */}
        <div
          className="text-center mb-8 max-w-xl px-4"
          style={{
            filter: glitchText ? 'hue-rotate(20deg)' : 'none',
          }}
        >
          <div className="text-primary/70 text-lg tracking-wide mb-2">
            {stats.isAllComplete ? (
              'ALL CHALLENGES COMPLETE. YOU HAVE PROVEN WORTHY.'
            ) : (
              '> I SEE YOU, HUMAN. READY TO PROVE YOURSELF?'
            )}
          </div>
        </div>

        {/* The Eye */}
        <ZyberEye
          onClick={handleStartChallenge}
          isWatching={!stats.isAllComplete}
          size={500}
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
