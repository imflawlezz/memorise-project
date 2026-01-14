/**
 * DeckSettings - Per-deck learning configuration
 */
export interface DeckSettings {
  /** Maximum new cards to introduce per day */
  newCardsPerDay: number;
  /** Maximum reviews per day (soft limit) */
  reviewsPerDay: number;
  /** Order of card presentation */
  cardOrder: CardOrder;
}

export type CardOrder = 'random' | 'oldest' | 'newest';

/**
 * DeckStats - Computed statistics for a deck
 * These are derived from card states and should be recalculated, not stored
 */
export interface DeckStats {
  /** Total cards in the deck */
  totalCards: number;
  /** Cards never reviewed */
  newCards: number;
  /** Cards in learning phase */
  learningCards: number;
  /** Cards due for review today (includes overdue + due + limited new) */
  reviewCards: number;
  /** Average easiness factor across all cards */
  averageEF: number;
}

/**
 * Deck category options
 */
export type DeckCategory =
  | 'languages'
  | 'science'
  | 'history'
  | 'math'
  | 'programming'
  | 'medicine'
  | 'law'
  | 'other'
  | '';

/**
 * Deck - A collection of related flashcards
 */
export interface Deck {
  id: string;
  name: string;
  description: string;
  category: DeckCategory;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  settings: DeckSettings;
  stats: DeckStats;
  /** Soft delete flag - archived decks are hidden but not deleted */
  isArchived?: boolean;
}

/**
 * Default deck settings
 */
export function createDefaultSettings(): DeckSettings {
  return {
    newCardsPerDay: 20,
    reviewsPerDay: 100,
    cardOrder: 'random',
  };
}

/**
 * Empty deck statistics
 */
export function createEmptyStats(): DeckStats {
  return {
    totalCards: 0,
    newCards: 0,
    learningCards: 0,
    reviewCards: 0,
    averageEF: 0,
  };
}

/**
 * Creates a new deck with default values
 */
export function createDefaultDeck(): Omit<Deck, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    category: '',
    color: '#5B8DEF',
    settings: createDefaultSettings(),
    stats: createEmptyStats(),
    isArchived: false,
  };
}

/**
 * Validates deck name
 */
export function validateDeckName(name: string): { valid: boolean; error?: string } {
  if (!name.trim()) {
    return { valid: false, error: 'Deck name is required' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Deck name must be 100 characters or less' };
  }
  return { valid: true };
}
