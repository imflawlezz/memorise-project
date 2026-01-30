import React, { useMemo, useState, useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonSpinner,
  IonIcon
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { chevronForwardOutline } from 'ionicons/icons';
import { useDeckContext } from '../contexts/DeckContext';
import { StorageService, getDefaultSettings } from '../services/storageService';
import { formatDuration } from '../utils/dateHelpers';
import './Home.css';

const Home: React.FC = () => {
  const history = useHistory();
  const { decks = [], getDueCards, getTodayStats, loading } = useDeckContext();
  const [dailyLimit, setDailyLimit] = useState(getDefaultSettings().dailyReviewLimit + getDefaultSettings().dailyNewCardLimit);

  // Load settings to get daily limits
  useEffect(() => {
    StorageService.getSettings().then(settings => {
      setDailyLimit(settings.dailyNewCardLimit + settings.dailyReviewLimit);
    });
  }, []);

  const dueCards = useMemo(() => {
    try {
      return getDueCards ? getDueCards() : [];
    } catch {
      return [];
    }
  }, [getDueCards]);

  const stats = useMemo(() => getTodayStats(), [getTodayStats]);

  // Show the effective count (limited by daily settings)
  const totalDue = dueCards.length;
  const effectiveDueCount = Math.min(totalDue, dailyLimit);

  const handleStartReview = () => {
    if (effectiveDueCount > 0) {
      history.push('/review/all');
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonContent>
          <div className="page-loading">
            <IonSpinner name="crescent" />
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const hasDecks = decks.length > 0;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="home">
          {/* Header */}
          <header className="home-header">
            <h1 className="home-title">Memorise</h1>
          </header>

          {!hasDecks ? (
            /* Empty State */
            <div className="home-empty">
              <div className="empty-icon">📚</div>
              <h2>Welcome to Memorise</h2>
              <p>Create your first deck to start learning with spaced repetition.</p>
              <button
                className="btn btn-primary"
                onClick={() => history.push('/decks')}
              >
                Create Deck
              </button>
            </div>
          ) : (
            <div className="home-content">
              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-item">
                  <span className="stat-value">{stats.streak}</span>
                  <span className="stat-label">Day Streak</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-value">{stats.reviewed}</span>
                  <span className="stat-label">Today</span>
                </div>
                <div className="stat-divider" />
                <div className="stat-item">
                  <span className="stat-value">{formatDuration(stats.timeSpent)}</span>
                  <span className="stat-label">Time</span>
                </div>
              </div>

              {/* Review CTA */}
              {effectiveDueCount > 0 && (
                <button
                  className="review-cta"
                  onClick={handleStartReview}
                >
                  <div className="review-cta-content">
                    <span className="review-cta-count">{effectiveDueCount}</span>
                    <span className="review-cta-text">cards to review</span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} />
                </button>
              )}

              {/* Decks Section */}
              <section className="section">
                <div className="section-header">
                  <h2 className="section-title">Decks</h2>
                  <button
                    className="btn-text"
                    onClick={() => history.push('/decks')}
                  >
                    See all
                  </button>
                </div>

                <div className="deck-list">
                  {decks.slice(0, 3).map(deck => (
                    <button
                      key={deck.id}
                      className="deck-card"
                      onClick={() => history.push(`/deck/${deck.id}`)}
                    >
                      <div
                        className="deck-color"
                        style={{ backgroundColor: deck.color }}
                      />
                      <div className="deck-info">
                        <span className="deck-name">{deck.name}</span>
                        <span className="deck-meta">
                          {deck.stats.totalCards} cards
                          {deck.stats.reviewCards > 0 && (
                            <> · <span className="deck-due">{deck.stats.reviewCards} due</span></>
                          )}
                        </span>
                      </div>
                      <IonIcon icon={chevronForwardOutline} className="deck-arrow" />
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
