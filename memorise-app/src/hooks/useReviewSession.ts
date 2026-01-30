import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Card } from '../models/Card';
import { ReviewMode } from '../models/ReviewLog';
import { ReviewResult } from '../models/StudySession';
import { useDeckContext } from '../contexts/DeckContext';
import { DifficultyRating, getQualityFromDifficulty } from '../utils/sm2Algorithm';
import { StorageService, getDefaultSettings } from '../services/storageService';

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
  results: {
    again: number;
    hard: number;
    good: number;
    easy: number;
  };
}

/**
 * Hook for managing a review session
 * Supports single deck review or "all" for all due cards across all decks
 * 
 * This hook builds the queue ONCE when it mounts and uses that queue for the entire session.
 * The queue is NOT rebuilt during the session - this is intentional to prevent
 * issues with cards being added/removed mid-session.
 */
export const useReviewSession = (
  deckId: string,
  reviewMode: ReviewMode
): UseReviewSessionReturn => {
  const { reviewCard, buildReviewQueue, getDeck, getDueCards } = useDeckContext();

  // Load settings synchronously from localStorage for initial queue build
  const getSettings = () => {
    try {
      const stored = localStorage.getItem('memorise_settings');
      if (stored) {
        return { ...getDefaultSettings(), ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    return getDefaultSettings();
  };

  // Build queue ONCE on mount using useMemo with empty deps
  // This ensures the queue is stable for the entire session
  const initialQueue = useMemo(() => {
    const settings = getSettings();
    const maxNew = settings.dailyNewCardLimit;
    const maxReview = settings.dailyReviewLimit;

    if (deckId === 'all') {
      // For "all decks" mode, getDueCards already applies limits
      return getDueCards ? getDueCards() : [];
    } else {
      const deck = getDeck(deckId);
      if (deck) {
        // Use global settings, but respect deck-specific limits if lower
        const deckMaxNew = Math.min(maxNew, deck.settings.newCardsPerDay);
        const deckMaxReview = Math.min(maxReview, deck.settings.reviewsPerDay);
        return buildReviewQueue(deckId, deckMaxNew, deckMaxReview);
      }
    }
    return [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - build once on mount only

  const [queue] = useState<Card[]>(initialQueue);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [reviewed, setReviewed] = useState<ReviewResult[]>([]);
  const [results, setResults] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const sessionStartTime = useRef(Date.now());
  const cardStartTime = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isProcessing = useRef(false); // Lock to prevent double submissions

  // Timer effect
  useEffect(() => {
    sessionStartTime.current = Date.now();
    cardStartTime.current = Date.now();

    timerRef.current = setInterval(() => {
      setSessionTime(Math.floor((Date.now() - sessionStartTime.current) / 1000));
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const currentCard = queue[currentIndex];

  const flipCard = useCallback(() => {
    if (!isProcessing.current) {
      setIsFlipped(true);
    }
  }, []);

  const handleReview = useCallback(async (difficulty: DifficultyRating) => {
    // Double-check protection: both state and ref
    if (!currentCard || isTransitioning || isProcessing.current) return;

    // Set lock immediately to prevent any concurrent calls
    isProcessing.current = true;

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
          // Session complete - set to -1 to indicate completion
          return -1;
        }
      });
      setIsTransitioning(false);
      // Release the lock after transition completes
      isProcessing.current = false;
    }, 300); // Increased to 300ms for better animation
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
