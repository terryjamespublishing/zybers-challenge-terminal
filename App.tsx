import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import ChallengeScreen from './components/ChallengeScreen';
import LiveScreen from './components/LiveScreen';
import DecryptionHubScreen from './components/DecryptionHubScreen';
import BootScreen from './components/BootScreen';
import { Screen, User, ChallengeCategory, VoiceSettings } from './types';
import { CHALLENGE_CATEGORIES } from './constants';
import SettingsIcon from './components/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { saveUserData } from './services/userService';
import { loadVoiceSettings, saveVoiceSettings } from './services/settingsService';
import { useToast } from './hooks/useToast';
import { playStartupSound } from './utils/terminalSounds';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>(Screen.Login);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeCategory | null>(null);
  const [showBoot, setShowBoot] = useState(true);
  
  // Settings State - Load from localStorage on mount
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings);

  // Toast notifications
  const { toasts, hideToast, showSuccess } = useToast();

  // Persist voice settings whenever they change
  useEffect(() => {
    saveVoiceSettings(voiceSettings);
  }, [voiceSettings]);

  // Play startup sound on mount
  useEffect(() => {
    const hasBooted = sessionStorage.getItem('hasBooted');
    if (hasBooted) {
      setShowBoot(false);
    } else {
      if (voiceSettings.uiSoundsEnabled) {
        setTimeout(() => playStartupSound(), 100);
      }
    }
  }, [voiceSettings.uiSoundsEnabled]);

  const handleBootComplete = () => {
    sessionStorage.setItem('hasBooted', 'true');
    setShowBoot(false);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setScreen(Screen.Dashboard);
    showSuccess(`ACCESS GRANTED. WELCOME, ${loggedInUser.username.toUpperCase()}.`);
  };

  const handleLogout = () => {
    setUser(null);
    setScreen(Screen.Login);
  };

  const handleSelectChallenge = (category: ChallengeCategory) => {
    setCurrentChallenge(category);
    setScreen(Screen.Challenge);
  };

  const handleOpenDecryptionHub = () => {
    setScreen(Screen.DecryptionHub);
  };

  const handleStartLiveChat = () => {
    setScreen(Screen.Live);
  };

  const handleExit = () => {
    setCurrentChallenge(null);
    setScreen(Screen.Dashboard);
  };

  const addRewards = useCallback((rewards: { xp: number; dataBits: number; accessKeys?: number }) => {
    setUser(currentUser => {
        if (!currentUser) return null;

        const newXp = currentUser.xp + rewards.xp;
        const xpForNextLevel = currentUser.level * 100;
        
        const updatedUser: User = {
            ...currentUser,
            xp: newXp,
            dataBits: currentUser.dataBits + rewards.dataBits,
            accessKeys: currentUser.accessKeys + (rewards.accessKeys || 0),
        };
        
        if (newXp >= xpForNextLevel) {
            updatedUser.level += 1;
            updatedUser.xp = newXp - xpForNextLevel; // Reset XP for new level
             // You could award a "System Upgrade" here, e.g., a free theme or avatar unlock.
        }

        saveUserData(updatedUser);
        return updatedUser;
    });
  }, []);
  
  const renderScreen = () => {
    switch (screen) {
      case Screen.Login:
        return <LoginScreen onLogin={handleLogin} voiceSettings={voiceSettings} />;
      case Screen.Dashboard:
        if (!user) {
            setScreen(Screen.Login);
            return null;
        }
        return (
          <DashboardScreen
            user={user}
            categories={CHALLENGE_CATEGORIES}
            onSelectChallenge={handleSelectChallenge}
            onStartLiveChat={handleStartLiveChat}
            onOpenDecryptionHub={handleOpenDecryptionHub}
            voiceSettings={voiceSettings}
          />
        );
      case Screen.Challenge:
        if (!currentChallenge) {
            setScreen(Screen.Dashboard);
            return null;
        }
        return (
          <ChallengeScreen
            challenge={currentChallenge}
            onExit={handleExit}
            addRewards={addRewards}
            voiceSettings={voiceSettings}
          />
        );
      case Screen.Live:
        return <LiveScreen onExit={handleExit} voiceSettings={voiceSettings} />;
      case Screen.DecryptionHub:
        if (!user) {
            setScreen(Screen.Login);
            return null;
        }
        return (
          <DecryptionHubScreen 
            onExit={handleExit}
            user={user}
            voiceSettings={voiceSettings}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} voiceSettings={voiceSettings} />;
    }
  };

  return (
    <>
      {showBoot && <BootScreen onComplete={handleBootComplete} />}
      
      <div className="crt-screen min-h-screen selection:bg-primary selection:text-bg flex flex-col" style={{ padding: '2vh 3vw' }}>
        <div className="crt-vignette"></div>
        <div className="w-full flex-grow relative">
          {screen === Screen.Dashboard && <SettingsIcon onClick={() => setIsSettingsOpen(true)} />}
          <SettingsModal 
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
              settings={voiceSettings}
              onSettingsChange={setVoiceSettings}
              onLogout={handleLogout}
          />
          <main className="relative z-10 terminal-text">
            {renderScreen()}
          </main>
        </div>
        
        {/* Toast notifications */}
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
};

export default App;