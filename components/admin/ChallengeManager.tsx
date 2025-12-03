import React, { useState, useEffect, useMemo } from 'react';
import { QuestChallenge, ChallengeType, AdminScreen } from '../../types';
import { getChallenges, deleteChallenge } from '../../services/questDataService';
import { playKeyPressSound, playErrorSound, playSuccessSound } from '../../utils/uiSfx';

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

    useEffect(() => {
        setChallenges(getChallenges());
    }, []);

    const filteredChallenges = useMemo(() => {
        return challenges.filter(c => {
            // Search filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    c.name.toLowerCase().includes(query) ||
                    c.description.toLowerCase().includes(query) ||
                    c.learning_objectives.toLowerCase().includes(query) ||
                    c.story_ideas.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Category filter
            if (selectedCategory !== 'all' && c.category !== selectedCategory) {
                return false;
            }

            // Difficulty filter
            if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) {
                return false;
            }

            return true;
        });
    }, [challenges, searchQuery, selectedCategory, selectedDifficulty]);

    const handleDelete = (id: number) => {
        if (deleteConfirm === id) {
            if (deleteChallenge(id)) {
                playSuccessSound();
                setChallenges(getChallenges());
            } else {
                playErrorSound();
            }
            setDeleteConfirm(null);
        } else {
            setDeleteConfirm(id);
            playKeyPressSound();
        }
    };

    const getDifficultyLabel = (diff: number): string => {
        switch (diff) {
            case 1: return 'EASY';
            case 2: return 'MEDIUM';
            case 3: return 'HARD';
            default: return 'UNKNOWN';
        }
    };

    const getDifficultyColor = (diff: number): string => {
        switch (diff) {
            case 1: return 'text-green-400';
            case 2: return 'text-yellow-400';
            case 3: return 'text-red-400';
            default: return 'text-primary';
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    <button
                        onClick={onBack}
                        className="text-accent hover:text-primary transition-colors mb-2 flex items-center gap-2"
                    >
                        ← BACK TO DASHBOARD
                    </button>
                    <h1 className="text-3xl md:text-4xl text-primary" style={{ textShadow: '0 0 10px currentColor' }}>
                        CHALLENGE MANAGER
                    </h1>
                </div>
                <button
                    onClick={() => onNavigate(AdminScreen.ChallengeEdit)}
                    className="px-4 py-2 border border-accent text-accent hover:bg-accent/10 transition-all"
                >
                    + NEW CHALLENGE
                </button>
            </div>

            {/* Filters */}
            <div className="border border-primary/30 p-4 bg-black/30 mb-6">
                <div className="grid md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-primary/70 text-sm mb-1">SEARCH</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search challenges..."
                            className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none"
                        />
                    </div>

                    {/* Category Filter */}
                    <div>
                        <label className="block text-primary/70 text-sm mb-1">CATEGORY</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as ChallengeType | 'all')}
                            className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary focus:border-primary outline-none"
                        >
                            <option value="all">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Difficulty Filter */}
                    <div>
                        <label className="block text-primary/70 text-sm mb-1">DIFFICULTY</label>
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as 1 | 2 | 3)}
                            className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary focus:border-primary outline-none"
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
            <div className="text-primary/70 mb-4">
                Showing {filteredChallenges.length} of {challenges.length} challenges
            </div>

            {/* Challenge List */}
            <div className="space-y-3">
                {filteredChallenges.map(challenge => (
                    <div
                        key={challenge.id}
                        className="border border-primary/30 bg-black/30 hover:border-primary/50 transition-all"
                    >
                        <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-accent text-sm">#{challenge.id}</span>
                                        <span className={`text-sm ${getDifficultyColor(challenge.difficulty)}`}>
                                            [{getDifficultyLabel(challenge.difficulty)}]
                                        </span>
                                        <span className="text-primary/50 text-sm">
                                            {challenge.category}
                                        </span>
                                    </div>
                                    <h3 className="text-xl text-primary mb-2">{challenge.name}</h3>
                                    <p className="text-primary/60 text-sm line-clamp-2 mb-3">
                                        {challenge.description}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <span className="text-accent/70">
                                            ⏱️ {challenge.time_minutes} min
                                        </span>
                                        <span className="text-accent/70">
                                            👥 Ages {challenge.age_range}
                                        </span>
                                        <span className="text-accent/70">
                                            📦 {challenge.materials.length} materials
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            playKeyPressSound();
                                            onNavigate(AdminScreen.ChallengeEdit, { challengeId: challenge.id });
                                        }}
                                        className="px-3 py-1 border border-primary/50 text-primary text-sm hover:bg-primary/10 transition-all"
                                    >
                                        EDIT
                                    </button>
                                    <button
                                        onClick={() => handleDelete(challenge.id)}
                                        className={`px-3 py-1 border text-sm transition-all ${
                                            deleteConfirm === challenge.id
                                                ? 'border-red-500 text-red-500 bg-red-500/10'
                                                : 'border-red-500/50 text-red-500/70 hover:bg-red-500/10'
                                        }`}
                                    >
                                        {deleteConfirm === challenge.id ? 'CONFIRM?' : 'DELETE'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Details - shown on hover or click */}
                        <div className="border-t border-primary/20 p-4 bg-black/20 hidden group-hover:block">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="text-primary/70 mb-1">Learning Objectives:</h4>
                                    <p className="text-primary/50">{challenge.learning_objectives}</p>
                                </div>
                                <div>
                                    <h4 className="text-primary/70 mb-1">Story Ideas:</h4>
                                    <p className="text-primary/50">{challenge.story_ideas}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredChallenges.length === 0 && (
                <div className="text-center py-12 text-primary/50">
                    No challenges match your filters.
                </div>
            )}
        </div>
    );
};

export default ChallengeManager;
