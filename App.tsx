import React, { useState, useCallback, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import DashboardScreen from './components/DashboardScreen';
import ChallengeScreen from './components/ChallengeScreen';
import GasLeakChallenge from './components/puzzles/GasLeakChallenge';
import LiveScreen from './components/LiveScreen';
import DecryptionHubScreen from './components/DecryptionHubScreen';
import BootScreen from './components/BootScreen';
import IntroScreen from './components/IntroScreen';
import AdminApp from './components/admin/AdminApp';
import { Screen, User, QuestChallenge, VoiceSettings } from './types';
import SettingsIcon from './components/SettingsIcon';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { saveUserData } from './services/userService';
import { loadVoiceSettings, saveVoiceSettings } from './services/settingsService';
import { completeCurrentChallenge } from './services/progressService';
import { useToast } from './hooks/useToast';
import { playStartupSound } from './utils/terminalSounds';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>(Screen.Login);
  const [currentChallenge, setCurrentChallenge] = useState<QuestChallenge | null>(null);
  const [showBoot, setShowBoot] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Settings State - Load from localStorage on mount
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    const loaded = loadVoiceSettings();
    console.log('[App] Initial voice settings loaded:', loaded);
    return loaded;
  });

  // Toast notifications
  const { toasts, hideToast, showSuccess } = useToast();

  // Persist voice settings whenever they change
  useEffect(() => {
    console.log('[App] Saving voice settings:', voiceSettings);
    saveVoiceSettings(voiceSettings);
  }, [voiceSettings]);

  // Play startup sound when boot screen starts
  useEffect(() => {
    if (showBoot && voiceSettings.uiSoundsEnabled) {
      setTimeout(() => playStartupSound(), 100);
    }
  }, [showBoot, voiceSettings.uiSoundsEnabled]);

  // Admin mode activation via keyboard (Ctrl+Shift+A) or URL parameter
  useEffect(() => {
    // Check URL for admin mode
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
      setShowAdmin(true);
      setShowBoot(false);
      setShowIntro(false);
    }

    // Keyboard shortcut handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowAdmin(true);
        setShowBoot(false);
        setShowIntro(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBootComplete = () => {
    setShowBoot(false);
    setShowIntro(true);
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setScreen(Screen.Dashboard);
    showSuccess(`ACCESS GRANTED, ${loggedInUser.username.toUpperCase()}.`);
  };

  const handleLogout = () => {
    setUser(null);
    setScreen(Screen.Login);
  };

  const handleStartChallenge = (challenge: QuestChallenge) => {
    setCurrentChallenge(challenge);
    setScreen(Screen.Challenge);
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
            onStartChallenge={handleStartChallenge}
            voiceSettings={voiceSettings}
          />
        );
      case Screen.Challenge:
        if (!currentChallenge) {
            setScreen(Screen.Dashboard);
            return null;
        }
        // Route to specific puzzle components based on challenge ID
        if (currentChallenge.id === 1) {
          return (
            <GasLeakChallenge
              onComplete={() => {
                // Award rewards for completing the challenge
                addRewards({ xp: 50, dataBits: 25, accessKeys: 1 });
                completeCurrentChallenge(1800); // Mark as complete
                handleExit();
              }}
              onExit={handleExit}
              voiceSettings={voiceSettings}
            />
          );
        }
        // Default to the generic ChallengeScreen for other challenges
        return (
          <ChallengeScreen
            challenge={currentChallenge}
            onExit={handleExit}
            onStartVoiceChat={() => setScreen(Screen.Live)}
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

  // Handle admin exit
  const handleAdminExit = () => {
    setShowAdmin(false);
    // Clear URL parameter if present
    const url = new URL(window.location.href);
    url.searchParams.delete('admin');
    window.history.replaceState({}, '', url.toString());
  };

  // Render admin mode
  if (showAdmin) {
    return <AdminApp onExit={handleAdminExit} />;
  }

  return (
    <>
      {showBoot && <BootScreen onComplete={handleBootComplete} />}
      {showIntro && <IntroScreen onComplete={handleIntroComplete} voiceSettings={voiceSettings} />}

      {!showBoot && !showIntro && (
      <div className="crt-screen min-h-screen selection:bg-primary selection:text-bg flex flex-col" style={{ padding: '2vh 3vw' }}>
        <div className="crt-vignette"></div>
        <div className="crt-scanline-bar"></div>
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
      )}
    </>
  );
};

export default App;