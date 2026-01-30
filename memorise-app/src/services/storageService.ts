import { Deck } from '../models/Deck';
import { Card } from '../models/Card';
import { ReviewLog } from '../models/ReviewLog';
import { StudySession } from '../models/StudySession';

const STORAGE_KEYS = {
  DECKS: 'memorise_decks',
  CARDS: 'memorise_cards',
  REVIEW_LOGS: 'memorise_review_logs',
  STUDY_SESSIONS: 'memorise_study_sessions',
  SETTINGS: 'memorise_settings',
} as const;

/**
 * Application settings with typed structure
 * No `any` types - all settings are explicitly defined
 */
export interface AppSettings {
  // Display
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  language: 'en' | 'pl';

  // UX
  animationsEnabled: boolean;
  hapticsEnabled: boolean;

  // Learning
  dailyNewCardLimit: number;
  dailyReviewLimit: number;

  // Session
  showTimer: boolean;
  autoAdvance: boolean;
}

/**
 * Default application settings
 */
export function getDefaultSettings(): AppSettings {
  return {
    theme: 'auto',
    fontSize: 'medium',
    language: 'en',
    animationsEnabled: true,
    hapticsEnabled: true,
    dailyNewCardLimit: 20,
    dailyReviewLimit: 100,
    showTimer: true,
    autoAdvance: false,
  };
}

/**
 * Helper to serialize data with Date handling
 */
function serialize<T>(data: T): string {
  return JSON.stringify(data, (_key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
}

/**
 * Helper to deserialize data with Date reconstruction
 */
function deserialize<T>(json: string): T {
  return JSON.parse(json, (_key, value) => {
    if (value && typeof value === 'object' && value.__type === 'Date') {
      return new Date(value.value);
    }
    return value;
  });
}

/**
 * Storage service - centralized data persistence layer
 * All localStorage access goes through this service
 */
export class StorageService {
  // ============ Decks ============

  static async getDecks(): Promise<Deck[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DECKS);
      if (!data) return [];
      return deserialize<Deck[]>(data);
    } catch (error) {
      console.error('Error reading decks:', error);
      return [];
    }
  }

  static async saveDecks(decks: Deck[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.DECKS, serialize(decks));
    } catch (error) {
      console.error('Error saving decks:', error);
      throw error;
    }
  }

  // ============ Cards ============

  static async getCards(): Promise<Card[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CARDS);
      if (!data) return [];
      return deserialize<Card[]>(data);
    } catch (error) {
      console.error('Error reading cards:', error);
      return [];
    }
  }

  static async getCardsByDeck(deckId: string): Promise<Card[]> {
    const cards = await this.getCards();
    return cards.filter(card => card.deckId === deckId);
  }

  static async saveCards(cards: Card[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.CARDS, serialize(cards));
    } catch (error) {
      console.error('Error saving cards:', error);
      throw error;
    }
  }

  // ============ Review Logs ============

  static async getReviewLogs(): Promise<ReviewLog[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEW_LOGS);
      if (!data) return [];
      return deserialize<ReviewLog[]>(data);
    } catch (error) {
      console.error('Error reading review logs:', error);
      return [];
    }
  }

  static async getReviewLogsByDate(date: Date): Promise<ReviewLog[]> {
    const logs = await this.getReviewLogs();
    const targetDate = date.toDateString();
    return logs.filter(log => new Date(log.reviewDate).toDateString() === targetDate);
  }

  static async saveReviewLogs(logs: ReviewLog[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEW_LOGS, serialize(logs));
    } catch (error) {
      console.error('Error saving review logs:', error);
      throw error;
    }
  }

  // ============ Study Sessions ============

  static async getStudySessions(): Promise<StudySession[]> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      if (!data) return [];
      return deserialize<StudySession[]>(data);
    } catch (error) {
      console.error('Error reading study sessions:', error);
      return [];
    }
  }

  static async saveStudySessions(sessions: StudySession[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, serialize(sessions));
    } catch (error) {
      console.error('Error saving study sessions:', error);
      throw error;
    }
  }

  // ============ Settings ============

  static async getSettings(): Promise<AppSettings> {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return getDefaultSettings();

      // Merge with defaults to handle any missing keys from older versions
      const stored = JSON.parse(data) as Partial<AppSettings>;
      return { ...getDefaultSettings(), ...stored };
    } catch (error) {
      console.error('Error reading settings:', error);
      return getDefaultSettings();
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  // ============ Export/Import ============

  static async exportData(): Promise<string> {
    const [decks, cards, reviewLogs, studySessions, settings] = await Promise.all([
      this.getDecks(),
      this.getCards(),
      this.getReviewLogs(),
      this.getStudySessions(),
      this.getSettings(),
    ]);

    const exportObj = {
      version: 1,
      exportDate: new Date().toISOString(),
      decks,
      cards,
      reviewLogs,
      studySessions,
      settings,
    };

    // Use custom serializer to handle Date objects
    return serialize(exportObj);
  }

  static async importData(json: string): Promise<void> {
    try {
      // Use custom deserializer to reconstruct Date objects
      const data = deserialize<{
        version?: number;
        decks?: Deck[];
        cards?: Card[];
        reviewLogs?: ReviewLog[];
        studySessions?: StudySession[];
        settings?: Partial<AppSettings>;
      }>(json);

      // Validate version
      if (data.version && data.version > 1) {
        throw new Error('Unsupported export version');
      }

      // Import decks
      if (data.decks && Array.isArray(data.decks)) {
        const validDecks = data.decks.map(deck => ({
          ...deck,
          createdAt: deck.createdAt instanceof Date ? deck.createdAt : new Date(deck.createdAt),
          updatedAt: deck.updatedAt instanceof Date ? deck.updatedAt : new Date(deck.updatedAt),
        }));
        await this.saveDecks(validDecks);
      }

      // Import cards
      if (data.cards && Array.isArray(data.cards)) {
        const validCards = data.cards.map(card => ({
          ...card,
          createdAt: card.createdAt instanceof Date ? card.createdAt : new Date(card.createdAt),
          updatedAt: card.updatedAt instanceof Date ? card.updatedAt : new Date(card.updatedAt),
          reviewData: {
            ...card.reviewData,
            nextReviewDate: card.reviewData.nextReviewDate instanceof Date
              ? card.reviewData.nextReviewDate
              : new Date(card.reviewData.nextReviewDate),
            lastReviewDate: card.reviewData.lastReviewDate
              ? (card.reviewData.lastReviewDate instanceof Date
                ? card.reviewData.lastReviewDate
                : new Date(card.reviewData.lastReviewDate))
              : undefined,
          },
        }));
        await this.saveCards(validCards);
      }

      // Import review logs
      if (data.reviewLogs && Array.isArray(data.reviewLogs)) {
        const validLogs = data.reviewLogs.map(log => ({
          ...log,
          reviewDate: log.reviewDate instanceof Date ? log.reviewDate : new Date(log.reviewDate),
        }));
        await this.saveReviewLogs(validLogs);
      }

      // Import study sessions
      if (data.studySessions && Array.isArray(data.studySessions)) {
        const validSessions = data.studySessions.map(session => ({
          ...session,
          startDate: session.startDate instanceof Date ? session.startDate : new Date(session.startDate),
          endDate: session.endDate
            ? (session.endDate instanceof Date ? session.endDate : new Date(session.endDate))
            : undefined,
        }));
        await this.saveStudySessions(validSessions);
      }

      // Import settings
      if (data.settings) {
        await this.saveSettings({ ...getDefaultSettings(), ...data.settings });
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data: invalid format');
    }
  }

  // ============ Utility ============

  static async clearAllData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.DECKS);
    localStorage.removeItem(STORAGE_KEYS.CARDS);
    localStorage.removeItem(STORAGE_KEYS.REVIEW_LOGS);
    localStorage.removeItem(STORAGE_KEYS.STUDY_SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  }

  /**
   * Get storage usage estimate in bytes
   */
  static getStorageSize(): number {
    let total = 0;
    for (const key of Object.values(STORAGE_KEYS)) {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length * 2; // UTF-16 encoding
      }
    }
    return total;
  }
}
