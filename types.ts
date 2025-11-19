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
    voiceOutputEnabled: boolean;
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