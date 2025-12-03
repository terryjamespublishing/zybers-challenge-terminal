// Service to track user's challenge progression

import { QuestChallenge } from '../types';
import { getChallenges } from './questDataService';

const PROGRESS_KEY = 'zyber_user_progress';

export interface UserProgress {
  currentChallengeIndex: number;
  completedChallengeIds: number[];
  lastCompletedAt: number | null;
  totalTimeSpent: number; // in seconds
  streakDays: number;
  lastPlayedDate: string | null;
}

const DEFAULT_PROGRESS: UserProgress = {
  currentChallengeIndex: 0,
  completedChallengeIds: [],
  lastCompletedAt: null,
  totalTimeSpent: 0,
  streakDays: 0,
  lastPlayedDate: null,
};

// Load user progress from localStorage
export const loadProgress = (): UserProgress => {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY);
    if (stored) {
      return JSON.parse(stored) as UserProgress;
    }
  } catch (e) {
    console.error('[ProgressService] Failed to load progress:', e);
  }
  return DEFAULT_PROGRESS;
};

// Save user progress
export const saveProgress = (progress: UserProgress): void => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('[ProgressService] Failed to save progress:', e);
  }
};

// Get the current challenge based on user's progress
// Challenges are sorted by difficulty (1, 2, 3) then by ID
export const getCurrentChallenge = (): QuestChallenge | null => {
  const challenges = getSortedChallenges();
  const progress = loadProgress();

  if (progress.currentChallengeIndex >= challenges.length) {
    return null; // All challenges completed
  }

  return challenges[progress.currentChallengeIndex];
};

// Get all challenges sorted by difficulty (ascending) for sequential progression
export const getSortedChallenges = (): QuestChallenge[] => {
  const challenges = getChallenges();
  return [...challenges].sort((a, b) => {
    // Sort by difficulty first
    if (a.difficulty !== b.difficulty) {
      return a.difficulty - b.difficulty;
    }
    // Then by ID for consistent ordering
    return a.id - b.id;
  });
};

// Get the next challenge after completing current
export const getNextChallenge = (): QuestChallenge | null => {
  const challenges = getSortedChallenges();
  const progress = loadProgress();
  const nextIndex = progress.currentChallengeIndex + 1;

  if (nextIndex >= challenges.length) {
    return null;
  }

  return challenges[nextIndex];
};

// Mark current challenge as complete and advance
export const completeCurrentChallenge = (timeSpentSeconds: number): void => {
  const challenges = getSortedChallenges();
  const progress = loadProgress();
  const currentChallenge = challenges[progress.currentChallengeIndex];

  if (!currentChallenge) return;

  // Update streak
  const today = new Date().toDateString();
  let newStreak = progress.streakDays;

  if (progress.lastPlayedDate) {
    const lastDate = new Date(progress.lastPlayedDate);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (progress.lastPlayedDate === today) {
      // Already played today, streak stays same
    } else if (lastDate.toDateString() === yesterday.toDateString()) {
      // Played yesterday, increment streak
      newStreak += 1;
    } else {
      // Missed a day, reset streak
      newStreak = 1;
    }
  } else {
    newStreak = 1;
  }

  const updatedProgress: UserProgress = {
    ...progress,
    currentChallengeIndex: progress.currentChallengeIndex + 1,
    completedChallengeIds: [...progress.completedChallengeIds, currentChallenge.id],
    lastCompletedAt: Date.now(),
    totalTimeSpent: progress.totalTimeSpent + timeSpentSeconds,
    streakDays: newStreak,
    lastPlayedDate: today,
  };

  saveProgress(updatedProgress);
};

// Reset progress (for testing or user choice)
export const resetProgress = (): void => {
  saveProgress(DEFAULT_PROGRESS);
};

// Get progress stats for display
export const getProgressStats = () => {
  const progress = loadProgress();
  const challenges = getSortedChallenges();
  const currentChallenge = getCurrentChallenge();

  // Group completed by difficulty
  const completedByDifficulty = {
    easy: progress.completedChallengeIds.filter(id => {
      const c = challenges.find(ch => ch.id === id);
      return c?.difficulty === 1;
    }).length,
    medium: progress.completedChallengeIds.filter(id => {
      const c = challenges.find(ch => ch.id === id);
      return c?.difficulty === 2;
    }).length,
    hard: progress.completedChallengeIds.filter(id => {
      const c = challenges.find(ch => ch.id === id);
      return c?.difficulty === 3;
    }).length,
  };

  return {
    totalChallenges: challenges.length,
    completedCount: progress.completedChallengeIds.length,
    currentIndex: progress.currentChallengeIndex,
    currentChallenge,
    nextChallenge: getNextChallenge(),
    percentComplete: Math.round((progress.completedChallengeIds.length / challenges.length) * 100),
    totalTimeSpent: progress.totalTimeSpent,
    streakDays: progress.streakDays,
    completedByDifficulty,
    isAllComplete: progress.currentChallengeIndex >= challenges.length,
  };
};
