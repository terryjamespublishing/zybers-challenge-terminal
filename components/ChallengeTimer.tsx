import React, { useState, useEffect, useCallback } from 'react';

interface ChallengeTimerProps {
  durationMinutes?: number;
  onTimeUp: () => void;
  isPaused?: boolean;
  onTick?: (remainingSeconds: number) => void;
}

const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  durationMinutes = 30,
  onTimeUp,
  isPaused = false,
  onTick,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(durationMinutes * 60);

  // Timer logic
  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        if (onTick) onTick(newValue);
        if (newValue <= 0) {
          onTimeUp();
          return 0;
        }
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, remainingSeconds, onTimeUp, onTick]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const totalSeconds = durationMinutes * 60;
  const progressPercent = (remainingSeconds / totalSeconds) * 100;

  // Calculate color based on time remaining (gradual transition)
  // Green (100-50%) -> Yellow (50-15%) -> Red (15-0%)
  const getBackgroundColor = (): string => {
    const percent = progressPercent;

    if (percent > 50) {
      // Green zone - fade from dark green
      const intensity = 0.03 + ((100 - percent) / 100) * 0.05;
      return `rgba(0, 255, 65, ${intensity})`;
    } else if (percent > 15) {
      // Yellow/amber zone - transition from green to yellow to orange
      const t = (50 - percent) / 35; // 0 to 1 as we go from 50% to 15%
      const r = Math.floor(0 + t * 245);
      const g = Math.floor(255 - t * 97);
      const b = Math.floor(65 - t * 54);
      const intensity = 0.08 + t * 0.07;
      return `rgba(${r}, ${g}, ${b}, ${intensity})`;
    } else {
      // Red zone - intense red
      const t = (15 - percent) / 15; // 0 to 1 as we approach 0
      const intensity = 0.15 + t * 0.15;
      return `rgba(239, 68, 68, ${intensity})`;
    }
  };

  const getTimerColor = (): { text: string; glow: string; border: string } => {
    if (progressPercent <= 15) {
      return {
        text: 'text-red-500',
        glow: 'rgba(239, 68, 68, 0.8)',
        border: 'rgb(239, 68, 68)',
      };
    } else if (progressPercent <= 50) {
      return {
        text: 'text-amber-400',
        glow: 'rgba(245, 158, 11, 0.6)',
        border: 'rgb(245, 158, 11)',
      };
    }
    return {
      text: 'text-primary',
      glow: 'rgba(0, 255, 65, 0.5)',
      border: 'rgb(0, 255, 65)',
    };
  };

  const colors = getTimerColor();
  const isCritical = progressPercent <= 15;

  return (
    <>
      {/* Full-screen background timer */}
      <div
        className="fixed inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: getBackgroundColor(),
          zIndex: 1,
        }}
      >
        {/* Giant faded time in background */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ opacity: 0.08 + (1 - progressPercent / 100) * 0.12 }}
        >
          <div
            className={`text-[35vw] font-bold tracking-[0.1em] ${colors.text}`}
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              textShadow: `0 0 100px ${colors.glow}`,
              animation: isCritical ? 'bgTimerPulse 1s ease-in-out infinite' : 'none',
              letterSpacing: '0.05em',
            }}
          >
            {formatTime(remainingSeconds)}
          </div>
        </div>

        {/* Vignette effect that intensifies as time runs out */}
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 40%, ${getBackgroundColor()} 100%)`,
            opacity: 0.5 + (1 - progressPercent / 100) * 0.5,
          }}
        />
      </div>

      {/* Footer time indicator */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(0, 0, 0, 0.9)',
          borderTop: `2px solid ${colors.border}`,
          boxShadow: `0 -5px 30px ${colors.glow}`,
        }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Status */}
          <div className={`text-sm tracking-widest ${colors.text}`}>
            {isCritical ? '⚠ CRITICAL' : progressPercent <= 50 ? '⚠ WARNING' : 'SYS://ACTIVE'}
          </div>

          {/* Center: Time */}
          <div
            className={`text-4xl md:text-5xl tracking-[0.15em] ${colors.text}`}
            style={{
              fontFamily: "'VT323', 'Courier New', monospace",
              textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`,
              animation: isCritical ? 'footerFlicker 0.2s ease-in-out infinite' : 'none',
            }}
          >
            {formatTime(remainingSeconds)}
          </div>

          {/* Right: Progress */}
          <div className={`text-sm tracking-widest ${colors.text}`}>
            {Math.floor(progressPercent)}% REMAINING
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-black/50">
          <div
            className="h-full transition-all duration-1000"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${colors.border}88, ${colors.border})`,
              boxShadow: `0 0 10px ${colors.glow}`,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes bgTimerPulse {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.12; }
        }
        @keyframes footerFlicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  );
};

export default ChallengeTimer;
