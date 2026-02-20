export type PollType = 'multiple-choice' | 'open-text' | 'rating' | 'slider' | 'word-cloud';
export type AppTheme = 'orange' | 'green' | 'red' | 'blue';

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
  questions: PollQuestion[];
  currentQuestionIndex: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  theme: AppTheme;
  createdAt: number;
}

export interface PollResponse {
  id: string;
  sessionId: string;
  questionId: string;
  participantId: string;
  value: string | number; // Choice index, open text, or slider value
  timestamp: number;
}
