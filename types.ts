export enum Gender {
  BOY = 'BOY',
  GIRL = 'GIRL'
}

export interface VoteRecord {
  id: string;
  name: string;
  choice: Gender;
  timestamp: number;
  amount: number;      // 下注金額
  userComment?: string;
  userId: string;     // Unique ID from Google Auth to prevent double voting
  photoURL?: string;  // User's avatar
  email?: string;     // User's email from Google Auth
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