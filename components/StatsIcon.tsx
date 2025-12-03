import React, { useState } from 'react';
import { User } from '../types';

interface StatsIconProps {
  user: User;
  onClick: () => void;
}

const StatsIcon: React.FC<StatsIconProps> = ({ user, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative group"
        aria-label="View user stats"
      >
        {/* Main icon container */}
        <div
          className="w-12 h-12 border-2 border-primary rounded-sm flex items-center justify-center transition-all duration-300"
          style={{
            background: isHovered
              ? 'rgba(0, 255, 65, 0.15)'
              : 'rgba(0, 10, 0, 0.8)',
            boxShadow: isHovered
              ? '0 0 15px rgba(0, 255, 65, 0.5), inset 0 0 10px rgba(0, 255, 65, 0.2)'
              : '0 0 5px rgba(0, 255, 65, 0.3)',
          }}
        >
          {/* Hacker icon - stylized user/terminal */}
          <svg
            viewBox="0 0 24 24"
            className="w-6 h-6 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {/* Terminal bracket */}
            <path d="M4 4 L2 4 L2 20 L4 20" />
            <path d="M20 4 L22 4 L22 20 L20 20" />
            {/* Skull-like face */}
            <circle cx="12" cy="10" r="5" />
            <circle cx="10" cy="9" r="1.5" fill="currentColor" />
            <circle cx="14" cy="9" r="1.5" fill="currentColor" />
            <path d="M10 13 L14 13" />
            {/* Level indicator bars */}
            <path d="M8 17 L16 17" />
            <path d="M9 19 L15 19" />
          </svg>
        </div>

        {/* Scanline effect */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.2) 2px, rgba(0, 0, 0, 0.2) 4px)',
          }}
        />

        {/* Corner decorations */}
        <div className="absolute -top-1 -left-1 w-2 h-2 border-l border-t border-primary/50" />
        <div className="absolute -top-1 -right-1 w-2 h-2 border-r border-t border-primary/50" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 border-l border-b border-primary/50" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 border-r border-b border-primary/50" />

        {/* Hover tooltip */}
        <div
          className={`absolute right-full mr-3 top-1/2 -translate-y-1/2 whitespace-nowrap transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
          }`}
        >
          <div
            className="px-3 py-2 border border-primary/50 text-primary text-sm"
            style={{
              background: 'rgba(0, 10, 0, 0.95)',
              boxShadow: '0 0 10px rgba(0, 255, 65, 0.2)',
            }}
          >
            <div className="font-bold tracking-wider">{user.username.toUpperCase()}</div>
            <div className="text-primary/70 text-xs mt-1">
              LVL {user.level} • {user.xp} XP
            </div>
          </div>
          {/* Arrow */}
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full"
            style={{
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderLeft: '6px solid rgba(0, 255, 65, 0.5)',
            }}
          />
        </div>
      </button>
    </div>
  );
};

export default StatsIcon;
