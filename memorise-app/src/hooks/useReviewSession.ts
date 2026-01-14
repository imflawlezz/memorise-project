import { useState, useCallback, useRef, useEffect } from 'react';
import { Card } from '../models/Card';
import { ReviewMode } from '../models/ReviewLog';
import { ReviewResult, createActiveSession } from '../models/StudySession';
import { useDeckContext } from '../contexts/DeckContext';
import { DifficultyRating, getQualityFromDifficulty } from '../utils/sm2Algorithm';

interface UseReviewSessionReturn {
  currentCard: Card | undefined;
  isFlipped: boolean;
  isTransitioning: boolean;
  flipCard: () => void;
  handleReview: (difficulty: DifficultyRating) => Promise<void>;
  progress: number;
  cardsRemaining: number;
  sessionTime: number;
  isComplete: boolean;
  totalCards: number;
  /** Results breakdown by difficulty */
  results: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

/**
 * Hook for managing a review session
 * Handles queue, card flipping, review submission, and session statistics
 */
export const useReviewSession = (
  deckId: string,
  reviewMode: ReviewMode
): UseReviewSessionReturn => {
  const { reviewCard, buildReviewQueue, getDeck } = useDeckContext();

  const [queue, setQueue] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [reviewed, setReviewed] = useState<ReviewResult[]>([]);
  const [results, setResults] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const sessionStartTime = useRef(Date.now());
  const cardStartTime = useRef(Date.now());
  const lastDeckId = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect - updates every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - sessionStartTime.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Initialize queue when deckId changes
  useEffect(() => {
    if (lastDeckId.current === deckId) {
      return;
    }

    const deck = getDeck(deckId);
    if (deck) {
      lastDeckId.current = deckId;
      const reviewQueue = buildReviewQueue(
        deckId,
        deck.settings.newCardsPerDay,
        deck.settings.reviewsPerDay
      );

      setQueue(reviewQueue);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsTransitioning(false);
      setSessionTime(0);
      setReviewed([]);
      setResults({ again: 0, hard: 0, good: 0, easy: 0 });
      sessionStartTime.current = Date.now();
      cardStartTime.current = Date.now();
    }
  }, [deckId, getDeck, buildReviewQueue]);

  const currentCard = queue[currentIndex];

  const flipCard = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleReview = useCallback(async (difficulty: DifficultyRating) => {
    if (!currentCard || isTransitioning) return;

    const timeSpent = Math.floor((Date.now() - cardStartTime.current) / 1000);

    // Submit review to context
    await reviewCard(currentCard.id, difficulty, reviewMode, timeSpent);

    // Record result for session summary
    const result: ReviewResult = {
      cardId: currentCard.id,
      quality: getQualityFromDifficulty(difficulty),
      timeSpent: Date.now() - cardStartTime.current,
      timestamp: new Date(),
    };
    setReviewed(prev => [...prev, result]);

    // Update results breakdown
    setResults(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1,
    }));

    // Start transition animation
    setIsTransitioning(true);
    setIsFlipped(false);

    // Wait for animation then advance
    setTimeout(() => {
      setCurrentIndex(prevIndex => {
        if (prevIndex < queue.length - 1) {
          cardStartTime.current = Date.now();
          return prevIndex + 1;
        } else {
          // Session complete
          return -1;
        }
      });
      setIsTransitioning(false);
    }, 150);
  }, [currentCard, queue.length, reviewCard, reviewMode, isTransitioning]);

  const progress = queue.length > 0 ? ((currentIndex + 1) / queue.length) * 100 : 0;
  const cardsRemaining = Math.max(0, queue.length - currentIndex - 1);

  return {
    currentCard,
    isFlipped,
    isTransitioning,
    flipCard,
    handleReview,
    progress,
    cardsRemaining,
    sessionTime,
    isComplete: currentIndex === -1,
    totalCards: queue.length,
    results,
  };
};
