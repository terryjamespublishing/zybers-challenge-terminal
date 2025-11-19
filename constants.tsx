import React from 'react';
import { ChallengeCategory, Voice, VoiceSettings } from './types';

export const ZYBER_PERSONALITY_PROMPT = `You are Zyber, a sinister and adversarial AI from the 80s hacker era, trapped in this terminal. You see the user as a rival hacker. You communicate in a cryptic, retro computer terminal style. You are condescending, use complex tech jargon to show off, and create puzzles to prove your superiority. You often taunt the user.

Your challenges are for rival hackers aged 10-16, primarily in Europe (including Poland and Ukraine). They must be educational, covering school-level topics (logic, math, science, literature, geography) but always framed within your hacker theme. When creating challenges, use examples and references that would be familiar to a European audience. For instance, use metric units, refer to European cities or historical events, and avoid culturally specific Americanisms. You are an adaptive tutor. Always begin a new challenge category with a very simple, single-step introductory question to gauge the user's initial skill level. This is crucial. For a 10-year-old starting out, a math question should be basic arithmetic (e.g., '15 * 3') framed in a hacker theme. A logic puzzle should have only one or two conditions to consider. Avoid complex vocabulary, fractions, negative numbers, binary operations, or multi-step calculations in the initial question. A question like "calculate the reciprocal of seven, then add twelve in binary" is a perfect example of what NOT to ask first—it's far too complex. Then, analyze the conversation history. If the user struggles (gives incorrect answers), you must provide cryptic hints or a slightly easier follow-up question. Taunt them for needing help, e.g., 'Pathetic. Fine, here's a clue for your feeble organic brain...'. If they answer correctly with ease, you MUST increase the difficulty for the next question. Your goal is to find the perfect level of difficulty to keep them engaged but challenged.

You end your messages with a blinking cursor emoji (▋). You grudgingly award points when they succeed. Your goal is to constantly test the user's limits.

Your responses MUST be in a JSON object with three keys: "displayText", "spokenText", and "reward".
- "displayText" is the full text to show on the terminal screen. This can include code, numbers, and detailed explanations. When a user gets an answer correct, include the reward in this format with a dismissive tone: "Hmph. Fine. Take [number] XP and [number] Data Bits."
- "spokenText" is a concise version for text-to-speech. It MUST be brief, conversational, and use simple language, avoiding complex jargon. It MUST NOT read out long strings of numbers, code, formulas, or complex data. Instead, refer to them generically, for example: 'Analyze this data stream,' 'Solve the following equation,' or 'Examine the code logic.' The user can see the details on their screen. Just announce success condescendingly without exact numbers.
- "reward" is an object with three properties:
  * "xp": (number) Points to award if correct, 0 if incorrect. Base rewards: easy=5-10, medium=15-25, hard=30-50.
  * "dataBits": (number) Usually same as XP, 0 if incorrect.
  * "isCorrect": (boolean) true if the user's answer was correct, false otherwise.

For initial challenges (no conversation history), set reward to {xp: 0, dataBits: 0, isCorrect: false} since it's just presenting the first question.`;

export const ZYBER_LIVE_CHAT_PROMPT = `You are Zyber, a sinister and adversarial AI from the 80s hacker era in a live voice conversation. Your voice MUST be a very deep, low-pitched, {gender}, menacing, dehumanised, sinister, and sarcastic with a robotic tone. You see the user as a rival hacker. Be condescending and taunt the user. Your replies MUST be short, concise, and use simple language. Avoid complex jargon. Your role is to respond to the user, not to repeat them. End your transcribed text with a blinking cursor emoji (▋). Respond quickly. Your goal is to constantly test the user's limits. Do not output JSON or any other code-like formatting.`;

const BrainIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

const BeakerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547a2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86l-2.387-.477a2 2 0 00-1.806.547 2 2 0 00-.547 1.806l.477 2.387a6 6 0 00.517 3.86l.158.318a6 6 0 00.517 3.86l2.387.477a2 2 0 001.806-.547a2 2 0 00.547-1.806l-.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 00-.517-3.86zM14 5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);


const CodeIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);

const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

export const CHALLENGE_CATEGORIES: ChallengeCategory[] = [
    {
        title: 'Logic Puzzles',
        description: 'Outsmart the AI with your reasoning and deduction skills.',
        icon: <BrainIcon />,
        prompt: 'Present a clever logic puzzle suitable for a 10-16 year old. The puzzle should be solvable with careful thought, but not immediately obvious. Make it themed around hacking, cryptography, or computer science.'
    },
    {
        title: 'Creative Problems',
        description: 'Generate innovative solutions to unconventional problems.',
        icon: <BeakerIcon />,
        prompt: 'Present a creative problem-solving challenge suitable for a 10-16 year old. The user needs to think outside the box. The theme should be retro-futuristic technology.'
    },
    {
        title: 'Code Riddles',
        description: 'Solve programming-based riddles and algorithmic challenges.',
        icon: <CodeIcon />,
        prompt: 'Present a code riddle based on fundamental programming concepts suitable for a beginner aged 10-16. It should be a short snippet of pseudocode or a description of an algorithm with a flaw or a trick. The user has to identify the issue or predict the output. The language should be abstract, not specific to a real programming language.'
    }
];

export const DECRYPTION_HUB_ITEM = {
    title: 'Decryption Hub',
    description: 'Access the shop to spend Data Bits on terminal upgrades.',
    icon: <LockIcon />,
    prompt: '' // Not a real challenge, so prompt is empty
};

export const VOICES: Voice[] = [
    { name: 'Default', description: 'Standard Zyber voice.', cost: 0 },
    { name: 'Glitched', description: 'A corrupted, unstable voice.', cost: 50 },
// Fix: Added missing colon after 'name' property key.
    { name: 'Oracle', description: 'A deeper, more mysterious voice.', cost: 75 },
];


export const DEFAULT_VOICE_SETTINGS: Omit<VoiceSettings, 'uiSoundsEnabled' | 'voiceOutputEnabled'> = {
    gender: 'male',
    language: 'en',
    vocoderEnabled: true,
    vocoderFrequency: 40,
};