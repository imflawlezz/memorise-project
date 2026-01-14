import React from 'react';
import './FlashCard.css';

interface FlashCardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip?: () => void;
  image?: string;
}

export const FlashCard: React.FC<FlashCardProps> = ({
  front,
  back,
  isFlipped,
  onFlip,
  image,
}) => {
  const handleClick = () => {
    if (onFlip && !isFlipped) {
      onFlip();
    }
  };

  return (
    <div
      className={`card-container ${isFlipped ? 'flipped' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onFlip && !isFlipped) {
          e.preventDefault();
          onFlip();
        }
      }}
    >
      <div className="card">
        {/* Front */}
        <div className="card-face card-front">
          {image && (
            <img src={image} alt="" className="card-image" />
          )}
          <div
            className="card-text"
            dangerouslySetInnerHTML={{ __html: front }}
          />
          {!isFlipped && (
            <span className="card-hint">Tap to reveal</span>
          )}
        </div>

        {/* Back */}
        <div className="card-face card-back">
          <span className="card-side-label">Answer</span>
          <div
            className="card-text"
            dangerouslySetInnerHTML={{ __html: back }}
          />
        </div>
      </div>
    </div>
  );
};
