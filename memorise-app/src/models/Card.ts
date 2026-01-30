/**
 * CardState - Tracks learning progression
 */
export type CardState = 'new' | 'learning' | 'review' | 'relearning';

/**
 * ReviewData - SM-2 algorithm state for a card
 */
export interface ReviewData {
    easinessFactor: number;  // EF, starts at 2.5
    interval: number;        // Days until next review
    repetitions: number;     // Consecutive successful reviews
    nextReviewDate: Date;
    lastReviewDate?: Date;
    state: CardState;
}

/**
 * Card - A single flashcard in a deck
 */
export interface Card {
    id: string;
    deckId: string;
    front: string;
    back: string;
    image?: string;          // Optional image URL/base64
    audio?: string;          // Optional audio URL/base64
    tags?: string[];         // Optional tags for organization
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
 */
export function createNewCard(
    deckId: string,
    front: string,
    back: string,
    image?: string
): Omit<Card, 'id'> {
    return {
        deckId,
        front,
        back,
        image,
        createdAt: new Date(),
        updatedAt: new Date(),
        reviewData: createDefaultReviewData(),
    };
}
