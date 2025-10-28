import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import ChallengeScreen from './components/ChallengeScreen';
import LiveScreen from './components/LiveScreen';
import DecryptionHubScreen from './components/DecryptionHubScreen';
import { Screen, User, ChallengeCategory, VoiceSettings } from './types';
import { CHALLENGE_CATEGORIES } from './constants';
import SettingsIcon from './components/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { saveUserData } from './services/userService';
import { loadVoiceSettings, saveVoiceSettings } from './services/settingsService';
import { useToast } from './hooks/useToast';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>(Screen.Login);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeCategory | null>(null);
  
  // Settings State - Load from localStorage on mount
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(loadVoiceSettings);

  // Toast notifications
  const { toasts, hideToast, showSuccess } = useToast();

  // Persist voice settings whenever they change
  useEffect(() => {
    saveVoiceSettings(voiceSettings);
  }, [voiceSettings]);

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
    <div className="min-h-screen p-6 md:p-8 selection:bg-primary selection:text-bg flex flex-col">
      <div className="w-full flex-grow border-2 border-primary p-4 relative shadow-primary">
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-20 pointer-events-none animate-pulse-fast"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-repeat bg-center opacity-5 pointer-events-none" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%2300ff41\' fill-opacity=\'0.4\' fill-rule=\'evenodd\'%3E%3Cpath d=\'M5 0h1L0 6V5zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")'}}></div>
        {screen === Screen.Dashboard && <SettingsIcon onClick={() => setIsSettingsOpen(true)} />}
        <SettingsModal 
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={voiceSettings}
            onSettingsChange={setVoiceSettings}
            onLogout={handleLogout}
        />
        <main className="relative z-10">
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
  );
};

export default App;