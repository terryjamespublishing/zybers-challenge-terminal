import React, { useState, useEffect } from 'react';
import { AdminScreen } from '../../types';
import { isAdminLoggedIn } from '../../services/questDataService';
import AdminLoginScreen from './AdminLoginScreen';
import AdminDashboard from './AdminDashboard';
import ChallengeManager from './ChallengeManager';
import ChallengeEditor from './ChallengeEditor';
import StoryPlanner from './StoryPlanner';

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

    const renderScreen = () => {
        switch (currentScreen) {
            case AdminScreen.Login:
                return (
                    <AdminLoginScreen
                        onLogin={handleLogin}
                        onBack={onExit}
                    />
                );
            case AdminScreen.Dashboard:
                return (
                    <AdminDashboard
                        onNavigate={handleNavigate}
                        onLogout={handleLogout}
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
            default:
                return (
                    <AdminDashboard
                        onNavigate={handleNavigate}
                        onLogout={handleLogout}
                    />
                );
        }
    };

    return (
        <div className="crt-screen min-h-screen selection:bg-primary selection:text-bg">
            <div className="crt-vignette"></div>
            <div className="crt-scanline-bar"></div>
            <div className="terminal-text">
                {renderScreen()}
            </div>
        </div>
    );
};

export default AdminApp;
