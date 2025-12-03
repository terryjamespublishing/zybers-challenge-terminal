import React from 'react';

export interface User {
  username: string;
  level: number;
  xp: number;
  dataBits: number;
  accessKeys: number;
}

export interface Message {
  sender: 'user' | 'Zyber';
  text: string; // This will be the full display text
  spokenText?: string; // The concise text for TTS
  audio?: AudioBuffer;
}

export enum Screen {
  Login,
  Dashboard,
  Challenge,
  Live,
  DecryptionHub,
}

export interface ChallengeCategory {
  title: string;
  description: string;
  // Fix: Changed JSX.Element to React.ReactNode to resolve the "Cannot find namespace 'JSX'" error.
  icon: React.ReactNode;
  prompt: string;
}

export interface Voice {
    name: string;
    description: string;
    cost: number;
}

export interface VoiceSettings {
    gender: 'male' | 'female';
    language: 'en' | 'no' | 'pl' | 'uk';
    vocoderEnabled: boolean;
    vocoderFrequency: number;
    uiSoundsEnabled: boolean;
    // Advanced voice effects
    useAdvancedEffects: boolean; // Toggle new effects system
    voicePreset: 'zyber' | 'hal' | 'glados' | 'hawking' | 'menacing' | 'glitchy' | 'minimal' | 'custom';
    // Custom effect settings (when voicePreset === 'custom')
    customEffects?: {
        pitchShift: number;
        bitDepth: number;
        sampleRateReduction: number;
        formantShift: number;
        distortion: number;
        ringModFrequency: number;
        ringModMix: number;
        combFilterDelay: number;
        combFilterFeedback: number;
        filterFrequency: number;
        filterResonance: number;
        reverbAmount: number;
        reverbDecay: number;
        wetDryMix: number;
    };
}

export interface RewardData {
    xp: number;
    dataBits: number;
    isCorrect: boolean;
}

export interface AiResponse {
    displayText: string;
    spokenText: string;
    reward: RewardData;
}

// ========== ADMIN TYPES ==========

export type ChallengeType = 'Chemistry' | 'Physics' | 'Observation' | 'Engineering' | 'Logic';

export interface QuestChallenge {
    id: number;
    name: string;
    category: ChallengeType;
    difficulty: 1 | 2 | 3;
    age_range: string;
    time_minutes: number;
    materials: string[];
    description: string;
    learning_objectives: string;
    safety_notes: string;
    story_ideas: string;
}

export interface StoryNode {
    id: string;
    challengeId: number | null; // null for start/end nodes
    type: 'start' | 'challenge' | 'branch' | 'end';
    x: number;
    y: number;
    label: string;
    connections: string[]; // IDs of connected nodes
    conditions?: {
        type: 'success' | 'failure' | 'always';
        targetNodeId: string;
    }[];
}

export interface Story {
    id: string;
    name: string;
    description?: string;
    nodes: StoryNode[];
    createdAt: number;
    lastEdited: number;
}

export interface QuestData {
    challenges: QuestChallenge[];
    stories: Story[];
}

export enum AdminScreen {
    Login = 'admin-login',
    Dashboard = 'admin-dashboard',
    Challenges = 'admin-challenges',
    ChallengeEdit = 'admin-challenge-edit',
    StoryPlanner = 'admin-story-planner',
    Users = 'admin-users',
}

// Admin User (for managing players/children)
export type UserRole = 'player' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface AdminUser {
    id: string;
    username: string;
    displayName: string;
    email?: string;
    role: UserRole;
    status: UserStatus;
    level: number;
    xp: number;
    dataBits: number;
    accessKeys: number;
    challengesCompleted: number;
    totalPlayTime: number; // in minutes
    lastActive: number; // timestamp
    createdAt: number; // timestamp
    notes?: string; // Admin notes about the user
}