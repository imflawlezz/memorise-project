import React from 'react';
import { Card } from '../../models/Card';
import { DifficultyRating, getNextInterval, formatInterval } from '../../utils/sm2Algorithm';
import './DifficultyButtons.css';

interface DifficultyButtonsProps {
  card: Card;
  onDifficultySelect: (difficulty: DifficultyRating) => void;
  disabled?: boolean;
}

const BUTTONS: { key: DifficultyRating; label: string }[] = [
  { key: 'again', label: 'Again' },
  { key: 'hard', label: 'Hard' },
  { key: 'good', label: 'Good' },
  { key: 'easy', label: 'Easy' },
];

export const DifficultyButtons: React.FC<DifficultyButtonsProps> = ({
  card,
  onDifficultySelect,
  disabled = false,
}) => {
  return (
    <div className="difficulty-buttons">
      {BUTTONS.map(({ key, label }) => {
        const interval = getNextInterval(card.reviewData, key);
        return (
          <button
            key={key}
            className={`diff-btn diff-${key}`}
            onClick={() => onDifficultySelect(key)}
            disabled={disabled}
          >
            <span className="diff-label">{label}</span>
            <span className="diff-interval">{formatInterval(interval)}</span>
          </button>
        );
      })}
    </div>
  );
};
