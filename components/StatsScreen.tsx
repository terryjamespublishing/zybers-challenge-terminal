import React from 'react';
import { User } from '../types';
import { getProgressStats } from '../services/progressService';

interface StatsScreenProps {
  user: User;
  onClose: () => void;
}

const StatsScreen: React.FC<StatsScreenProps> = ({ user, onClose }) => {
  const stats = getProgressStats();
  const xpForNextLevel = user.level * 100;

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Stats panel */}
      <div
        className="relative border-2 border-primary p-6 max-w-lg w-full mx-4"
        style={{
          background: 'rgba(0, 10, 0, 0.95)',
          boxShadow: '0 0 30px rgba(0, 255, 65, 0.3), inset 0 0 20px rgba(0, 255, 65, 0.1)',
        }}
      >
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.2) 2px, rgba(0, 0, 0, 0.2) 4px)',
          }}
        />

        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-primary" />
        <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-primary" />
        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-primary" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-primary" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl text-primary tracking-widest">
            &gt; USER_PROFILE
          </h2>
          <button
            onClick={onClose}
            className="text-primary hover:text-accent transition-colors text-xl"
          >
            [X]
          </button>
        </div>

        {/* User info */}
        <div className="border border-primary/30 p-4 mb-4">
          <div className="text-xl text-primary tracking-wide mb-3">
            {user.username.toUpperCase()}
          </div>

          {/* Level and XP */}
          <div className="space-y-2 text-lg">
            <div className="flex justify-between">
              <span className="text-primary/60">LEVEL:</span>
              <span className="text-primary">{user.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-primary/60">XP:</span>
              <span className="text-primary">{user.xp} / {xpForNextLevel}</span>
            </div>
            <div className="h-2 bg-primary/20 mt-2">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(user.xp / xpForNextLevel) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-primary/30 p-3 text-center">
            <div className="text-2xl text-primary">{user.dataBits}</div>
            <div className="text-sm text-primary/60">DATA_BITS</div>
          </div>
          <div className="border border-primary/30 p-3 text-center">
            <div className="text-2xl text-primary">{user.accessKeys}</div>
            <div className="text-sm text-primary/60">ACCESS_KEYS</div>
          </div>
        </div>

        {/* Challenge progress */}
        <div className="border border-primary/30 p-4 mb-4">
          <div className="text-lg text-primary mb-3">MISSION_PROGRESS</div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-primary/60">CHALLENGES COMPLETED:</span>
              <span className="text-primary">{stats.completedCount} / {stats.totalChallenges}</span>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-primary/20">
              <div
                className="h-full transition-all"
                style={{
                  width: `${stats.percentComplete}%`,
                  background: 'linear-gradient(90deg, rgba(0, 255, 65, 0.5), rgba(0, 255, 65, 0.9))',
                }}
              />
            </div>
            <div className="text-right text-primary/60">{stats.percentComplete}%</div>

            {/* By difficulty */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="text-center">
                <div className="text-primary">{stats.completedByDifficulty.easy}</div>
                <div className="text-xs text-primary/50">EASY</div>
              </div>
              <div className="text-center">
                <div className="text-accent">{stats.completedByDifficulty.medium}</div>
                <div className="text-xs text-accent/50">MEDIUM</div>
              </div>
              <div className="text-center">
                <div className="text-red-400">{stats.completedByDifficulty.hard}</div>
                <div className="text-xs text-red-400/50">HARD</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-primary/30 p-3 text-center">
            <div className="text-xl text-primary">{stats.streakDays}</div>
            <div className="text-xs text-primary/60">DAY STREAK</div>
          </div>
          <div className="border border-primary/30 p-3 text-center">
            <div className="text-xl text-primary">{formatTime(stats.totalTimeSpent)}</div>
            <div className="text-xs text-primary/60">TIME PLAYED</div>
          </div>
        </div>

        {/* Current challenge preview */}
        {stats.currentChallenge && (
          <div className="mt-4 border border-accent/30 p-3">
            <div className="text-sm text-accent/60 mb-1">NEXT MISSION:</div>
            <div className="text-accent">{stats.currentChallenge.name}</div>
            <div className="text-xs text-accent/50 mt-1">
              {stats.currentChallenge.category} • DIFFICULTY {stats.currentChallenge.difficulty}
            </div>
          </div>
        )}

        {stats.isAllComplete && (
          <div className="mt-4 border border-primary p-3 text-center">
            <div className="text-primary animate-pulse">
              ALL CHALLENGES COMPLETE
            </div>
            <div className="text-sm text-primary/60 mt-1">
              YOU HAVE DEFEATED ZYBER
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsScreen;
