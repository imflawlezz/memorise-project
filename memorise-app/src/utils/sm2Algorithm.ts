import { Quality } from '../models/ReviewLog';
import { ReviewData, CardState } from '../models/Card';

/**
 * SM-2 Algorithm implementation for spaced repetition
 * Based on: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 * 
 * @param quality - User's quality rating (0-5)
 * @param reviewData - Current review data for the card
 * @returns Updated review data with new interval and next review date
 */
export function calculateSM2(quality: Quality, reviewData: ReviewData): ReviewData {
  let { easinessFactor, interval, repetitions, state } = { ...reviewData };

  // Update EF using the SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const efChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  easinessFactor = easinessFactor + efChange;

  // EF cannot go below 1.3 per SM-2 spec
  if (easinessFactor < 1.3) {
    easinessFactor = 1.3;
  }

  // Determine new state based on quality
  let newState: CardState;

  if (quality < 3) {
    // Failed review - reset progress
    repetitions = 0;
    interval = 1; // Repeat tomorrow
    newState = state === 'new' ? 'learning' : 'relearning';
  } else {
    // Passed review - increase interval
    if (repetitions === 0) {
      interval = 1; // First correct: 1 day
    } else if (repetitions === 1) {
      interval = 6; // Second correct: 6 days
    } else {
      // Subsequent: interval * EF
      interval = Math.round(interval * easinessFactor);
    }
    repetitions += 1;
    newState = 'review';
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easinessFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: new Date(),
    state: newState,
  };
}

/**
 * Maps difficulty button to quality value
 * Per spec: Again=0, Hard=2, Good=3, Easy=4
 */
export function getQualityFromDifficulty(difficulty: DifficultyRating): Quality {
  switch (difficulty) {
    case 'again':
      return 0;
    case 'hard':
      return 2;
    case 'good':
      return 3;
    case 'easy':
      return 4;
  }
}

export type DifficultyRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculates the predicted next interval for a given difficulty choice
 * This is used to display under difficulty buttons
 * 
 * Returns interval in days (0 = less than a day / minutes)
 */
export function getNextInterval(reviewData: ReviewData, difficulty: DifficultyRating): number {
  const quality = getQualityFromDifficulty(difficulty);
  const { easinessFactor, interval, repetitions } = reviewData;

  // Calculate what the new EF would be after this review
  const efChange = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEF = Math.max(1.3, easinessFactor + efChange);

  // Again always resets
  if (difficulty === 'again') {
    return 0; // Shows as "<1d" or "10m"
  }

  // Hard: slightly longer than current, but not full EF multiplier
  if (difficulty === 'hard') {
    if (repetitions === 0) {
      return 1; // First review: 1 day
    } else if (repetitions === 1) {
      return 3; // Second review: shorter than Good
    }
    // Mature cards: multiply by 1.2 (less than EF)
    return Math.max(1, Math.round(interval * 1.2));
  }

  // Good: standard SM-2 progression
  if (difficulty === 'good') {
    if (repetitions === 0) {
      return 1; // First correct: 1 day
    } else if (repetitions === 1) {
      return 6; // Second correct: 6 days
    }
    // Subsequent: interval * EF
    return Math.round(interval * newEF);
  }

  // Easy: interval × EF × 1.3 (bonus multiplier per spec)
  if (difficulty === 'easy') {
    if (repetitions === 0) {
      return 4; // First review with easy: 4 days
    } else if (repetitions === 1) {
      return 10; // Second review with easy: bonus
    }
    // Mature cards: interval × EF × 1.3
    return Math.round(interval * newEF * 1.3);
  }

  return interval;
}

/**
 * Formats an interval as a human-readable string
 */
export function formatInterval(days: number): string {
  if (days === 0) {
    return '<1d';
  }
  if (days === 1) {
    return '1d';
  }
  if (days < 30) {
    return `${days}d`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    return `${months}mo`;
  }
  const years = (days / 365).toFixed(1);
  return `${years}y`;
}
