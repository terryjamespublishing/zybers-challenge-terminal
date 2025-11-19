import React, { useState, useEffect } from 'react';
import { User, ChallengeCategory, VoiceSettings } from '../types';
import { DECRYPTION_HUB_ITEM } from '../constants';
import { playNavigationSound, playBeep, playKeystroke } from '../utils/terminalSounds';

interface DashboardScreenProps {
  user: User;
  categories: ChallengeCategory[];
  onSelectChallenge: (category: ChallengeCategory) => void;
  onStartLiveChat: () => void;
  onOpenDecryptionHub: () => void;
  voiceSettings: VoiceSettings;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, categories, onSelectChallenge, onStartLiveChat, onOpenDecryptionHub, voiceSettings }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [bootMessages, setBootMessages] = useState<string[]>([]);
  const [bootComplete, setBootComplete] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Cryptic boot sequence messages
  const crypticMessages = [
    '> ESTABLISHING SECURE TUNNEL...',
    '> BYPASSING FIREWALL LAYER 3...',
    '> INJECTING PAYLOAD...',
    '> ROOT ACCESS OBTAINED',
    '> LOADING ENCRYPTED MODULES...',
    '> TRACE PROTECTION: ACTIVE',
    '> LOCATION: MASKED',
    '',
    `> WELCOME BACK, ${user.username.toUpperCase()}`,
    '> YOU HAVE UNFINISHED BUSINESS',
    '',
    '> AWAITING COMMAND_'
  ];

  // Boot sequence effect
  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      if (messageIndex < crypticMessages.length) {
        setBootMessages(prev => [...prev, crypticMessages[messageIndex]]);
        if (voiceSettings.uiSoundsEnabled && crypticMessages[messageIndex].length > 0) {
          playKeystroke();
        }
        messageIndex++;
      } else {
        clearInterval(interval);
        setBootComplete(true);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [user.username, voiceSettings.uiSoundsEnabled]);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  const xpForNextLevel = user.level * 100;

  return (
    <div className="relative h-full">
      {/* Menu Toggle Icon - Top Right */}
      <button
        onClick={() => {
          if (voiceSettings.uiSoundsEnabled) playBeep(600, 0.05);
          setShowMenu(!showMenu);
        }}
        className="absolute top-0 right-0 z-50 opacity-30 hover:opacity-100 transition-opacity p-2"
        aria-label={showMenu ? 'Hide command menu' : 'Show command menu'}
        title="SYSTEM COMMANDS"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Main Terminal View */}
      <div className="font-mono text-xl leading-relaxed">
        {/* Boot Messages */}
        {bootMessages.map((msg, index) => (
          <div key={index} className={`${msg.includes('ROOT ACCESS') ? 'text-accent' : ''} ${msg === '' ? 'h-4' : ''}`}>
            {msg}
          </div>
        ))}

        {/* Blinking Cursor */}
        {bootComplete && (
          <div className="mt-4 text-2xl">
            <span className="opacity-70">&gt; </span>
            <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity`}>_</span>
          </div>
        )}
      </div>

      {/* Hidden Stats - Small and Subtle */}
      {bootComplete && (
        <div className="absolute bottom-0 left-0 text-sm opacity-30 space-y-1">
          <div>LVL:{user.level} | XP:{user.xp}/{xpForNextLevel} | BITS:{user.dataBits} | KEYS:{user.accessKeys}</div>
        </div>
      )}

      {/* Slide-out Menu Panel */}
      <div
        className={`absolute top-0 right-0 w-full max-w-md bg-bg/95 border border-primary/50 transform transition-transform duration-300 ${
          showMenu ? 'translate-x-0' : 'translate-x-full'
        } z-40`}
        style={{ minHeight: '100%' }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="text-xl opacity-70">&gt; SYSTEM COMMANDS</div>
            <button
              onClick={() => {
                if (voiceSettings.uiSoundsEnabled) playBeep(400, 0.05);
                setShowMenu(false);
              }}
              className="text-2xl opacity-50 hover:opacity-100"
              aria-label="Close menu"
            >
              [X]
            </button>
          </div>

          <div className="space-y-2 text-xl" role="list" aria-label="Available operations">
            {categories.map((cat, index) => (
              <button
                key={cat.title}
                onClick={() => {
                  if (voiceSettings.uiSoundsEnabled) playNavigationSound();
                  onSelectChallenge(cat);
                }}
                onMouseEnter={() => { if (voiceSettings.uiSoundsEnabled) playBeep(400, 0.03); }}
                className="block w-full text-left hover:bg-primary/10 hover:text-accent focus:bg-primary/10 focus:text-accent focus:outline-none transition-colors py-1 px-2"
                role="listitem"
              >
                <span className="opacity-50">[{index + 1}]</span> {cat.title.toUpperCase()}
              </button>
            ))}

            <div className="border-t border-primary/20 my-2"></div>

            <button
              onClick={() => {
                if (voiceSettings.uiSoundsEnabled) playNavigationSound();
                onOpenDecryptionHub();
              }}
              onMouseEnter={() => { if (voiceSettings.uiSoundsEnabled) playBeep(400, 0.03); }}
              className="block w-full text-left hover:bg-primary/10 hover:text-accent focus:bg-primary/10 focus:text-accent focus:outline-none transition-colors py-1 px-2"
              role="listitem"
            >
              <span className="opacity-50">[{categories.length + 1}]</span> {DECRYPTION_HUB_ITEM.title.toUpperCase()}
            </button>

            <button
              onClick={() => {
                if (voiceSettings.uiSoundsEnabled) playNavigationSound();
                onStartLiveChat();
              }}
              onMouseEnter={() => { if (voiceSettings.uiSoundsEnabled) playBeep(400, 0.03); }}
              className="block w-full text-left hover:bg-primary/10 hover:text-accent focus:bg-primary/10 focus:text-accent focus:outline-none transition-colors py-1 px-2"
              role="listitem"
            >
              <span className="opacity-50">[{categories.length + 2}]</span> VOICE_INTERFACE
            </button>
          </div>

          {/* Compact Stats in Menu */}
          <div className="mt-6 pt-4 border-t border-primary/20 text-base opacity-60">
            <div>OPERATOR: {user.username.toUpperCase()}</div>
            <div>CLEARANCE: LEVEL {user.level}</div>
            <div>XP: {user.xp}/{xpForNextLevel}</div>
            <div>DATA_BITS: {user.dataBits}</div>
            <div>ACCESS_KEYS: {user.accessKeys}</div>
          </div>
        </div>
      </div>

      {/* Overlay when menu is open */}
      {showMenu && (
        <div
          className="absolute inset-0 bg-black/50 z-30"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default DashboardScreen;
