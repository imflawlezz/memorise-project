/**
 * ReviewData - SM-2 algorithm state for a card
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */
export interface ReviewData {
  /** Easiness Factor - multiplier for interval growth. Min: 1.3, Start: 2.5 */
  easinessFactor: number;
  /** Current interval in days until next review */
  interval: number;
  /** Number of consecutive correct answers */
  repetitions: number;
  /** Scheduled date for next review */
  nextReviewDate: Date;
  /** Date of last review (undefined for new cards) */
  lastReviewDate?: Date;
  /** Learning state of the card */
  state: CardState;
}

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

/**
 * Card - A single flashcard with front/back content and review state
 */
export interface Card {
  id: string;
  deckId: string;
  front: string;
  back: string;
  image?: string;
  audio?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  reviewData: ReviewData;
}

/**
 * Creates default review data for a new card
 */
export function createDefaultReviewData(): ReviewData {
  return {
    easinessFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: new Date(),
    state: 'new',
  };
}

/**
 * Creates a new card with default values
 * @param deckId - The deck this card belongs to
 */
export function createDefaultCard(deckId: string): Omit<Card, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    deckId,
    front: '',
    back: '',
    tags: [],
    reviewData: createDefaultReviewData(),
  };
}
