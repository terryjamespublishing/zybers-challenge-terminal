import React from 'react';
import { User, ChallengeCategory, VoiceSettings } from '../types';
import TerminalWindow from './TerminalWindow';
import TypingEffect from './TypingEffect';
import { DECRYPTION_HUB_ITEM } from '../constants';
import { playNavigationSound, playBeep } from '../utils/terminalSounds';

interface DashboardScreenProps {
  user: User;
  categories: ChallengeCategory[];
  onSelectChallenge: (category: ChallengeCategory) => void;
  onStartLiveChat: () => void;
  onOpenDecryptionHub: () => void;
  voiceSettings: VoiceSettings;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, categories, onSelectChallenge, onStartLiveChat, onOpenDecryptionHub, voiceSettings }) => {
  const xpForNextLevel = user.level * 100;

  return (
    <div>
      <div className="mb-6 text-3xl">
        <TypingEffect text={`> TERMINAL SESSION ACTIVE - USER: ${user.username.toUpperCase()}`} playSound={voiceSettings.uiSoundsEnabled} />
      </div>
      
      <div className="mb-6 text-3xl space-y-3" role="region" aria-label="User statistics">
        <div className="flex justify-between" aria-label={`Level ${user.level}`}>
          <span className="opacity-70">LEVEL:</span>
          <span>{user.level}</span>
        </div>
        <div className="flex justify-between" aria-label={`Experience points: ${user.xp} out of ${xpForNextLevel}`}>
          <span className="opacity-70">EXPERIENCE:</span>
          <span>{user.xp} / {xpForNextLevel}</span>
        </div>
        <div className="relative h-2 bg-primary/20 my-2" role="progressbar" aria-valuenow={user.xp} aria-valuemin={0} aria-valuemax={xpForNextLevel}>
          <div className="h-full bg-primary" style={{ width: `${(user.xp/xpForNextLevel)*100}%`}}></div>
        </div>
        <div className="flex justify-between" aria-label={`Data bits: ${user.dataBits}`}>
          <span className="opacity-70">DATA_BITS:</span>
          <span>{user.dataBits}</span>
        </div>
        <div className="flex justify-between" aria-label={`Access keys: ${user.accessKeys}`}>
          <span className="opacity-70">ACCESS_KEYS:</span>
          <span>{user.accessKeys}</span>
        </div>
      </div>
      
      <div className="border-t border-primary/30 pt-4 mt-6">
        <div className="text-3xl mb-4 opacity-70">&gt; SELECT OPERATION:</div>
        <div className="space-y-4 text-3xl" role="list" aria-label="Available operations">
          
          <button
            onClick={() => {
              if (voiceSettings.uiSoundsEnabled) playNavigationSound();
              onStartLiveChat();
            }}
            onMouseEnter={() => { if (voiceSettings.uiSoundsEnabled) playBeep(400, 0.03); }}
            className="block w-full text-left hover:bg-primary/10 hover:text-accent focus:bg-primary/10 focus:text-accent focus:outline-none transition-colors py-2 px-3"
            role="listitem"
            aria-label="Start live voice chat"
          >
            <div className="flex items-start gap-3">
              <span className="opacity-50">[1]</span>
              <div className="flex-1">
                <div className="uppercase tracking-wide text-3xl">ZYBER AWAITS</div>
                <div className="text-2xl opacity-60 mt-1">Real-time voice communication</div>
              </div>
            </div>
          </button>

          <div className="border-t border-primary/20 my-4"></div>

          {categories.slice(0, 6).map((cat, index) => (
            <button
              key={cat.title}
              onClick={() => {
                if (voiceSettings.uiSoundsEnabled) playNavigationSound();
                onSelectChallenge(cat);
              }}
              onMouseEnter={() => { if (voiceSettings.uiSoundsEnabled) playBeep(400, 0.03); }}
              className="block w-full text-left hover:bg-primary/10 hover:text-accent focus:bg-primary/10 focus:text-accent focus:outline-none transition-colors py-2 px-3"
              role="listitem"
              aria-label={`Start ${cat.title} challenge: ${cat.description}`}
            >
              <div className="flex items-start gap-3">
                <span className="opacity-50">[{index + 2}]</span>
                <div className="flex-1">
                  <div className="uppercase tracking-wide text-3xl">{cat.title}</div>
                  <div className="text-2xl opacity-60 mt-1">{cat.description}</div>
                </div>
              </div>
            </button>
          ))}
          
          <div className="border-t border-primary/20 my-4"></div>
          
          <button
            onClick={() => {
              if (voiceSettings.uiSoundsEnabled) playNavigationSound();
              onOpenDecryptionHub();
            }}
            onMouseEnter={() => { if (voiceSettings.uiSoundsEnabled) playBeep(400, 0.03); }}
            className="block w-full text-left hover:bg-primary/10 hover:text-accent focus:bg-primary/10 focus:text-accent focus:outline-none transition-colors py-2 px-3"
            role="listitem"
            aria-label={`Open ${DECRYPTION_HUB_ITEM.title}`}
          >
            <div className="flex items-start gap-3">
              <span className="opacity-50">[8]</span>
              <div className="flex-1">
                <div className="uppercase tracking-wide text-3xl">{DECRYPTION_HUB_ITEM.title}</div>
                <div className="text-2xl opacity-60 mt-1">{DECRYPTION_HUB_ITEM.description}</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;