import React from 'react';
import { IonIcon } from '@ionic/react';
import {
    layersOutline,      // Classic
    helpCircleOutline,  // Quiz
    createOutline,      // Typing
    swapHorizontalOutline // Reversed
} from 'ionicons/icons';
import { ReviewMode } from '../../models/ReviewLog';
import './ModeSelector.css';

interface ModeSelectorProps {
    onSelect: (mode: ReviewMode) => void;
    onCancel: () => void;
    cardCount: number;
}

interface ModeOption {
    mode: ReviewMode;
    label: string;
    description: string;
    icon: string;
}

const modes: ModeOption[] = [
    {
        mode: 'classic',
        label: 'Classic',
        description: 'See front, reveal back, rate difficulty',
        icon: layersOutline,
    },
    {
        mode: 'quiz',
        label: 'Quiz',
        description: 'Multiple choice from card answers',
        icon: helpCircleOutline,
    },
    {
        mode: 'typing',
        label: 'Typing',
        description: 'Type the answer from memory',
        icon: createOutline,
    },
    {
        mode: 'reversed',
        label: 'Reversed',
        description: 'See back, guess the front',
        icon: swapHorizontalOutline,
    },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({
    onSelect,
    onCancel,
    cardCount,
}) => {
    return (
        <div className="mode-selector">
            <header className="mode-selector-header">
                <h1>Choose Mode</h1>
                <p>{cardCount} cards to review</p>
            </header>

            <div className="mode-options">
                {modes.map((option) => (
                    <button
                        key={option.mode}
                        className="mode-option"
                        onClick={() => onSelect(option.mode)}
                    >
                        <div className="mode-icon">
                            <IonIcon icon={option.icon} />
                        </div>
                        <div className="mode-info">
                            <span className="mode-label">{option.label}</span>
                            <span className="mode-description">{option.description}</span>
                        </div>
                    </button>
                ))}
            </div>

            <button className="btn btn-text mode-cancel" onClick={onCancel}>
                Cancel
            </button>
        </div>
    );
};
