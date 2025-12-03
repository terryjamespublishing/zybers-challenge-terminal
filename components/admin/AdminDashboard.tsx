import React, { useState, useEffect } from 'react';
import { AdminScreen } from '../../types';
import { getStats, adminLogout, exportQuestData } from '../../services/questDataService';
import { playKeyPressSound, playSuccessSound } from '../../utils/uiSfx';

interface AdminDashboardProps {
    onNavigate: (screen: AdminScreen) => void;
    onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
    const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);

    useEffect(() => {
        setStats(getStats());
    }, []);

    const handleLogout = () => {
        adminLogout();
        playSuccessSound();
        onLogout();
    };

    const handleExport = () => {
        exportQuestData();
        playSuccessSound();
    };

    const menuItems = [
        {
            label: 'CHALLENGE MANAGER',
            description: 'View, create, edit and organize challenges',
            icon: '📋',
            screen: AdminScreen.Challenges,
            stat: stats ? `${stats.totalChallenges} challenges` : '...'
        },
        {
            label: 'STORY PLANNER',
            description: 'Design quest flows and story arcs',
            icon: '🗺️',
            screen: AdminScreen.StoryPlanner,
            stat: stats ? `${stats.totalStories} stories` : '...'
        }
    ];

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl text-primary mb-2" style={{ textShadow: '0 0 10px currentColor' }}>
                        ADMIN CONTROL CENTER
                    </h1>
                    <div className="text-accent opacity-70">
                        Quest Management System v1.0
                    </div>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent transition-all text-sm"
                    >
                        EXPORT DATA
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 transition-all text-sm"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="border border-primary/30 p-4 bg-black/30">
                        <div className="text-4xl text-primary font-bold">{stats.totalChallenges}</div>
                        <div className="text-primary/70 text-sm">CHALLENGES</div>
                    </div>
                    <div className="border border-primary/30 p-4 bg-black/30">
                        <div className="text-4xl text-primary font-bold">{stats.totalStories}</div>
                        <div className="text-primary/70 text-sm">STORIES</div>
                    </div>
                    <div className="border border-primary/30 p-4 bg-black/30">
                        <div className="text-4xl text-accent font-bold">{Object.keys(stats.categoryCounts).length}</div>
                        <div className="text-accent/70 text-sm">CATEGORIES</div>
                    </div>
                    <div className="border border-primary/30 p-4 bg-black/30">
                        <div className="text-4xl text-accent font-bold">{stats.avgTimeMinutes}</div>
                        <div className="text-accent/70 text-sm">AVG MINUTES</div>
                    </div>
                </div>
            )}

            {/* Category Breakdown */}
            {stats && (
                <div className="border border-primary/30 p-4 bg-black/30 mb-8">
                    <h2 className="text-xl text-primary mb-4">CHALLENGE CATEGORIES</h2>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {Object.entries(stats.categoryCounts).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center border border-primary/20 px-3 py-2">
                                <span className="text-primary/80">{category}</span>
                                <span className="text-accent font-bold">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Menu Items */}
            <div className="grid md:grid-cols-2 gap-6">
                {menuItems.map((item) => (
                    <button
                        key={item.screen}
                        onClick={() => {
                            playKeyPressSound();
                            onNavigate(item.screen);
                        }}
                        className="border border-primary/30 p-6 bg-black/30 hover:bg-primary/5 hover:border-primary/60 transition-all text-left group"
                    >
                        <div className="flex items-start gap-4">
                            <span className="text-4xl">{item.icon}</span>
                            <div className="flex-1">
                                <div className="text-2xl text-primary group-hover:text-accent transition-colors mb-2">
                                    {item.label}
                                </div>
                                <div className="text-primary/60 mb-3">
                                    {item.description}
                                </div>
                                <div className="text-accent text-sm">
                                    {item.stat}
                                </div>
                            </div>
                            <span className="text-primary/30 text-3xl group-hover:text-accent/50 transition-colors">
                                →
                            </span>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 border border-primary/30 p-4 bg-black/30">
                <h2 className="text-xl text-primary mb-4">QUICK ACTIONS</h2>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => onNavigate(AdminScreen.ChallengeEdit)}
                        className="px-4 py-2 border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent transition-all"
                    >
                        + NEW CHALLENGE
                    </button>
                    <button
                        onClick={() => onNavigate(AdminScreen.StoryPlanner)}
                        className="px-4 py-2 border border-accent/50 text-accent hover:bg-accent/10 hover:border-accent transition-all"
                    >
                        + NEW STORY
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
