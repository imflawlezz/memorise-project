import React, { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { checkmarkCircle, closeCircle } from 'ionicons/icons';
import { Card } from '../../../models/Card';
import { DifficultyRating } from '../../../utils/sm2Algorithm';
import './TypingMode.css';

interface TypingModeProps {
    card: Card;
    onAnswer: (difficulty: DifficultyRating) => void;
    disabled?: boolean;
}

/**
 * Fuzzy match - checks if answer is close enough (allows minor typos)
 */
function checkAnswer(input: string, correct: string): { isCorrect: boolean; similarity: number } {
    const normalizedInput = input.toLowerCase().trim();
    const normalizedCorrect = correct.toLowerCase().trim();

    // Exact match
    if (normalizedInput === normalizedCorrect) {
        return { isCorrect: true, similarity: 1 };
    }

    // Calculate Levenshtein distance for similarity
    const distance = levenshteinDistance(normalizedInput, normalizedCorrect);
    const maxLen = Math.max(normalizedInput.length, normalizedCorrect.length);
    const similarity = maxLen > 0 ? 1 - (distance / maxLen) : 0;

    // Allow up to 20% errors for "close enough"
    const isCorrect = similarity >= 0.8;

    return { isCorrect, similarity };
}

function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export const TypingMode: React.FC<TypingModeProps> = ({
    card,
    onAnswer,
    disabled = false,
}) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<{ isCorrect: boolean; similarity: number } | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Focus input on mount and when card changes
        inputRef.current?.focus();
        setInput('');
        setResult(null);
    }, [card.id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (disabled || result || !input.trim()) return;

        const checkResult = checkAnswer(input, card.back);
        setResult(checkResult);

        // Auto-advance after showing result
        setTimeout(() => {
            // Map to difficulty based on result
            let difficulty: DifficultyRating;
            if (checkResult.isCorrect) {
                difficulty = checkResult.similarity === 1 ? 'easy' : 'good';
            } else if (checkResult.similarity >= 0.5) {
                difficulty = 'hard';
            } else {
                difficulty = 'again';
            }

            onAnswer(difficulty);
            setInput('');
            setResult(null);
        }, 1500);
    };

    return (
        <>
            {/* Card area - same as Classic */}
            <div className={`session-card ${disabled ? 'transitioning' : ''}`}>
                <div className="typing-card">
                    <span className="card-side-label">TYPE THE ANSWER</span>
                    <div className="card-text">
                        <p>{card.front}</p>
                    </div>
                    {result && !result.isCorrect && (
                        <div className="typing-correct-reveal">
                            <span className="correct-label">Correct:</span>
                            <span className="correct-text">{card.back}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Controls area - same as Classic */}
            <div className="session-controls">
                <form className="typing-form" onSubmit={handleSubmit}>
                    <div className={`typing-input-wrapper ${result ? (result.isCorrect ? 'correct' : 'incorrect') : ''}`}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your answer..."
                            disabled={disabled || !!result}
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                        {result && (
                            <IonIcon
                                icon={result.isCorrect ? checkmarkCircle : closeCircle}
                                className="result-icon"
                            />
                        )}
                    </div>

                    {!result && (
                        <button
                            type="submit"
                            className="btn btn-primary btn-block btn-large"
                            disabled={disabled || !input.trim()}
                        >
                            Check
                        </button>
                    )}
                </form>
            </div>
        </>
    );
};
