import React from 'react';
import './ColorPicker.css';

const PRESET_COLORS = [
    '#6366f1', // Indigo (default)
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308', // Yellow
    '#22c55e', // Green
    '#14b8a6', // Teal
    '#06b6d4', // Cyan
    '#3b82f6', // Blue
];

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
    return (
        <div className="color-picker">
            <label className="color-picker-label">Color</label>
            <div className="color-options">
                {PRESET_COLORS.map((color) => (
                    <button
                        key={color}
                        type="button"
                        className={`color-option ${value === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => onChange(color)}
                        aria-label={`Select color ${color}`}
                    />
                ))}
            </div>
        </div>
    );
};
