import React, { useState } from 'react';
import { Card } from '../../../models/Card';
import { DifficultyRating } from '../../../utils/sm2Algorithm';
import { DifficultyButtons } from '../../cards/DifficultyButtons';
import './ReversedMode.css';

interface ReversedModeProps {
    card: Card;
    onAnswer: (difficulty: DifficultyRating) => void;
    disabled?: boolean;
}

export const ReversedMode: React.FC<ReversedModeProps> = ({
    card,
    onAnswer,
    disabled = false,
}) => {
    const [isRevealed, setIsRevealed] = useState(false);

    const handleReveal = () => {
        if (!disabled) {
            setIsRevealed(true);
        }
    };

    const handleDifficulty = (difficulty: DifficultyRating) => {
        onAnswer(difficulty);
        setIsRevealed(false);
    };

    return (
        <>
            {/* Card area - 3D flip like Classic mode but reversed */}
            <div className={`session-card ${disabled ? 'transitioning' : ''}`}>
                <div
                    className={`reversed-card-container ${isRevealed ? 'flipped' : ''}`}
                    onClick={!isRevealed && !disabled ? handleReveal : undefined}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if ((e.key === 'Enter' || e.key === ' ') && !isRevealed && !disabled) {
                            e.preventDefault();
                            handleReveal();
                        }
                    }}
                >
                    <div className="reversed-card-inner">
                        {/* "Front" - shows the answer (back content) */}
                        <div className="reversed-card-face reversed-card-front">
                            <span className="card-side-label">ANSWER</span>
                            <div className="card-text">
                                <p>{card.back}</p>
                            </div>
                            <span className="card-hint">Tap to reveal question</span>
                        </div>

                        {/* "Back" - shows the question (front content) */}
                        <div className="reversed-card-face reversed-card-back">
                            <span className="card-side-label">QUESTION</span>
                            <div className="card-text">
                                <p>{card.front}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls area - same as Classic */}
            <div className="session-controls">
                {!isRevealed ? (
                    <button
                        className="btn btn-primary btn-block btn-large"
                        onClick={handleReveal}
                        disabled={disabled}
                    >
                        Show Question
                    </button>
                ) : (
                    <DifficultyButtons
                        card={card}
                        onDifficultySelect={handleDifficulty}
                        disabled={disabled}
                    />
                )}
            </div>
        </>
    );
};
