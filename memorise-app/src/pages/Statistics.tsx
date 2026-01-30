import React, { useMemo } from 'react';
import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import { useDeckContext } from '../contexts/DeckContext';
import { WeeklyChart } from '../components/charts/WeeklyChart';
import { DistributionChart } from '../components/charts/DistributionChart';
import { formatDuration } from '../utils/dateHelpers';
import './Statistics.css';

const Statistics: React.FC = () => {
  const { decks, cards, reviewLogs, loading, getDueCards, getTodayStats } = useDeckContext();

  const stats = useMemo(() => getTodayStats(), [getTodayStats]);
  const dueCount = useMemo(() => getDueCards().length, [getDueCards]);
  const totalCards = cards.length;

  // Calculate weekly data from review logs
  const weeklyData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data: { day: string; count: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();

      const count = reviewLogs.filter(
        log => new Date(log.reviewDate).toDateString() === dateStr
      ).length;

      data.push({
        day: days[date.getDay()],
        count,
      });
    }

    return data;
  }, [reviewLogs]);

  // Calculate card state distribution
  const distributionData = useMemo(() => {
    let newCount = 0;
    let learningCount = 0;
    let reviewCount = 0;

    cards.forEach(card => {
      switch (card.reviewData.state) {
        case 'new':
          newCount++;
          break;
        case 'learning':
        case 'relearning':
          learningCount++;
          break;
        case 'review':
          reviewCount++;
          break;
      }
    });

    return [
      { label: 'New', value: newCount, color: '#6366f1' },
      { label: 'Learning', value: learningCount, color: '#f59e0b' },
      { label: 'Review', value: reviewCount, color: '#10b981' },
    ];
  }, [cards]);

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

          {/* Weekly Activity Chart */}
          <section className="stats-section">
            <h2>This Week</h2>
            <div className="chart-container">
              <WeeklyChart data={weeklyData} />
            </div>
          </section>

          {/* Card Distribution Chart */}
          <section className="stats-section">
            <h2>Card Status</h2>
            <div className="chart-container">
              <DistributionChart data={distributionData} />
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
