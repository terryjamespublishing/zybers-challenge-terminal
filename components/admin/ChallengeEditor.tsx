import React, { useState, useEffect } from 'react';
import { QuestChallenge, ChallengeType, AdminScreen } from '../../types';
import { getChallengeById, createChallenge, updateChallenge } from '../../services/questDataService';
import { playKeyPressSound, playErrorSound, playSuccessSound } from '../../utils/uiSfx';

interface ChallengeEditorProps {
    challengeId?: number;
    onNavigate: (screen: AdminScreen) => void;
    onBack: () => void;
}

const CATEGORIES: ChallengeType[] = ['Chemistry', 'Physics', 'Observation', 'Engineering', 'Logic'];
const DIFFICULTIES = [
    { value: 1, label: 'Easy (Level 1)' },
    { value: 2, label: 'Medium (Level 2)' },
    { value: 3, label: 'Hard (Level 3)' }
] as const;

const emptyChallenge: Omit<QuestChallenge, 'id'> = {
    name: '',
    category: 'Logic',
    difficulty: 2,
    age_range: '10-16',
    time_minutes: 10,
    materials: [],
    description: '',
    learning_objectives: '',
    safety_notes: '',
    story_ideas: ''
};

const ChallengeEditor: React.FC<ChallengeEditorProps> = ({ challengeId, onNavigate, onBack }) => {
    const [formData, setFormData] = useState<Omit<QuestChallenge, 'id'>>(emptyChallenge);
    const [materialsInput, setMaterialsInput] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = challengeId !== undefined;

    useEffect(() => {
        if (challengeId) {
            const challenge = getChallengeById(challengeId);
            if (challenge) {
                const { id, ...rest } = challenge;
                setFormData(rest);
                setMaterialsInput(challenge.materials.join(', '));
            }
        }
    }, [challengeId]);

    const handleChange = (field: keyof Omit<QuestChallenge, 'id'>, value: string | number | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors([]);
    };

    const handleMaterialsChange = (value: string) => {
        setMaterialsInput(value);
        const materials = value.split(',').map(m => m.trim()).filter(m => m.length > 0);
        handleChange('materials', materials);
    };

    const validate = (): boolean => {
        const newErrors: string[] = [];

        if (!formData.name.trim()) {
            newErrors.push('Name is required');
        }
        if (!formData.description.trim()) {
            newErrors.push('Description is required');
        }
        if (!formData.learning_objectives.trim()) {
            newErrors.push('Learning objectives are required');
        }
        if (formData.materials.length === 0) {
            newErrors.push('At least one material is required');
        }
        if (formData.time_minutes < 1 || formData.time_minutes > 120) {
            newErrors.push('Time must be between 1 and 120 minutes');
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            playErrorSound();
            return;
        }

        setIsSaving(true);
        playKeyPressSound();

        try {
            // Simulate save delay
            await new Promise(r => setTimeout(r, 500));

            if (isEditing && challengeId) {
                updateChallenge(challengeId, formData);
            } else {
                createChallenge(formData);
            }

            playSuccessSound();
            await new Promise(r => setTimeout(r, 300));
            onNavigate(AdminScreen.Challenges);
        } catch (error) {
            playErrorSound();
            setErrors(['Failed to save challenge. Please try again.']);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="text-accent hover:text-primary transition-colors mb-2 flex items-center gap-2"
                >
                    ← BACK TO CHALLENGES
                </button>
                <h1 className="text-3xl md:text-4xl text-primary" style={{ textShadow: '0 0 10px currentColor' }}>
                    {isEditing ? 'EDIT CHALLENGE' : 'CREATE NEW CHALLENGE'}
                </h1>
                {isEditing && (
                    <div className="text-accent/70 mt-2">Editing Challenge #{challengeId}</div>
                )}
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="border border-red-500/50 bg-red-500/10 p-4 mb-6">
                    <h3 className="text-red-500 font-bold mb-2">VALIDATION ERRORS:</h3>
                    <ul className="list-disc list-inside text-red-400">
                        {errors.map((error, i) => (
                            <li key={i}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="border border-primary/30 p-4 bg-black/30">
                    <h2 className="text-xl text-primary mb-4">BASIC INFORMATION</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-primary/70 text-sm mb-1">NAME *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                placeholder="Challenge name..."
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none text-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">CATEGORY *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => handleChange('category', e.target.value as ChallengeType)}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary focus:border-primary outline-none"
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">DIFFICULTY *</label>
                            <select
                                value={formData.difficulty}
                                onChange={(e) => handleChange('difficulty', parseInt(e.target.value) as 1 | 2 | 3)}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary focus:border-primary outline-none"
                            >
                                {DIFFICULTIES.map(d => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">AGE RANGE</label>
                            <input
                                type="text"
                                value={formData.age_range}
                                onChange={(e) => handleChange('age_range', e.target.value)}
                                placeholder="e.g., 10-16"
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">TIME (MINUTES) *</label>
                            <input
                                type="number"
                                value={formData.time_minutes}
                                onChange={(e) => handleChange('time_minutes', parseInt(e.target.value) || 0)}
                                min={1}
                                max={120}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary focus:border-primary outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Description & Objectives */}
                <div className="border border-primary/30 p-4 bg-black/30">
                    <h2 className="text-xl text-primary mb-4">CONTENT</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">DESCRIPTION *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                placeholder="Describe the challenge activity..."
                                rows={4}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">LEARNING OBJECTIVES *</label>
                            <textarea
                                value={formData.learning_objectives}
                                onChange={(e) => handleChange('learning_objectives', e.target.value)}
                                placeholder="What will students learn..."
                                rows={3}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">STORY IDEAS</label>
                            <textarea
                                value={formData.story_ideas}
                                onChange={(e) => handleChange('story_ideas', e.target.value)}
                                placeholder="How can this fit into the Zyber narrative..."
                                rows={3}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Materials & Safety */}
                <div className="border border-primary/30 p-4 bg-black/30">
                    <h2 className="text-xl text-primary mb-4">MATERIALS & SAFETY</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">
                                MATERIALS * <span className="text-primary/40">(comma-separated)</span>
                            </label>
                            <textarea
                                value={materialsInput}
                                onChange={(e) => handleMaterialsChange(e.target.value)}
                                placeholder="Baking soda, Vinegar, Balloon, Small bottle..."
                                rows={3}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none resize-none"
                            />
                            {formData.materials.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.materials.map((material, i) => (
                                        <span
                                            key={i}
                                            className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-sm"
                                        >
                                            {material}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-primary/70 text-sm mb-1">SAFETY NOTES</label>
                            <textarea
                                value={formData.safety_notes}
                                onChange={(e) => handleChange('safety_notes', e.target.value)}
                                placeholder="Any safety considerations..."
                                rows={2}
                                className="w-full bg-black/50 border border-primary/30 px-3 py-2 text-primary placeholder-primary/30 focus:border-primary outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-3 px-6 border border-accent text-accent text-lg hover:bg-accent/10 transition-all disabled:opacity-50"
                    >
                        {isSaving ? 'SAVING...' : isEditing ? 'UPDATE CHALLENGE' : 'CREATE CHALLENGE'}
                    </button>
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={isSaving}
                        className="py-3 px-6 border border-primary/50 text-primary text-lg hover:bg-primary/10 transition-all disabled:opacity-50"
                    >
                        CANCEL
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChallengeEditor;
