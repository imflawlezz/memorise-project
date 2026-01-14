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

    return JSON.stringify({
      version: 1,
      exportDate: new Date().toISOString(),
      decks,
      cards,
      reviewLogs,
      studySessions,
      settings,
    }, null, 2);
  }

  static async importData(json: string): Promise<void> {
    try {
      const data = JSON.parse(json);

      if (data.decks) {
        await this.saveDecks(deserialize<Deck[]>(JSON.stringify(data.decks)));
      }
      if (data.cards) {
        await this.saveCards(deserialize<Card[]>(JSON.stringify(data.cards)));
      }
      if (data.reviewLogs) {
        await this.saveReviewLogs(deserialize<ReviewLog[]>(JSON.stringify(data.reviewLogs)));
      }
      if (data.studySessions) {
        await this.saveStudySessions(deserialize<StudySession[]>(JSON.stringify(data.studySessions)));
      }
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
