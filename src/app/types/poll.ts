export type PollType = 'multiple-choice' | 'open-text' | 'rating';

export interface PollQuestion {
  id: string;
  type: PollType;
  question: string;
  options?: string[]; // For multiple choice
  createdAt: number;
}

export interface PollSession {
  id: string;
  code: string;
  title: string;
  questions: PollQuestion[];
  currentQuestionIndex: number;
  status: 'draft' | 'active' | 'paused' | 'ended';
  createdAt: number;
}

export interface PollResponse {
  id: string;
  sessionId: string;
  questionId: string;
  participantId: string;
  value: string; // The choice index or open text response
  timestamp: number;
}