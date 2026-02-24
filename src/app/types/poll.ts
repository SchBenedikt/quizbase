
export type PollType = 'multiple-choice' | 'open-text' | 'rating' | 'slider' | 'word-cloud' | 'guess-number' | 'ranking' | 'scale';

export interface PollQuestion {
  id: string;
  type: PollType;
  question: string;
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
  theme?: 'orange' | 'red' | 'green' | 'blue' | 'custom' | 'minimal-light' | 'minimal-dark';
  customColor?: string; // Hex color code
  showResultsToParticipants: boolean;
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
  theme?: string;
  customColor?: string;
  createdAt: any;
  updatedAt?: any;
}
