import { ReviewMode } from './ReviewLog';
import { Card } from './Card';

/**
 * StudySession - Completed learning session record
 * Stored for historical statistics
 */
export interface StudySession {
  id: string;
  deckId: string;
  startDate: Date;
  endDate?: Date;
  cardsReviewed: number;
  newCardsSeen: number;
  /** Total session time in seconds */
  totalTime: number;
  reviewMode: ReviewMode;
}

/**
 * ReviewResult - Result of reviewing a single card during active session
 * Per-spec: tracks timing and quality for session summary
 */
export interface ReviewResult {
  cardId: string;
  quality: number;
  /** Time spent on this card in milliseconds */
  timeSpent: number;
  timestamp: Date;
}

/**
 * ActiveSession - In-progress learning session state
 * This is runtime state, not persisted to storage
 */
export interface ActiveSession {
  id: string;
  deckId: string;
  startTime: Date;
  /** Cards remaining to review in order */
  queue: Card[];
  /** Current position in queue */
  currentIndex: number;
  /** Results of already-reviewed cards */
  reviewed: ReviewResult[];
  isPaused: boolean;
}

/**
 * Creates a new active session
 */
export function createActiveSession(deckId: string, queue: Card[]): ActiveSession {
  return {
    id: crypto.randomUUID(),
    deckId,
    startTime: new Date(),
    queue,
    currentIndex: 0,
    reviewed: [],
    isPaused: false,
  };
}

/**
 * Converts an active session to a completed study session for storage
 */
export function finalizeSession(session: ActiveSession, reviewMode: ReviewMode): StudySession {
  const newCardsSeen = session.reviewed.filter((r, idx) => {
    const card = session.queue[idx];
    return card?.reviewData.state === 'new';
  }).length;

  return {
    id: session.id,
    deckId: session.deckId,
    startDate: session.startTime,
    endDate: new Date(),
    cardsReviewed: session.reviewed.length,
    newCardsSeen,
    totalTime: Math.floor((Date.now() - session.startTime.getTime()) / 1000),
    reviewMode,
  };
}
