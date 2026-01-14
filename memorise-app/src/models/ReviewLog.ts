/**
 * Quality rating for a review (SM-2 scale)
 * 0 = Complete blackout
 * 1 = Wrong, but recognized after seeing answer
 * 2 = Wrong, but easy to recall after seeing answer
 * 3 = Correct with difficulty
 * 4 = Correct with hesitation
 * 5 = Perfect response
 */
export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

/**
 * Available review modes
 */
export type ReviewMode = 'classic' | 'quiz' | 'typing' | 'reversed' | 'mixed';

/**
 * ReviewLog - Record of a single card review
 * Used for statistics and learning analytics
 */
export interface ReviewLog {
  id: string;
  cardId: string;
  deckId: string;
  reviewDate: Date;
  quality: Quality;
  reviewMode: ReviewMode;
  /** Time spent on this card in seconds */
  timeSpent: number;
  previousEF: number;
  newEF: number;
  previousInterval: number;
  newInterval: number;
}

/**
 * Creates a new review log entry
 */
export function createReviewLog(
  cardId: string,
  deckId: string,
  quality: Quality,
  reviewMode: ReviewMode,
  timeSpent: number,
  previousEF: number,
  newEF: number,
  previousInterval: number,
  newInterval: number
): ReviewLog {
  return {
    id: crypto.randomUUID(),
    cardId,
    deckId,
    reviewDate: new Date(),
    quality,
    reviewMode,
    timeSpent,
    previousEF,
    newEF,
    previousInterval,
    newInterval,
  };
}
