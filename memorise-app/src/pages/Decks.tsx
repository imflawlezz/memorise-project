import React, { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonFab, IonFabButton, IonItem, IonLabel, IonInput, IonTextarea } from '@ionic/react';
import { add, chevronForwardOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { useDeckContext } from '../contexts/DeckContext';
import { Modal } from '../components/common/Modal';
import { Deck, createDefaultDeck } from '../models/Deck';
import './Decks.css';

const Decks: React.FC = () => {
  const history = useHistory();
  const { decks, createDeck } = useDeckContext();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeck, setNewDeck] = useState<Omit<Deck, 'id' | 'createdAt' | 'updatedAt' | 'stats'>>(createDefaultDeck());

  const handleCreateDeck = async () => {
    if (newDeck.name.trim()) {
      try {
        await createDeck(newDeck);
        setNewDeck(createDefaultDeck());
        setShowCreateModal(false);
      } catch (error) {
        console.error('Error creating deck:', error);
      }
    }
  };

  const handleDeckClick = (deckId: string) => {
    history.push(`/deck/${deckId}`);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="decks-page">
          <header className="page-header">
            <h1>Decks</h1>
          </header>

          {decks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h2>No decks yet</h2>
              <p>Create your first deck to start learning.</p>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                Create Deck
              </button>
            </div>
          ) : (
            <div className="deck-list">
              {decks.map(deck => (
                <button
                  key={deck.id}
                  className="deck-card"
                  onClick={() => handleDeckClick(deck.id)}
                >
                  <div
                    className="deck-color"
                    style={{ backgroundColor: deck.color }}
                  />
                  <div className="deck-info">
                    <span className="deck-name">{deck.name}</span>
                    <span className="deck-meta">
                      {deck.stats.totalCards} cards
                      {deck.stats.reviewCards > 0 && (
                        <> · <span className="deck-due">{deck.stats.reviewCards} due</span></>
                      )}
                    </span>
                  </div>
                  <IonIcon icon={chevronForwardOutline} className="deck-arrow" />
                </button>
              ))}
            </div>
          )}
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowCreateModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Deck"
          onSave={handleCreateDeck}
        >
          <IonItem>
            <IonLabel position="stacked">Name</IonLabel>
            <IonInput
              value={newDeck.name}
              onIonInput={(e) => setNewDeck({ ...newDeck, name: e.detail.value! })}
              placeholder="e.g., Spanish Vocabulary"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description</IonLabel>
            <IonTextarea
              value={newDeck.description}
              onIonInput={(e) => setNewDeck({ ...newDeck, description: e.detail.value! })}
              placeholder="What's this deck about?"
              rows={3}
            />
          </IonItem>
        </Modal>
      </IonContent>
    </IonPage>
  );
};

export default Decks;
