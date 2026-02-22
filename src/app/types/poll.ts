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
  createdAt: number;
}

export interface PollSession {
  id: string;
  code: string;
  title: string;
  userId: string;
  pollId: string;
  currentQuestionId: string | null;
  status: 'active' | 'ended';
  theme?: 'orange' | 'red' | 'green' | 'blue' | 'custom' | 'minimal-light' | 'minimal-dark';
  customColor?: string; // Hex color code
  showResultsToParticipants: boolean;
  createdAt: any;
}

export interface PollResponse {
  id: string;
  sessionId: string;
  questionId: string;
  value: string | number | string[]; // string[] for ranking
  userId: string;
  createdAt: any;
}
