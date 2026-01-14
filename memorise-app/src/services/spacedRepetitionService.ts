import { Card } from '../models/Card';
import { ReviewLog } from '../models/ReviewLog';
import { createReviewLog } from '../models/ReviewLog';
import { calculateSM2, getQualityFromDifficulty, DifficultyRating } from '../utils/sm2Algorithm';
import { isSameDay, isDatePast, isDateToday } from '../utils/dateHelpers';

/**
 * SpacedRepetitionService - Core learning logic
 * Handles card categorization, queue building, and review processing
 */
export class SpacedRepetitionService {

  // ============ Card Categorization ============

  /**
   * Get cards that are overdue (nextReviewDate < today)
   * These have highest priority per spec
   */
  static getOverdueCards(cards: Card[]): Card[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return cards.filter(card => {
      if (card.reviewData.state === 'new') return false;
      const nextReview = new Date(card.reviewData.nextReviewDate);
      nextReview.setHours(0, 0, 0, 0);
      return nextReview < today;
    });
  }

  /**
   * Get cards due today (nextReviewDate === today)
   */
  static getDueTodayCards(cards: Card[]): Card[] {
    const today = new Date();

    return cards.filter(card => {
      if (card.reviewData.state === 'new') return false;
      return isDateToday(new Date(card.reviewData.nextReviewDate));
    });
  }

  /**
   * Get cards that are due for review (overdue + today)
   */
  static getDueReviewCards(cards: Card[]): Card[] {
    return cards.filter(card => {
      if (card.reviewData.state === 'new') return false;
      const nextReview = new Date(card.reviewData.nextReviewDate);
      return isDatePast(nextReview) || isDateToday(nextReview);
    });
  }

  /**
   * Get new cards (never reviewed)
   */
  static getNewCards(cards: Card[]): Card[] {
    return cards.filter(card => card.reviewData.state === 'new');
  }

  /**
   * Get learning cards (in learning phase)
   */
  static getLearningCards(cards: Card[]): Card[] {
    return cards.filter(card =>
      card.reviewData.state === 'learning' || card.reviewData.state === 'relearning'
    );
  }

  /**
   * Get review cards (graduated cards)
   */
  static getReviewCards(cards: Card[]): Card[] {
    return cards.filter(card => card.reviewData.state === 'review');
  }

  // ============ Queue Building ============

  /**
   * Builds the review queue according to spec prioritization:
   * 1. Overdue cards - sorted by oldest first (most overdue)
   * 2. Due today cards - randomized
   * 3. New cards - limited by maxNewCards, randomized
   * 
   * Cards are interleaved in 1:3 ratio (1 new per 3 reviews)
   */
  static buildReviewQueue(
    cards: Card[],
    maxNewCards: number,
    maxReviewCards: number,
    order: 'random' | 'oldest' | 'newest' = 'random'
  ): Card[] {
    // Step 1: Categorize cards per spec
    const overdue = this.getOverdueCards(cards);
    const dueToday = this.getDueTodayCards(cards);
    const newCards = this.getNewCards(cards);

    // Step 2: Sort within categories
    // Overdue: sort by oldest first (most delayed)
    const sortedOverdue = [...overdue].sort((a, b) => {
      const dateA = new Date(a.reviewData.nextReviewDate).getTime();
      const dateB = new Date(b.reviewData.nextReviewDate).getTime();
      return dateA - dateB;
    });

    // Due today and new: randomize
    const shuffledDueToday = this.shuffle([...dueToday]);
    const shuffledNew = this.shuffle([...newCards]).slice(0, maxNewCards);

    // Combine review cards (overdue first, then today's)
    const reviewCardsQueue = [...sortedOverdue, ...shuffledDueToday];

    // Step 3: Interleave new cards with reviews (1:3 ratio)
    const finalQueue = this.interleave(reviewCardsQueue, shuffledNew, 3);

    return finalQueue;
  }

  /**
   * Fisher-Yates shuffle
   */
  private static shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Interleave new cards into review queue
   * Ratio of N means: insert 1 new card after every N review cards
   */
  private static interleave(
    reviewCards: Card[],
    newCards: Card[],
    ratio: number
  ): Card[] {
    const result: Card[] = [];
    let newIdx = 0;

    for (let i = 0; i < reviewCards.length; i++) {
      result.push(reviewCards[i]);

      // After every `ratio` reviews, insert a new card
      if ((i + 1) % ratio === 0 && newIdx < newCards.length) {
        result.push(newCards[newIdx]);
        newIdx++;
      }
    }

    // Append remaining new cards at the end
    while (newIdx < newCards.length) {
      result.push(newCards[newIdx]);
      newIdx++;
    }

    return result;
  }

  // ============ Review Processing ============

  /**
   * Process a card review and return updated card + review log
   */
  static reviewCard(
    card: Card,
    difficulty: DifficultyRating,
    reviewMode: ReviewLog['reviewMode'],
    timeSpent: number
  ): { updatedCard: Card; reviewLog: ReviewLog } {
    const quality = getQualityFromDifficulty(difficulty);
    const previousEF = card.reviewData.easinessFactor;
    const previousInterval = card.reviewData.interval;

    // Apply SM-2 algorithm
    const updatedReviewData = calculateSM2(quality, card.reviewData);

    const updatedCard: Card = {
      ...card,
      reviewData: updatedReviewData,
      updatedAt: new Date(),
    };

    const reviewLog = createReviewLog(
      card.id,
      card.deckId,
      quality,
      reviewMode,
      timeSpent,
      previousEF,
      updatedReviewData.easinessFactor,
      previousInterval,
      updatedReviewData.interval
    );

    return { updatedCard, reviewLog };
  }

  // ============ Statistics Helpers ============

  /**
   * Get count of cards due today (for display)
   */
  static getTodaysDueCount(cards: Card[], maxNewCards: number): number {
    const newCards = this.getNewCards(cards);
    const dueReviewCards = this.getDueReviewCards(cards);

    const todaysNewCards = Math.min(newCards.length, maxNewCards);
    return todaysNewCards + dueReviewCards.length;
  }

  /**
   * Sort cards by priority
   */
  static sortCardsByPriority(
    cards: Card[],
    order: 'random' | 'oldest' | 'newest' = 'random'
  ): Card[] {
    const sorted = [...cards];

    if (order === 'random') {
      return this.shuffle(sorted);
    }

    if (order === 'oldest') {
      return sorted.sort((a, b) => {
        const dateA = new Date(a.reviewData.nextReviewDate).getTime();
        const dateB = new Date(b.reviewData.nextReviewDate).getTime();
        return dateA - dateB;
      });
    }

    if (order === 'newest') {
      return sorted.sort((a, b) => {
        const dateA = new Date(a.reviewData.nextReviewDate).getTime();
        const dateB = new Date(b.reviewData.nextReviewDate).getTime();
        return dateB - dateA;
      });
    }

    return sorted;
  }
}
