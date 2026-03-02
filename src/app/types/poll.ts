
export type PollType = 'multiple-choice' | 'true-false' | 'open-text' | 'rating' | 'slider' | 'word-cloud' | 'guess-number' | 'ranking' | 'scale';

export interface ThemeCategory {
  id: string;
  name: string;
  description?: string;
  color?: string; // Hex color for UI
  icon?: string; // Icon name
  userId?: string; // If user-specific, null for system-wide
  isPublic?: boolean; // Whether it's available to all users
  createdAt: any;
  updatedAt?: any;
}

export interface PollQuestion {
  id: string;
  type: PollType;
  question: string;
  description?: string; // Optional subtitle / hint
  options?: string[]; // For multiple choice, ranking
  correctOptionIndices?: number[]; // For Quiz Mode (Multiple Correct Answers)
  timeLimit?: number; // In seconds, 0 = unlimited
  range?: { min: number; max: number; step: number }; // For slider, guess-number, scale
  labels?: { min: string; max: string }; // For scales
  isDoublePoints?: boolean; // Strategic weighting
  imageUrl?: string; // Anchor visual for the question
  imageHint?: string; // Hint for AI search
  createdAt: number;
}

export interface PollSession {
  id: string;
  code: string;
  title: string;
  userId: string;
  pollId: string;
  currentQuestionId: string | 'lobby' | 'podium' | null;
  status: 'active' | 'ended';
  isStarted?: boolean;
  isQuiz?: boolean;
  theme?: 'orange' | 'red' | 'green' | 'blue' | 'custom' | 'minimal-light' | 'minimal-dark';
  customColor?: string; // Hex color code
  showResultsToParticipants: boolean;
  categoryIds?: string[]; // Array of theme/category IDs
  createdAt: any;
}

export interface PollParticipant {
  id: string;
  nickname?: string;
  status: 'active' | 'kicked';
  score: number;
  streak: number; // Current correct answer streak
  joinedAt: any;
}

export interface PollResponse {
  id: string;
  sessionId: string;
  questionId: string;
  value: string | number | string[]; // string[] for ranking
  userId: string;
  createdAt: any;
}

export interface Survey {
  id: string;
  userId: string;
  title: string;
  isPublic?: boolean;
  isQuiz?: boolean;
  shuffleQuestions?: boolean;
  theme?: string;
  customColor?: string;
  categoryIds?: string[]; // Array of theme/category IDs
  icon?: string; // Icon name for survey card
  createdAt: any;
  updatedAt?: any;
}
