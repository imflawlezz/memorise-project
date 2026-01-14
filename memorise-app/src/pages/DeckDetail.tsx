import React, { useState } from 'react';
import { IonContent, IonPage, IonIcon, IonFab, IonFabButton, IonItem, IonLabel, IonInput, IonTextarea, IonAlert } from '@ionic/react';
import { add, chevronBackOutline, settingsOutline, trashOutline } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { useDeckContext } from '../contexts/DeckContext';
import { Modal } from '../components/common/Modal';
import { CardEditor } from '../components/cards/CardEditor';
import { Card } from '../models/Card';
import './DeckDetail.css';

const DeckDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { getDeck, getCardsByDeck, createCard, updateCard, deleteCard, updateDeck, deleteDeck } = useDeckContext();
  const deck = getDeck(id);
  const cards = getCardsByDeck(id);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditDeckModal, setShowEditDeckModal] = useState(false);
  const [showDeleteCardAlert, setShowDeleteCardAlert] = useState(false);
  const [showDeleteDeckAlert, setShowDeleteDeckAlert] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [deckName, setDeckName] = useState('');
  const [deckDescription, setDeckDescription] = useState('');

  if (!deck) {
    return (
      <IonPage>
        <IonContent>
          <div className="deck-not-found">
            <p>Deck not found</p>
            <button className="btn btn-primary" onClick={() => history.push('/decks')}>
              Go to Decks
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const handleCreateCard = async (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'reviewData'>) => {
    if (!cardData.front?.trim() || !cardData.back?.trim()) return;
    await createCard(id, cardData);
    setShowCreateModal(false);
  };

  const handleEditCard = async (cardData: Omit<Card, 'id' | 'createdAt' | 'updatedAt' | 'reviewData'>) => {
    if (!selectedCard || !cardData.front?.trim() || !cardData.back?.trim()) return;
    await updateCard(selectedCard.id, { front: cardData.front, back: cardData.back, tags: cardData.tags });
    setShowEditModal(false);
    setSelectedCard(null);
  };

  const handleDeleteCard = async () => {
    if (selectedCard) {
      await deleteCard(selectedCard.id);
      setShowDeleteCardAlert(false);
      setSelectedCard(null);
    }
  };

  const openEditDeckModal = () => {
    setDeckName(deck.name);
    setDeckDescription(deck.description);
    setShowEditDeckModal(true);
  };

  const handleEditDeck = async () => {
    if (!deckName.trim()) return;
    await updateDeck(id, { name: deckName.trim(), description: deckDescription.trim() });
    setShowEditDeckModal(false);
  };

  const handleDeleteDeck = async () => {
    await deleteDeck(id);
    setShowDeleteDeckAlert(false);
    history.push('/decks');
  };

  const handleStartReview = () => history.push(`/review/${id}`);

  const dueCount = deck.stats.reviewCards;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="deck-detail">
          {/* Header */}
          <header className="deck-header">
            <button className="back-btn" onClick={() => history.push('/decks')}>
              <IonIcon icon={chevronBackOutline} />
            </button>
            <h1>{deck.name}</h1>
            <button className="settings-btn" onClick={openEditDeckModal}>
              <IonIcon icon={settingsOutline} />
            </button>
          </header>

          {/* Stats */}
          <div className="deck-stats">
            <div className="deck-stat">
              <span className="stat-value">{deck.stats.totalCards}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="deck-stat">
              <span className="stat-value">{deck.stats.newCards}</span>
              <span className="stat-label">New</span>
            </div>
            <div className="deck-stat">
              <span className="stat-value">{dueCount}</span>
              <span className="stat-label">Due</span>
            </div>
          </div>

          {/* Review Button */}
          <button
            className={`review-btn ${dueCount === 0 ? 'disabled' : ''}`}
            onClick={handleStartReview}
            disabled={dueCount === 0}
          >
            {dueCount > 0 ? `Start Review (${dueCount})` : 'No Cards Due'}
          </button>

          {/* Cards List */}
          <section className="cards-section">
            <div className="section-header">
              <h2>Cards ({cards.length})</h2>
              <button className="btn-text" onClick={() => setShowCreateModal(true)}>
                + Add
              </button>
            </div>

            {cards.length === 0 ? (
              <div className="empty-cards">
                <p>No cards yet</p>
                <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                  Create Card
                </button>
              </div>
            ) : (
              <div className="cards-list">
                {cards.map(card => (
                  <div
                    key={card.id}
                    className="card-item"
                    onClick={() => { setSelectedCard(card); setShowEditModal(true); }}
                  >
                    <div className="card-content">
                      <span className="card-front">{card.front}</span>
                      <span className="card-divider">→</span>
                      <span className="card-back">{card.back}</span>
                    </div>
                    <button
                      className="card-delete"
                      onClick={(e) => { e.stopPropagation(); setSelectedCard(card); setShowDeleteCardAlert(true); }}
                    >
                      <IonIcon icon={trashOutline} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowCreateModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Create Card Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Card">
          <CardEditor deckId={id} onSave={handleCreateCard} onCancel={() => setShowCreateModal(false)} />
        </Modal>

        {/* Edit Card Modal */}
        <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setSelectedCard(null); }} title="Edit Card">
          {selectedCard && (
            <CardEditor
              deckId={id}
              initialData={{ front: selectedCard.front, back: selectedCard.back, tags: selectedCard.tags }}
              onSave={handleEditCard}
              onCancel={() => { setShowEditModal(false); setSelectedCard(null); }}
            />
          )}
        </Modal>

        {/* Edit Deck Modal */}
        <Modal isOpen={showEditDeckModal} onClose={() => setShowEditDeckModal(false)} title="Edit Deck" onSave={handleEditDeck}>
          <IonItem>
            <IonLabel position="stacked">Name</IonLabel>
            <IonInput value={deckName} onIonInput={(e) => setDeckName(e.detail.value || '')} placeholder="Deck name" />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description</IonLabel>
            <IonTextarea value={deckDescription} onIonInput={(e) => setDeckDescription(e.detail.value || '')} placeholder="Description" rows={3} />
          </IonItem>
          <div className="danger-section">
            <button className="btn btn-danger" onClick={() => setShowDeleteDeckAlert(true)}>
              <IonIcon icon={trashOutline} /> Delete Deck
            </button>
          </div>
        </Modal>

        <IonAlert
          isOpen={showDeleteCardAlert}
          onDidDismiss={() => { setShowDeleteCardAlert(false); setSelectedCard(null); }}
          header="Delete Card"
          message="Are you sure? This cannot be undone."
          buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Delete', role: 'destructive', handler: handleDeleteCard }]}
        />

        <IonAlert
          isOpen={showDeleteDeckAlert}
          onDidDismiss={() => setShowDeleteDeckAlert(false)}
          header="Delete Deck"
          message={`Delete "${deck.name}" and all its cards?`}
          buttons={[{ text: 'Cancel', role: 'cancel' }, { text: 'Delete', role: 'destructive', handler: handleDeleteDeck }]}
        />
      </IonContent>
    </IonPage>
  );
};

export default DeckDetail;
