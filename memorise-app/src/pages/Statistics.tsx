import React, { useMemo } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useDeckContext } from '../contexts/DeckContext';
import { formatDuration } from '../utils/dateHelpers';
import './Statistics.css';

const Statistics: React.FC = () => {
  const { decks, cards, loading, getDueCards, getTodayStats } = useDeckContext();

  const stats = useMemo(() => getTodayStats(), [getTodayStats]);
  const dueCount = useMemo(() => getDueCards().length, [getDueCards]);
  const totalCards = cards.length;

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

  return (
    <IonPage>
      <IonContent>
        <div className="stats-page">
          <header className="stats-header">
            <h1>Statistics</h1>
          </header>

          {/* Streak */}
          <div className="streak-card">
            <span className="streak-icon">🔥</span>
            <div className="streak-content">
              <span className="streak-value">{stats.streak}</span>
              <span className="streak-label">day streak</span>
            </div>
          </div>

          {/* Today */}
          <section className="stats-section">
            <h2>Today</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-value">{stats.reviewed}</span>
                <span className="stat-label">Reviewed</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{stats.newSeen}</span>
                <span className="stat-label">New</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{formatDuration(stats.timeSpent)}</span>
                <span className="stat-label">Time</span>
              </div>
              <div className="stat-card stat-card-accent">
                <span className="stat-value">{dueCount}</span>
                <span className="stat-label">Due</span>
              </div>
            </div>
          </section>

          {/* Overview */}
          <section className="stats-section">
            <h2>Overview</h2>
            <div className="stats-grid stats-grid-2">
              <div className="stat-card">
                <span className="stat-value">{decks.length}</span>
                <span className="stat-label">Decks</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">{totalCards}</span>
                <span className="stat-label">Cards</span>
              </div>
            </div>
          </section>

          {/* Decks breakdown */}
          {decks.length > 0 && (
            <section className="stats-section">
              <h2>By Deck</h2>
              <div className="deck-stats">
                {decks.map(deck => (
                  <div key={deck.id} className="deck-stat-row">
                    <div
                      className="deck-stat-dot"
                      style={{ background: deck.color }}
                    />
                    <div className="deck-stat-info">
                      <span className="deck-stat-name">{deck.name}</span>
                      <span className="deck-stat-meta">
                        {deck.stats.totalCards} cards
                      </span>
                    </div>
                    <span className="deck-stat-due">
                      {deck.stats.reviewCards > 0 && `${deck.stats.reviewCards} due`}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Statistics;
