export type PollType = 'multiple-choice' | 'open-text' | 'rating' | 'slider' | 'word-cloud';

export interface PollQuestion {
  id: string;
  type: PollType;
  question: string;
  options?: string[]; // For multiple choice
  range?: { min: number; max: number; step: number }; // For slider
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
  createdAt: any;
}

export interface PollResponse {
  id: string;
  sessionId: string;
  questionId: string;
  value: string | number;
  userId: string;
  createdAt: any;
}