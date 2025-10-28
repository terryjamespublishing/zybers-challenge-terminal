import React from 'react';
import { User, ChallengeCategory, VoiceSettings } from '../types';
import TerminalWindow from './TerminalWindow';
import TypingEffect from './TypingEffect';
import { DECRYPTION_HUB_ITEM } from '../constants';

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
    <div className="p-4">
      <TypingEffect text={`> Welcome back, USER_ID: ${user.username.toUpperCase()}`} playSound={voiceSettings.uiSoundsEnabled} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 text-2xl" role="region" aria-label="User statistics">
        <div className="border border-primary p-2" aria-label={`Level ${user.level}`}>LEVEL: {user.level}</div>
        <div className="border border-primary p-2 relative" aria-label={`Experience points: ${user.xp} out of ${xpForNextLevel}`}>
          XP: {user.xp} / {xpForNextLevel}
          <div className="absolute bottom-0 left-0 h-1 bg-primary/30 w-full" role="progressbar" aria-valuenow={user.xp} aria-valuemin={0} aria-valuemax={xpForNextLevel}>
            <div className="h-1 bg-primary" style={{ width: `${(user.xp/xpForNextLevel)*100}%`}}></div>
          </div>
        </div>
        <div className="border border-primary p-2" aria-label={`Data bits: ${user.dataBits}`}>DATA BITS: {user.dataBits} DB</div>
        <div className="border border-primary p-2" aria-label={`Access keys: ${user.accessKeys}`}>ACCESS KEYS: {user.accessKeys} AK</div>
      </div>
      
      <TerminalWindow title="SELECT A CHALLENGE">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4" role="list" aria-label="Available challenges">
          {categories.map((cat) => (
            <button
              key={cat.title}
              onClick={() => onSelectChallenge(cat)}
              className="flex items-start p-4 border-2 border-transparent hover:border-primary hover:bg-primary/10 focus:border-primary focus:bg-primary/10 focus:outline-none transition-all duration-300 text-left"
              role="listitem"
              aria-label={`Start ${cat.title} challenge: ${cat.description}`}
            >
              <div className="mr-4 text-primary" aria-hidden="true">{cat.icon}</div>
              <div>
                <h3 className="text-2xl md:text-3xl mb-1">{cat.title}</h3>
                <p className="text-lg md:text-xl opacity-80">{cat.description}</p>
              </div>
            </button>
          ))}
            <button
              onClick={onOpenDecryptionHub}
              className="flex items-start p-4 border-2 border-transparent text-accent hover:border-accent hover:bg-accent/10 focus:border-accent focus:bg-accent/10 focus:outline-none transition-all duration-300 text-left"
              role="listitem"
              aria-label={`Open ${DECRYPTION_HUB_ITEM.title}: ${DECRYPTION_HUB_ITEM.description}`}
            >
              <div className="mr-4">{DECRYPTION_HUB_ITEM.icon}</div>
              <div>
                <h3 className="text-2xl md:text-3xl mb-1">{DECRYPTION_HUB_ITEM.title}</h3>
                <p className="text-lg md:text-xl opacity-80">{DECRYPTION_HUB_ITEM.description}</p>
              </div>
            </button>
           <button
              onClick={onStartLiveChat}
              className="flex items-start p-4 border-2 border-transparent text-accent hover:border-accent hover:bg-accent/10 focus:border-accent focus:bg-accent/10 focus:outline-none transition-all duration-300 text-left"
              role="listitem"
              aria-label="Start live voice chat with Zyber AI"
            >
              <div className="mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <p className="text-lg md:text-xl opacity-80">Engage in a real-time voice conversation with your AI tutor.</p>
              </div>
            </button>
        </div>
      </TerminalWindow>
    </div>
  );
};

export default DashboardScreen;