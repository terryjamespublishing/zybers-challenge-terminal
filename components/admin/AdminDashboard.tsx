import React, { useState, useEffect } from 'react';
import { AdminScreen } from '../../types';
import { getStats, adminLogout, exportQuestData } from '../../services/questDataService';

interface AdminDashboardProps {
    onNavigate: (screen: AdminScreen) => void;
    onLogout: () => void;
    onExit: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout, onExit }) => {
    const [stats, setStats] = useState<ReturnType<typeof getStats> | null>(null);

    useEffect(() => {
        setStats(getStats());
    }, []);

    const handleLogout = () => {
        adminLogout();
        onLogout();
    };

    const handleExport = () => {
        exportQuestData();
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Admin Dashboard
                        </h1>
                        <p className="text-slate-500 text-base mt-1">
                            Zyber Challenge Management System
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onExit}
                            className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors text-base font-medium"
                        >
                            Back to Game
                        </button>
                        <button
                            onClick={handleExport}
                            className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors text-base font-medium"
                        >
                            Export Data
                        </button>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-base font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="text-4xl font-bold text-indigo-600">{stats.totalChallenges}</div>
                            <div className="text-slate-500 text-base mt-1">Total Challenges</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="text-4xl font-bold text-emerald-600">{stats.totalStories}</div>
                            <div className="text-slate-500 text-base mt-1">Story Arcs</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="text-4xl font-bold text-purple-600">{stats.totalUsers}</div>
                            <div className="text-slate-500 text-base mt-1">Total Users</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="text-4xl font-bold text-amber-600">{Object.keys(stats.categoryCounts).length}</div>
                            <div className="text-slate-500 text-base mt-1">Categories</div>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                            <div className="text-4xl font-bold text-sky-600">{stats.avgTimeMinutes}</div>
                            <div className="text-slate-500 text-base mt-1">Avg. Minutes</div>
                        </div>
                    </div>
                )}

                {/* Main Navigation Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <button
                        onClick={() => onNavigate(AdminScreen.Challenges)}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all text-left group relative"
                    >
                        <kbd className="absolute top-3 right-3 px-2 py-1 bg-slate-100 rounded text-slate-400 text-xs font-mono">1</kbd>
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center text-3xl">
                                📋
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                    Challenge Manager
                                </h2>
                                <p className="text-slate-500 mt-2 text-lg">
                                    View, create, edit and organize challenges
                                </p>
                                {stats && (
                                    <p className="text-indigo-600 text-base mt-4 font-medium">
                                        {stats.totalChallenges} challenges
                                    </p>
                                )}
                            </div>
                            <span className="text-slate-300 text-3xl group-hover:text-indigo-400 transition-colors">
                                &rarr;
                            </span>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(AdminScreen.StoryPlanner)}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left group relative"
                    >
                        <kbd className="absolute top-3 right-3 px-2 py-1 bg-slate-100 rounded text-slate-400 text-xs font-mono">2</kbd>
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-emerald-100 rounded-lg flex items-center justify-center text-3xl">
                                🗺️
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors">
                                    Story Planner
                                </h2>
                                <p className="text-slate-500 mt-2 text-lg">
                                    Design quest flows and story arcs
                                </p>
                                {stats && (
                                    <p className="text-emerald-600 text-base mt-4 font-medium">
                                        {stats.totalStories} stories
                                    </p>
                                )}
                            </div>
                            <span className="text-slate-300 text-3xl group-hover:text-emerald-400 transition-colors">
                                &rarr;
                            </span>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(AdminScreen.Users)}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all text-left group relative"
                    >
                        <kbd className="absolute top-3 right-3 px-2 py-1 bg-slate-100 rounded text-slate-400 text-xs font-mono">3</kbd>
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center text-3xl">
                                👥
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-slate-800 group-hover:text-purple-600 transition-colors">
                                    User Management
                                </h2>
                                <p className="text-slate-500 mt-2 text-lg">
                                    Manage players and their progress
                                </p>
                                {stats && (
                                    <p className="text-purple-600 text-base mt-4 font-medium">
                                        {stats.totalUsers} users
                                    </p>
                                )}
                            </div>
                            <span className="text-slate-300 text-3xl group-hover:text-purple-400 transition-colors">
                                &rarr;
                            </span>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate(AdminScreen.PuzzleTester)}
                        className="bg-white rounded-xl p-8 shadow-sm border border-slate-200 hover:border-cyan-300 hover:shadow-md transition-all text-left group relative"
                    >
                        <kbd className="absolute top-3 right-3 px-2 py-1 bg-slate-100 rounded text-slate-400 text-xs font-mono">4</kbd>
                        <div className="flex items-start gap-5">
                            <div className="w-14 h-14 bg-cyan-100 rounded-lg flex items-center justify-center text-3xl">
                                🎮
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-slate-800 group-hover:text-cyan-600 transition-colors">
                                    Puzzle Tester
                                </h2>
                                <p className="text-slate-500 mt-2 text-lg">
                                    Test terminal-based challenges
                                </p>
                                <p className="text-cyan-600 text-base mt-4 font-medium">
                                    Dev Tools
                                </p>
                            </div>
                            <span className="text-slate-300 text-3xl group-hover:text-cyan-400 transition-colors">
                                &rarr;
                            </span>
                        </div>
                    </button>
                </div>

                {/* Category Breakdown */}
                {stats && Object.keys(stats.categoryCounts).length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-8">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Challenges by Category</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {Object.entries(stats.categoryCounts).map(([category, count]) => (
                                <div
                                    key={category}
                                    className="flex justify-between items-center bg-slate-50 rounded-lg px-4 py-3"
                                >
                                    <span className="text-slate-600 font-medium text-base">{category}</span>
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-base font-semibold">
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => onNavigate(AdminScreen.ChallengeEdit)}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base"
                        >
                            + New Challenge
                        </button>
                        <button
                            onClick={() => onNavigate(AdminScreen.StoryPlanner)}
                            className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-base"
                        >
                            + New Story
                        </button>
                        <button
                            onClick={() => onNavigate(AdminScreen.Users)}
                            className="px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-base"
                        >
                            + New User
                        </button>
                    </div>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="mt-6 text-center text-slate-400 text-sm">
                    <span className="inline-flex items-center gap-4">
                        <span><kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono">1-4</kbd> Navigate</span>
                        <span><kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono">N</kbd> New Challenge</span>
                        <span><kbd className="px-2 py-1 bg-slate-100 rounded text-slate-600 font-mono">ESC</kbd> Exit</span>
                    </span>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
