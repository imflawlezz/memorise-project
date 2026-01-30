import React, { useState, useMemo } from 'react';
import { Card } from '../../../models/Card';
import { DifficultyRating } from '../../../utils/sm2Algorithm';
import './QuizMode.css';

interface QuizModeProps {
    card: Card;
    allCards: Card[];
    onAnswer: (difficulty: DifficultyRating) => void;
    disabled?: boolean;
}

export const QuizMode: React.FC<QuizModeProps> = ({
    card,
    allCards,
    onAnswer,
    disabled = false,
}) => {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [showResult, setShowResult] = useState(false);

    // Generate quiz options (correct answer + 3 distractors)
    const options = useMemo(() => {
        const correctAnswer = card.back;

        // Get other card backs as distractors
        const otherBacks = allCards
            .filter(c => c.id !== card.id && c.back !== correctAnswer)
            .map(c => c.back);

        // Shuffle and take up to 3 distractors
        const shuffled = otherBacks.sort(() => Math.random() - 0.5);
        const distractors = shuffled.slice(0, 3);

        // Combine and shuffle all options
        const allOptions = [correctAnswer, ...distractors];
        return allOptions.sort(() => Math.random() - 0.5);
    }, [card.id, card.back, allCards]);

    const handleSelect = (answer: string) => {
        if (disabled || showResult) return;

        setSelectedAnswer(answer);
        setShowResult(true);

        // Auto-advance after showing result
        setTimeout(() => {
            const isCorrect = answer === card.back;
            // Map result to difficulty: correct = good, wrong = again
            onAnswer(isCorrect ? 'good' : 'again');
            setSelectedAnswer(null);
            setShowResult(false);
        }, 1000);
    };

    const getOptionClass = (option: string) => {
        if (!showResult) return '';
        if (option === card.back) return 'correct';
        if (option === selectedAnswer) return 'incorrect';
        return '';
    };

    return (
        <>
            {/* Card area - same as Classic */}
            <div className={`session-card ${disabled ? 'transitioning' : ''}`}>
                <div className="quiz-card">
                    <span className="card-side-label">QUESTION</span>
                    <div className="card-text">
                        <p>{card.front}</p>
                    </div>
                </div>
            </div>

            {/* Controls area - same as Classic */}
            <div className="session-controls">
                <div className="quiz-options">
                    {options.map((option, index) => (
                        <button
                            key={index}
                            className={`quiz-option ${getOptionClass(option)}`}
                            onClick={() => handleSelect(option)}
                            disabled={disabled || showResult}
                        >
                            <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                            <span className="option-text">{option}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
