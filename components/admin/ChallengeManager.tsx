import React, { useState, useEffect, useMemo } from 'react';
import { QuestChallenge, ChallengeType, AdminScreen } from '../../types';
import { getChallenges, deleteChallenge } from '../../services/questDataService';

interface ChallengeManagerProps {
    onNavigate: (screen: AdminScreen, data?: { challengeId?: number }) => void;
    onBack: () => void;
}

const CATEGORIES: ChallengeType[] = ['Chemistry', 'Physics', 'Observation', 'Engineering', 'Logic'];
const DIFFICULTIES = [1, 2, 3] as const;

const ChallengeManager: React.FC<ChallengeManagerProps> = ({ onNavigate, onBack }) => {
    const [challenges, setChallenges] = useState<QuestChallenge[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<ChallengeType | 'all'>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<1 | 2 | 3 | 'all'>('all');
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    useEffect(() => {
        setChallenges(getChallenges());
    }, []);

    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    c.name.toLowerCase().includes(query) ||
                    c.description.toLowerCase().includes(query) ||
                    c.learning_objectives.toLowerCase().includes(query) ||
                    c.story_ideas.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            if (selectedCategory !== 'all' && c.category !== selectedCategory) {
                return false;
            }

            if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) {
                return false;
            }

            return true;
        });
    }, [challenges, searchQuery, selectedCategory, selectedDifficulty]);

    const handleDelete = (id: number) => {
        if (deleteConfirm === id) {
            if (deleteChallenge(id)) {
                setChallenges(getChallenges());
            }
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
        }
    };

    const getDifficultyLabel = (diff: number): string => {
        switch (diff) {
            case 1: return 'Easy';
            case 2: return 'Medium';
            case 3: return 'Hard';
            default: return 'Unknown';
        }
    };

    const getDifficultyBadge = (diff: number): string => {
        switch (diff) {
            case 1: return 'bg-emerald-100 text-emerald-700';
            case 2: return 'bg-amber-100 text-amber-700';
            case 3: return 'bg-red-100 text-red-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <button
                            onClick={onBack}
                            className="text-indigo-600 hover:text-indigo-800 transition-colors text-base font-medium flex items-center gap-1 mb-1"
                        >
                            &larr; Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Challenge Manager
                        </h1>
                    </div>
                    <button
                        onClick={() => onNavigate(AdminScreen.ChallengeEdit)}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-base"
                    >
                        + New Challenge
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-6">
                {/* Filters */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 mb-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-slate-600 text-base font-medium mb-2">Search</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search challenges..."
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            />
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-slate-600 text-base font-medium mb-2">Category</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as ChallengeType | 'all')}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors bg-white"
                            >
                                <option value="all">All Categories</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label className="block text-slate-600 text-base font-medium mb-2">Difficulty</label>
                            <select
                                value={selectedDifficulty}
                                onChange={(e) => setSelectedDifficulty(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as 1 | 2 | 3)}
                                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors bg-white"
                            >
                                <option value="all">All Difficulties</option>
                                {DIFFICULTIES.map(diff => (
                                    <option key={diff} value={diff}>{getDifficultyLabel(diff)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-slate-500 text-base mb-4">
                    Showing {filteredChallenges.length} of {challenges.length} challenges
                </div>

                {/* Challenge List */}
                <div className="space-y-4">
                    {filteredChallenges.map(challenge => (
                        <div
                            key={challenge.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                            <span className="text-slate-400 text-base font-mono">#{challenge.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getDifficultyBadge(challenge.difficulty)}`}>
                                                {getDifficultyLabel(challenge.difficulty)}
                                            </span>
                                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                                                {challenge.category}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-slate-800 mb-2">{challenge.name}</h3>
                                        <p className="text-slate-500 text-base line-clamp-2 mb-4">
                                            {challenge.description}
                                        </p>
                                        <div className="flex flex-wrap gap-5 text-base text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <span>⏱️</span> {challenge.time_minutes} min
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span>👥</span> Ages {challenge.age_range}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <span>📦</span> {challenge.materials.length} materials
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => onNavigate(AdminScreen.ChallengeEdit, { challengeId: challenge.id })}
                                            className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-base font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setExpandedId(expandedId === challenge.id ? null : challenge.id)}
                                            className="px-5 py-2 bg-slate-100 text-slate-700 rounded-lg text-base font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            {expandedId === challenge.id ? 'Less' : 'More'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(challenge.id)}
                                            className={`px-5 py-2 rounded-lg text-base font-medium transition-colors ${
                                                deleteConfirm === challenge.id
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                        >
                                            {deleteConfirm === challenge.id ? 'Confirm?' : 'Delete'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedId === challenge.id && (
                                <div className="border-t border-slate-100 bg-slate-50 p-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="text-base font-semibold text-slate-700 mb-2">Learning Objectives</h4>
                                            <p className="text-slate-600 text-base">{challenge.learning_objectives}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-slate-700 mb-2">Story Ideas</h4>
                                            <p className="text-slate-600 text-base">{challenge.story_ideas}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-base font-semibold text-slate-700 mb-2">Materials</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {challenge.materials.map((m, i) => (
                                                    <span key={i} className="bg-white border border-slate-200 px-3 py-1.5 rounded text-sm text-slate-600">
                                                        {m}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {challenge.safety_notes && (
                                            <div>
                                                <h4 className="text-base font-semibold text-slate-700 mb-2">Safety Notes</h4>
                                                <p className="text-slate-600 text-base">{challenge.safety_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredChallenges.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-lg">
                        No challenges match your filters.
                    </div>
                )}
            </main>
        </div>
    );
};

export default ChallengeManager;
