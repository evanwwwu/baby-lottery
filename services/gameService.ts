import { ref, onValue, runTransaction, set, get } from "firebase/database";
import { db } from "./firebase";
import { GameState, INITIAL_STATE, VoteRecord, Gender } from '../types';

const GAME_REF_PATH = 'gender_reveal/gameState';

let currentLocalState: GameState = INITIAL_STATE;

/**
 * Subscribe to real-time updates from Firebase.
 */
export const subscribeToGameUpdates = (callback: (state: GameState) => void) => {
  const gameRef = ref(db, GAME_REF_PATH);
  
  const unsubscribe = onValue(gameRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const parsedState: GameState = {
        ...INITIAL_STATE,
        ...data,
        votes: data.votes || []
      };
      currentLocalState = parsedState;
      callback(parsedState);
    } else {
      set(gameRef, INITIAL_STATE);
      currentLocalState = INITIAL_STATE;
      callback(INITIAL_STATE);
    }
  });

  return unsubscribe;
};

export const getGameState = (): GameState => {
  return currentLocalState;
};

/**
 * Cast a vote. Now requires userId and photoURL.
 * Prevents double voting by checking userId in transaction.
 */
export const castVote = async (
  name: string, 
  choice: Gender, 
  userId: string,
  photoURL?: string,
  aiMessage?: string, 
  userComment?: string
): Promise<{success: boolean, message?: string, voteId?: string}> => {
  
  const gameRef = ref(db, GAME_REF_PATH);
  const newVoteId = Date.now().toString() + Math.random().toString().slice(2);
  let errorMessage = "";

  try {
    const result = await runTransaction(gameRef, (currentState: GameState | null) => {
      if (!currentState) {
        return INITIAL_STATE;
      }

      if (currentState.isLocked || currentState.isRevealed) {
        return; // Abort
      }

      const currentVotes = currentState.votes || [];

      // CHECK: Does this user already have a vote?
      const alreadyVoted = currentVotes.some(v => v.userId === userId);
      if (alreadyVoted) {
        // We can't return a custom error message from inside the transaction function easily to the outside,
        // but we can abort the update.
        return; 
      }

      if (currentVotes.length >= currentState.maxVotes) {
        return; 
      }

      const newVote: VoteRecord = {
        id: newVoteId,
        name,
        choice,
        timestamp: Date.now(),
        userId,
        photoURL: photoURL || '',
        aiMessage,
        userComment
      };

      return {
        ...currentState,
        votes: [newVote, ...currentVotes]
      };
    });

    if (result.committed) {
      return { success: true, voteId: newVoteId };
    } else {
      // Transaction failed or aborted. 
      // It's hard to distinguish "locked" vs "already voted" purely from committed=false here without extra logic,
      // but usually the UI handles the "already voted" check before calling this.
      // The transaction is the final safety net.
      return { success: false, message: "投票失敗 (可能已鎖定、已滿額或您已投過票)" };
    }
  } catch (error) {
    console.error("Vote failed:", error);
    return { success: false, message: "連線錯誤" };
  }
};

export const deleteVote = async (voteId: string) => {
  const gameRef = ref(db, GAME_REF_PATH);
  try {
    await runTransaction(gameRef, (currentState: GameState | null) => {
      if (!currentState) return INITIAL_STATE;
      
      const currentVotes = currentState.votes || [];
      const updatedVotes = currentVotes.filter(v => v.id !== voteId);
      
      return {
        ...currentState,
        votes: updatedVotes
      };
    });
    return true;
  } catch (error) {
    console.error("Delete vote failed:", error);
    return false;
  }
};

export const adminReset = async () => {
  const gameRef = ref(db, GAME_REF_PATH);
  await set(gameRef, INITIAL_STATE);
};

export const adminSetLock = async (isLocked: boolean) => {
  const gameRef = ref(db, GAME_REF_PATH);
  await runTransaction(gameRef, (state) => {
    if (!state) return INITIAL_STATE;
    return { ...state, isLocked };
  });
};

export const adminReveal = async (winner: Gender | null) => {
  const gameRef = ref(db, GAME_REF_PATH);
  await runTransaction(gameRef, (state) => {
    if (!state) return INITIAL_STATE;
    return { 
      ...state, 
      isRevealed: !!winner, 
      winner,
      isLocked: true 
    };
  });
};

export const adminSetMaxVotes = async (maxVotes: number) => {
  const gameRef = ref(db, GAME_REF_PATH);
  await runTransaction(gameRef, (state) => {
    if (!state) return INITIAL_STATE;
    return { ...state, maxVotes };
  });
};