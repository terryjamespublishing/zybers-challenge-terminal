import React, { useState, useEffect, useCallback } from 'react';
import { AdminScreen } from '../../types';
import { isAdminLoggedIn } from '../../services/questDataService';
import AdminLoginScreen from './AdminLoginScreen';
import AdminDashboard from './AdminDashboard';
import ChallengeManager from './ChallengeManager';
import ChallengeEditor from './ChallengeEditor';
import StoryPlanner from './StoryPlanner';
import UserManager from './UserManager';
import PuzzleTester from './PuzzleTester';

interface AdminAppProps {
    onExit: () => void;
}

interface NavigationData {
    challengeId?: number;
}

const AdminApp: React.FC<AdminAppProps> = ({ onExit }) => {
    const [currentScreen, setCurrentScreen] = useState<AdminScreen>(
        isAdminLoggedIn() ? AdminScreen.Dashboard : AdminScreen.Login
    );
    const [navData, setNavData] = useState<NavigationData>({});

    // Keyboard shortcuts handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Don't trigger if typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
            // Only allow ESC in inputs
            if (e.key !== 'Escape') return;
        }

        // ESC - Go back or exit
        if (e.key === 'Escape') {
            e.preventDefault();
            if (currentScreen === AdminScreen.Dashboard) {
                onExit();
            } else if (currentScreen === AdminScreen.ChallengeEdit) {
                setCurrentScreen(AdminScreen.Challenges);
            } else if (currentScreen !== AdminScreen.Login) {
                setCurrentScreen(AdminScreen.Dashboard);
            }
            return;
        }

        // Dashboard shortcuts (only when on dashboard)
        if (currentScreen === AdminScreen.Dashboard) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    setCurrentScreen(AdminScreen.Challenges);
                    break;
                case '2':
                    e.preventDefault();
                    setCurrentScreen(AdminScreen.StoryPlanner);
                    break;
                case '3':
                    e.preventDefault();
                    setCurrentScreen(AdminScreen.Users);
                    break;
                case '4':
                    e.preventDefault();
                    setCurrentScreen(AdminScreen.PuzzleTester);
                    break;
                case 'n':
                case 'N':
                    e.preventDefault();
                    setCurrentScreen(AdminScreen.ChallengeEdit);
                    setNavData({});
                    break;
            }
        }
    }, [currentScreen, onExit]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleNavigate = (screen: AdminScreen, data?: NavigationData) => {
        setCurrentScreen(screen);
        if (data) setNavData(data);
    };

    const handleLogin = () => {
        setCurrentScreen(AdminScreen.Dashboard);
    };

    const handleLogout = () => {
        setCurrentScreen(AdminScreen.Login);
    };

    // Login screen keeps the hacker aesthetic
    if (currentScreen === AdminScreen.Login) {
        return (
            <div className="crt-screen min-h-screen selection:bg-primary selection:text-bg">
                <div className="crt-vignette"></div>
                <div className="crt-scanline-bar"></div>
                <div className="terminal-text">
                    <AdminLoginScreen
                        onLogin={handleLogin}
                        onBack={onExit}
                    />
                </div>
            </div>
        );
    }

    // All other admin screens get a clean, professional interface
    const renderScreen = () => {
        switch (currentScreen) {
            case AdminScreen.Dashboard:
                return (
                    <AdminDashboard
                        onNavigate={handleNavigate}
                        onLogout={handleLogout}
                        onExit={onExit}
                    />
                );
            case AdminScreen.Challenges:
                return (
                    <ChallengeManager
                        onNavigate={handleNavigate}
                        onBack={() => handleNavigate(AdminScreen.Dashboard)}
                    />
                );
            case AdminScreen.ChallengeEdit:
                return (
                    <ChallengeEditor
                        challengeId={navData.challengeId}
                        onNavigate={handleNavigate}
                        onBack={() => handleNavigate(AdminScreen.Challenges)}
                    />
                );
            case AdminScreen.StoryPlanner:
                return (
                    <StoryPlanner
                        onBack={() => handleNavigate(AdminScreen.Dashboard)}
                    />
                );
            case AdminScreen.Users:
                return (
                    <UserManager
                        onNavigate={handleNavigate}
                        onBack={() => handleNavigate(AdminScreen.Dashboard)}
                    />
                );
            case AdminScreen.PuzzleTester:
                return (
                    <PuzzleTester
                        onBack={() => handleNavigate(AdminScreen.Dashboard)}
                    />
                );
            default:
                return (
                    <AdminDashboard
                        onNavigate={handleNavigate}
                        onLogout={handleLogout}
                        onExit={onExit}
                    />
                );
        }
    };

    return (
        <div
            className="admin-panel min-h-screen bg-slate-50 text-slate-800 text-base"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
            {renderScreen()}
        </div>
    );
};

export default AdminApp;
