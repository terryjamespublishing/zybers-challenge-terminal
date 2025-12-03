import React, { useState, useEffect } from 'react';
import { QuestChallenge, ChallengeType, AdminScreen } from '../../types';
import { getChallengeById, createChallenge, updateChallenge } from '../../services/questDataService';

interface ChallengeEditorProps {
    challengeId?: number;
    onNavigate: (screen: AdminScreen) => void;
    onBack: () => void;
}

const CATEGORIES: ChallengeType[] = ['Chemistry', 'Physics', 'Observation', 'Engineering', 'Logic'];
const DIFFICULTIES = [
    { value: 1, label: 'Easy', description: 'Suitable for beginners (ages 10-12)' },
    { value: 2, label: 'Medium', description: 'Moderate challenge (ages 12-14)' },
    { value: 3, label: 'Hard', description: 'Advanced level (ages 14-16)' }
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
            return;
        }

        setIsSaving(true);

        try {
            await new Promise(r => setTimeout(r, 500));

            if (isEditing && challengeId) {
                updateChallenge(challengeId, formData);
            } else {
                createChallenge(formData);
            }

            await new Promise(r => setTimeout(r, 300));
            onNavigate(AdminScreen.Challenges);
        } catch (error) {
            setErrors(['Failed to save challenge. Please try again.']);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={onBack}
                        className="text-indigo-600 hover:text-indigo-800 transition-colors text-base font-medium flex items-center gap-1 mb-1"
                    >
                        &larr; Back to Challenges
                    </button>
                    <h1 className="text-3xl font-bold text-slate-800">
                        {isEditing ? 'Edit Challenge' : 'Create New Challenge'}
                    </h1>
                    {isEditing && (
                        <p className="text-slate-500 text-base mt-1">Editing Challenge #{challengeId}</p>
                    )}
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-8">
                {/* Error Messages */}
                {errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
                        <h3 className="text-red-700 font-semibold mb-2 text-lg">Please fix the following errors:</h3>
                        <ul className="list-disc list-inside text-red-600 text-base space-y-1">
                            {errors.map((error, i) => (
                                <li key={i}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800 mb-5">Basic Information</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-slate-700 text-base font-medium mb-2">
                                    Challenge Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    placeholder="Enter a descriptive name..."
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors text-xl"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-slate-700 text-base font-medium mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => handleChange('category', e.target.value as ChallengeType)}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors bg-white"
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 text-base font-medium mb-2">
                                        Difficulty <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.difficulty}
                                        onChange={(e) => handleChange('difficulty', parseInt(e.target.value) as 1 | 2 | 3)}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors bg-white"
                                    >
                                        {DIFFICULTIES.map(d => (
                                            <option key={d.value} value={d.value}>{d.label} - {d.description}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-slate-700 text-base font-medium mb-2">
                                        Age Range
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.age_range}
                                        onChange={(e) => handleChange('age_range', e.target.value)}
                                        placeholder="e.g., 10-16"
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-slate-700 text-base font-medium mb-2">
                                        Duration (minutes) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.time_minutes}
                                        onChange={(e) => handleChange('time_minutes', parseInt(e.target.value) || 0)}
                                        min={1}
                                        max={120}
                                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800 mb-5">Content</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-slate-700 text-base font-medium mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    placeholder="Describe the challenge activity in detail..."
                                    rows={4}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 text-base font-medium mb-2">
                                    Learning Objectives <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.learning_objectives}
                                    onChange={(e) => handleChange('learning_objectives', e.target.value)}
                                    placeholder="What will students learn from this challenge?"
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 text-base font-medium mb-2">
                                    Story Ideas
                                </label>
                                <textarea
                                    value={formData.story_ideas}
                                    onChange={(e) => handleChange('story_ideas', e.target.value)}
                                    placeholder="How can this challenge fit into the Zyber narrative?"
                                    rows={3}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Materials & Safety */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h2 className="text-xl font-semibold text-slate-800 mb-5">Materials & Safety</h2>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-slate-700 text-base font-medium mb-2">
                                    Materials <span className="text-red-500">*</span>
                                    <span className="text-slate-400 font-normal ml-2">(comma-separated)</span>
                                </label>
                                <textarea
                                    value={materialsInput}
                                    onChange={(e) => handleMaterialsChange(e.target.value)}
                                    placeholder="Baking soda, Vinegar, Balloon, Small bottle..."
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-none"
                                />
                                {formData.materials.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {formData.materials.map((material, i) => (
                                            <span
                                                key={i}
                                                className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-full text-base font-medium"
                                            >
                                                {material}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-slate-700 text-base font-medium mb-2">
                                    Safety Notes
                                </label>
                                <textarea
                                    value={formData.safety_notes}
                                    onChange={(e) => handleChange('safety_notes', e.target.value)}
                                    placeholder="Any safety considerations for this challenge..."
                                    rows={2}
                                    className="w-full border border-slate-300 rounded-lg px-4 py-3 text-base text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 py-3.5 px-6 bg-indigo-600 text-white rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? 'Saving...' : isEditing ? 'Update Challenge' : 'Create Challenge'}
                        </button>
                        <button
                            type="button"
                            onClick={onBack}
                            disabled={isSaving}
                            className="py-3.5 px-6 bg-slate-100 text-slate-700 rounded-lg font-semibold text-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ChallengeEditor;
