import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Deck, createDefaultDeck, createEmptyStats } from '../models/Deck';
import { Card } from '../models/Card';
import { ReviewLog } from '../models/ReviewLog';
import { StudySession } from '../models/StudySession';
import { StorageService } from '../services/storageService';
import { SpacedRepetitionService } from '../services/spacedRepetitionService';
import { DifficultyRating } from '../utils/sm2Algorithm';

interface DeckContextType {
  decks: Deck[];
  cards: Card[];
  reviewLogs: ReviewLog[];
  studySessions: StudySession[];
  loading: boolean;

  // Deck operations
  createDeck: (deck: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'stats'>) => Promise<Deck>;
  updateDeck: (id: string, updates: Partial<Deck>) => Promise<void>;
  deleteDeck: (id: string) => Promise<void>;
  getDeck: (id: string) => Deck | undefined;

  // Card operations
  createCard: (deckId: string, card: Omit<Card, 'id' | 'deckId' | 'createdAt' | 'updatedAt' | 'reviewData'>) => Promise<Card>;
  updateCard: (id: string, updates: Partial<Card>) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  getCardsByDeck: (deckId: string) => Card[];

  // Review operations
  reviewCard: (cardId: string, difficulty: DifficultyRating, reviewMode: ReviewLog['reviewMode'], timeSpent: number) => Promise<void>;
  getDueCards: (deckId?: string) => Card[];
  buildReviewQueue: (deckId: string, maxNew?: number, maxReview?: number) => Card[];

  // Stats
  updateDeckStats: (deckId: string) => Promise<void>;
  getTodayStats: () => { reviewed: number; newSeen: number; timeSpent: number; streak: number };

  // Refresh data
  refreshData: () => Promise<void>;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const useDeckContext = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (!context) {
    throw new Error('useDeckContext must be used within DeckProvider');
  }
  return context;
};

/**
 * Calculate deck stats from cards
 */
function calculateDeckStats(deckId: string, allCards: Card[], deckSettings?: { newCardsPerDay: number }): Deck['stats'] {
  const deckCards = allCards.filter(c => c.deckId === deckId);

  const newCards = SpacedRepetitionService.getNewCards(deckCards);
  const learningCards = SpacedRepetitionService.getLearningCards(deckCards);
  const dueReviewCards = SpacedRepetitionService.getDueReviewCards(deckCards);

  const maxNewCards = deckSettings?.newCardsPerDay ?? 20;
  const todaysNewCards = Math.min(newCards.length, maxNewCards);
  const todaysDue = todaysNewCards + dueReviewCards.length;

  const averageEF = deckCards.length > 0
    ? deckCards.reduce((sum, c) => sum + c.reviewData.easinessFactor, 0) / deckCards.length
    : 0;

  return {
    totalCards: deckCards.length,
    newCards: newCards.length,
    learningCards: learningCards.length,
    reviewCards: todaysDue,
    averageEF,
  };
}

/**
 * Calculate streak (consecutive days with at least one review)
 */
function calculateStreak(reviewLogs: ReviewLog[]): number {
  if (reviewLogs.length === 0) return 0;

  // Get unique dates with reviews, sorted descending
  const reviewDates = new Set<string>();
  reviewLogs.forEach(log => {
    const date = new Date(log.reviewDate).toDateString();
    reviewDates.add(date);
  });

  const sortedDates = Array.from(reviewDates)
    .map(d => new Date(d))
    .sort((a, b) => b.getTime() - a.getTime());

  // Check if today or yesterday has a review (streak must be active)
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (sortedDates[0]?.toDateString() !== today && sortedDates[0]?.toDateString() !== yesterday) {
    return 0;
  }

  // Count consecutive days
  let streak = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = Math.round((sortedDates[i - 1].getTime() - sortedDates[i].getTime()) / 86400000);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  const updateDeckStats = useCallback(async (deckId: string) => {
    const deck = decks.find(d => d.id === deckId);
    const stats = calculateDeckStats(deckId, cards, deck?.settings);

    setDecks(prevDecks => {
      const updatedDecks = prevDecks.map(d => {
        if (d.id === deckId) {
          return { ...d, stats, updatedAt: new Date() };
        }
        return d;
      });
      StorageService.saveDecks(updatedDecks).catch(console.error);
      return updatedDecks;
    });
  }, [cards, decks]);

  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      const [decksData, cardsData, logsData, sessionsData] = await Promise.all([
        StorageService.getDecks(),
        StorageService.getCards(),
        StorageService.getReviewLogs(),
        StorageService.getStudySessions(),
      ]);

      setCards(cardsData);
      setReviewLogs(logsData);
      setStudySessions(sessionsData);

      // Update decks with correct stats
      const decksWithStats = decksData.map(deck => ({
        ...deck,
        stats: calculateDeckStats(deck.id, cardsData, deck.settings),
      }));

      setDecks(decksWithStats);
      await StorageService.saveDecks(decksWithStats);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createDeck = useCallback(async (deckData: Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'stats'>): Promise<Deck> => {
    const newDeck: Deck = {
      ...createDefaultDeck(),
      ...deckData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: createEmptyStats(),
    };

    setDecks(prevDecks => {
      const updated = [...prevDecks, newDeck];
      StorageService.saveDecks(updated).catch(console.error);
      return updated;
    });

    return newDeck;
  }, []);

  const updateDeck = useCallback(async (id: string, updates: Partial<Deck>) => {
    setDecks(prevDecks => {
      const updated = prevDecks.map(deck =>
        deck.id === id ? { ...deck, ...updates, updatedAt: new Date() } : deck
      );
      StorageService.saveDecks(updated).catch(console.error);
      return updated;
    });
  }, []);

  const deleteDeck = useCallback(async (id: string) => {
    setDecks(prevDecks => {
      const updated = prevDecks.filter(deck => deck.id !== id);
      StorageService.saveDecks(updated).catch(console.error);
      return updated;
    });

    setCards(prevCards => {
      const updated = prevCards.filter(card => card.deckId !== id);
      StorageService.saveCards(updated).catch(console.error);
      return updated;
    });

    // Also remove review logs for this deck
    setReviewLogs(prevLogs => {
      const updated = prevLogs.filter(log => log.deckId !== id);
      StorageService.saveReviewLogs(updated).catch(console.error);
      return updated;
    });
  }, []);

  const getDeck = useCallback((id: string) => {
    return decks.find(deck => deck.id === id);
  }, [decks]);

  const createCard = useCallback(async (
    deckId: string,
    cardData: Omit<Card, 'id' | 'deckId' | 'createdAt' | 'updatedAt' | 'reviewData'>
  ): Promise<Card> => {
    const newCard: Card = {
      ...cardData,
      id: crypto.randomUUID(),
      deckId,
      createdAt: new Date(),
      updatedAt: new Date(),
      reviewData: {
        easinessFactor: 2.5,
        interval: 0,
        repetitions: 0,
        nextReviewDate: new Date(),
        state: 'new',
      },
    };

    setCards(prevCards => {
      const updatedCards = [...prevCards, newCard];
      StorageService.saveCards(updatedCards).catch(console.error);

      // Update deck stats
      const stats = calculateDeckStats(deckId, updatedCards);
      setDecks(prevDecks => {
        const updated = prevDecks.map(deck =>
          deck.id === deckId ? { ...deck, stats, updatedAt: new Date() } : deck
        );
        StorageService.saveDecks(updated).catch(console.error);
        return updated;
      });

      return updatedCards;
    });

    return newCard;
  }, []);

  const updateCard = useCallback(async (id: string, updates: Partial<Card>) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    const updatedCards = cards.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    );
    setCards(updatedCards);
    await StorageService.saveCards(updatedCards);

    // Update deck stats
    const stats = calculateDeckStats(card.deckId, updatedCards);
    setDecks(prevDecks => {
      const updated = prevDecks.map(deck =>
        deck.id === card.deckId ? { ...deck, stats, updatedAt: new Date() } : deck
      );
      StorageService.saveDecks(updated).catch(console.error);
      return updated;
    });
  }, [cards]);

  const deleteCard = useCallback(async (id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;

    const updatedCards = cards.filter(c => c.id !== id);
    setCards(updatedCards);
    await StorageService.saveCards(updatedCards);

    // Update deck stats
    const stats = calculateDeckStats(card.deckId, updatedCards);
    setDecks(prevDecks => {
      const updated = prevDecks.map(deck =>
        deck.id === card.deckId ? { ...deck, stats, updatedAt: new Date() } : deck
      );
      StorageService.saveDecks(updated).catch(console.error);
      return updated;
    });

    // Remove related review logs
    setReviewLogs(prevLogs => {
      const updated = prevLogs.filter(log => log.cardId !== id);
      StorageService.saveReviewLogs(updated).catch(console.error);
      return updated;
    });
  }, [cards]);

  const getCardsByDeck = useCallback((deckId: string) => {
    return cards.filter(card => card.deckId === deckId);
  }, [cards]);

  const reviewCard = useCallback(async (
    cardId: string,
    difficulty: DifficultyRating,
    reviewMode: ReviewLog['reviewMode'],
    timeSpent: number
  ) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    const { updatedCard, reviewLog } = SpacedRepetitionService.reviewCard(
      card,
      difficulty,
      reviewMode,
      timeSpent
    );

    const updatedCards = cards.map(c => c.id === cardId ? updatedCard : c);
    setCards(updatedCards);
    await StorageService.saveCards(updatedCards);

    setReviewLogs(prevLogs => {
      const updated = [...prevLogs, reviewLog];
      StorageService.saveReviewLogs(updated).catch(console.error);
      return updated;
    });

    // Update deck stats
    const stats = calculateDeckStats(card.deckId, updatedCards);
    setDecks(prevDecks => {
      const updated = prevDecks.map(deck =>
        deck.id === card.deckId ? { ...deck, stats, updatedAt: new Date() } : deck
      );
      StorageService.saveDecks(updated).catch(console.error);
      return updated;
    });
  }, [cards]);

  const getDueCards = useCallback((deckId?: string) => {
    // Get cards already reviewed today - exclude them from queue
    const today = new Date().toDateString();
    const reviewedTodayIds = new Set(
      reviewLogs
        .filter(log => new Date(log.reviewDate).toDateString() === today)
        .map(log => log.cardId)
    );

    const filteredCards = (deckId ? cards.filter(c => c.deckId === deckId) : cards)
      .filter(c => !reviewedTodayIds.has(c.id));

    if (deckId) {
      const deck = decks.find(d => d.id === deckId);
      const maxNew = deck?.settings.newCardsPerDay ?? 20;

      // Count new cards already seen today for this deck
      const newSeenTodayCount = reviewLogs.filter(log => {
        if (new Date(log.reviewDate).toDateString() !== today) return false;
        const card = cards.find(c => c.id === log.cardId);
        return card && card.deckId === deckId && log.previousInterval === 0;
      }).length;

      const remainingNewCards = Math.max(0, maxNew - newSeenTodayCount);
      return SpacedRepetitionService.buildReviewQueue(filteredCards, remainingNewCards, 100, 'random');
    }

    // For all decks, aggregate with limits per deck
    const allDueCards: Card[] = [];
    for (const deck of decks) {
      const deckCards = filteredCards.filter(c => c.deckId === deck.id);

      // Count new cards already seen today for this deck
      const newSeenTodayCount = reviewLogs.filter(log => {
        if (new Date(log.reviewDate).toDateString() !== today) return false;
        const card = cards.find(c => c.id === log.cardId);
        return card && card.deckId === deck.id && log.previousInterval === 0;
      }).length;

      const remainingNewCards = Math.max(0, deck.settings.newCardsPerDay - newSeenTodayCount);
      const queue = SpacedRepetitionService.buildReviewQueue(deckCards, remainingNewCards, 100, 'random');
      allDueCards.push(...queue);
    }
    return allDueCards;
  }, [cards, decks, reviewLogs]);

  const buildReviewQueue = useCallback((deckId: string, maxNew = 20, maxReview = 100) => {
    const deck = decks.find(d => d.id === deckId);
    if (!deck) return [];

    // Get cards already reviewed today - exclude them from queue  
    const today = new Date().toDateString();
    const reviewedTodayIds = new Set(
      reviewLogs
        .filter(log => new Date(log.reviewDate).toDateString() === today)
        .map(log => log.cardId)
    );

    // Count new cards already seen today for this deck
    const newSeenTodayCount = reviewLogs.filter(log => {
      if (new Date(log.reviewDate).toDateString() !== today) return false;
      const card = cards.find(c => c.id === log.cardId);
      return card && card.deckId === deckId && log.previousInterval === 0;
    }).length;

    const remainingNewCards = Math.max(0, maxNew - newSeenTodayCount);

    const deckCards = cards
      .filter(c => c.deckId === deckId)
      .filter(c => !reviewedTodayIds.has(c.id));

    return SpacedRepetitionService.buildReviewQueue(
      deckCards,
      remainingNewCards,
      maxReview,
      deck.settings.cardOrder
    );
  }, [decks, cards, reviewLogs]);

  const getTodayStats = useCallback(() => {
    const today = new Date().toDateString();
    const todaysLogs = reviewLogs.filter(log =>
      new Date(log.reviewDate).toDateString() === today
    );

    const reviewed = todaysLogs.length;
    const timeSpent = todaysLogs.reduce((sum, log) => sum + log.timeSpent, 0);

    // Count new cards seen today
    const newCardIds = new Set<string>();
    todaysLogs.forEach(log => {
      const card = cards.find(c => c.id === log.cardId);
      if (card && log.previousInterval === 0) {
        newCardIds.add(log.cardId);
      }
    });
    const newSeen = newCardIds.size;

    const streak = calculateStreak(reviewLogs);

    return { reviewed, newSeen, timeSpent, streak };
  }, [reviewLogs, cards]);

  const value: DeckContextType = {
    decks,
    cards,
    reviewLogs,
    studySessions,
    loading,
    createDeck,
    updateDeck,
    deleteDeck,
    getDeck,
    createCard,
    updateCard,
    deleteCard,
    getCardsByDeck,
    reviewCard,
    getDueCards,
    buildReviewQueue,
    updateDeckStats,
    getTodayStats,
    refreshData,
  };

  return <DeckContext.Provider value={value}>{children}</DeckContext.Provider>;
};
