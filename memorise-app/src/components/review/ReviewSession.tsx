import React, { useState, useRef, useCallback } from 'react';
import { IonContent, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { FlashCard } from '../cards/FlashCard';
import { DifficultyButtons } from '../cards/DifficultyButtons';
import { ModeSelector } from './ModeSelector';
import { QuizMode } from './modes/QuizMode';
import { TypingMode } from './modes/TypingMode';
import { ReversedMode } from './modes/ReversedMode';
import { useReviewSession } from '../../hooks/useReviewSession';
import { ReviewMode } from '../../models/ReviewLog';
import { formatDuration } from '../../utils/dateHelpers';
import { DifficultyRating } from '../../utils/sm2Algorithm';
import { useDeckContext } from '../../contexts/DeckContext';
import './ReviewSession.css';

interface ReviewSessionProps {
  deckId: string;
  onComplete: () => void;
  onExit: () => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  deckId,
  onComplete,
  onExit,
}) => {
  const [selectedMode, setSelectedMode] = useState<ReviewMode | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  const finalTime = useRef(0);
  const finalTotal = useRef(0);
  const finalResults = useRef({ again: 0, hard: 0, good: 0, easy: 0 });

  // Get all cards for quiz mode distractors
  const { cards } = useDeckContext();

  const reviewMode = selectedMode || 'classic';

  const {
    currentCard,
    isFlipped,
    isTransitioning,
    flipCard,
    handleReview,
    progress,
    cardsRemaining,
    sessionTime,
    isComplete,
    totalCards,
    results,
  } = useReviewSession(deckId, reviewMode);

  React.useEffect(() => {
    if (isComplete && !showComplete && selectedMode) {
      finalTime.current = sessionTime;
      finalTotal.current = totalCards;
      finalResults.current = { ...results };
      setShowComplete(true);
    }
  }, [isComplete, showComplete, sessionTime, totalCards, results, selectedMode]);

  const handleModeAnswer = useCallback((difficulty: DifficultyRating) => {
    handleReview(difficulty);
  }, [handleReview]);

  // Mode selection screen
  if (!selectedMode) {
    return (
      <IonContent>
        <ModeSelector
          onSelect={setSelectedMode}
          onCancel={onExit}
          cardCount={totalCards}
        />
      </IonContent>
    );
  }

  // Complete screen
  if (showComplete) {
    const { again, hard, good, easy } = finalResults.current;
    return (
      <IonContent>
        <div className="session-complete">
          <div className="complete-emoji">🎉</div>
          <h1>Session Complete</h1>
          <p className="complete-subtitle">Great work!</p>

          <div className="complete-stats">
            <div className="complete-stat">
              <span className="complete-stat-value">{finalTotal.current}</span>
              <span className="complete-stat-label">Cards</span>
            </div>
            <div className="complete-stat">
              <span className="complete-stat-value">{formatDuration(finalTime.current)}</span>
              <span className="complete-stat-label">Time</span>
            </div>
          </div>

          <div className="complete-breakdown">
            <div className="breakdown-item again"><span>{again}</span> Again</div>
            <div className="breakdown-item hard"><span>{hard}</span> Hard</div>
            <div className="breakdown-item good"><span>{good}</span> Good</div>
            <div className="breakdown-item easy"><span>{easy}</span> Easy</div>
          </div>

          <div className="complete-actions">
            <button className="btn btn-primary btn-block" onClick={onComplete}>
              Done
            </button>
          </div>
        </div>
      </IonContent>
    );
  }

  // Empty state
  if (!currentCard) {
    return (
      <IonContent>
        <div className="session-empty">
          <div className="complete-emoji">✨</div>
          <h2>All done!</h2>
          <p>No cards due for review.</p>
          <button className="btn btn-primary" onClick={onExit}>
            Back
          </button>
        </div>
      </IonContent>
    );
  }

  // Render mode-specific content
  const renderModeContent = () => {
    switch (selectedMode) {
      case 'quiz':
        return (
          <QuizMode
            card={currentCard}
            allCards={cards}
            onAnswer={handleModeAnswer}
            disabled={isTransitioning}
          />
        );

      case 'typing':
        return (
          <TypingMode
            card={currentCard}
            onAnswer={handleModeAnswer}
            disabled={isTransitioning}
          />
        );

      case 'reversed':
        return (
          <ReversedMode
            card={currentCard}
            onAnswer={handleModeAnswer}
            disabled={isTransitioning}
          />
        );

      case 'classic':
      default:
        return (
          <>
            <div className={`session-card ${isTransitioning ? 'transitioning' : ''}`}>
              <FlashCard
                front={currentCard.front}
                back={currentCard.back}
                isFlipped={isFlipped}
                onFlip={!isFlipped && !isTransitioning ? flipCard : undefined}
                image={currentCard.image}
              />
            </div>

            <div className="session-controls">
              {!isFlipped ? (
                <button
                  className="btn btn-primary btn-block btn-large"
                  onClick={flipCard}
                  disabled={isTransitioning}
                >
                  Show Answer
                </button>
              ) : (
                <DifficultyButtons
                  card={currentCard}
                  onDifficultySelect={handleReview}
                  disabled={isTransitioning}
                />
              )}
            </div>
          </>
        );
    }
  };

  return (
    <IonContent>
      <div className="session">
        {/* Header */}
        <header className="session-header">
          <div className="session-progress-info">
            <span className="session-count">{totalCards - cardsRemaining}/{totalCards}</span>
            <span className="session-time">{formatDuration(sessionTime)}</span>
          </div>
          <span className="session-mode-badge">{selectedMode}</span>
          <button className="session-close" onClick={onExit}>
            <IonIcon icon={closeOutline} />
          </button>
        </header>

        {/* Progress bar */}
        <div className="session-progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Mode-specific content */}
        <div className="session-content">
          {renderModeContent()}
        </div>
      </div>
    </IonContent>
  );
};
