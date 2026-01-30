export enum Gender {
  BOY = 'BOY',
  GIRL = 'GIRL'
}

export interface VoteRecord {
  id: string;
  name: string;
  choice: Gender;
  timestamp: number;
  aiMessage?: string;
  userComment?: string;
  userId: string;     // Unique ID from Google Auth to prevent double voting
  photoURL?: string;  // User's avatar
}

export interface GameState {
  isLocked: boolean;
  isRevealed: boolean;
  winner: Gender | null;
  votes: VoteRecord[];
  maxVotes: number; // For admin control
}

export const INITIAL_STATE: GameState = {
  isLocked: false,
  isRevealed: false,
  winner: null,
  votes: [],
  maxVotes: 100
};