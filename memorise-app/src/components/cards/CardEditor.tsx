import React, { useState, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import { Card } from '../../models/Card';
import './CardEditor.css';

interface InitialCardData {
  front: string;
  back: string;
  tags?: string[];
}

interface CardEditorProps {
  card?: Card;
  initialData?: InitialCardData;
  deckId?: string;
  onSave: (card: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'reviewData'>) => Promise<void> | void;
  onCancel?: () => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({ card, initialData, deckId, onSave, onCancel }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
      setTags(card.tags || []);
    } else if (initialData) {
      setFront(initialData.front);
      setBack(initialData.back);
      setTags(initialData.tags || []);
    } else {
      setFront('');
      setBack('');
      setTags([]);
    }
    setTagInput('');
  }, [card, initialData]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    const trimmedFront = front.trim();
    const trimmedBack = back.trim();
    if (!trimmedFront || !trimmedBack) return;

    const finalDeckId = deckId || card?.deckId;
    if (!finalDeckId) return;

    await onSave({
      deckId: finalDeckId,
      front: trimmedFront,
      back: trimmedBack,
      tags,
      image: card?.image,
      audio: card?.audio,
    });
  };

  const isValid = front.trim() && back.trim();
  const isEditing = !!(card || initialData);

  return (
    <div className="card-editor">
      <div className="form-group">
        <label>Front</label>
        <textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="Question or prompt"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Back</label>
        <textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="Answer"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Tags (optional)</label>
        <div className="tag-input-row">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            onKeyPress={handleKeyPress}
          />
          <button
            className="btn-add-tag"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
          >
            Add
          </button>
        </div>
      </div>

      {tags.length > 0 && (
        <div className="tags-container">
          {tags.map(tag => (
            <button key={tag} className="tag" onClick={() => handleRemoveTag(tag)}>
              {tag}
              <IonIcon icon={closeOutline} />
            </button>
          ))}
        </div>
      )}

      <div className="editor-actions">
        {onCancel && (
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button className="btn btn-primary" onClick={handleSave} disabled={!isValid}>
          {isEditing ? 'Save Changes' : 'Create Card'}
        </button>
      </div>
    </div>
  );
};
