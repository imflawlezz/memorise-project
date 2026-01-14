import React, { useCallback } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useParams } from 'react-router-dom';
import { useDeckContext } from '../contexts/DeckContext';
import { ReviewSession } from '../components/review/ReviewSession';

const Review: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { getDeck } = useDeckContext();
  const deck = getDeck(id || '');

  const handleComplete = useCallback(() => {
    history.push('/home');
  }, [history]);

  const handleExit = useCallback(() => {
    history.push(`/deck/${id}`);
  }, [history, id]);

  if (!deck || !id) {
    return (
      <IonPage>
        <IonContent>
          <div className="review-not-found">
            <p>Deck not found</p>
            <button className="btn btn-primary" onClick={() => history.push('/decks')}>
              Go to Decks
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <ReviewSession
        deckId={id}
        reviewMode="classic"
        onComplete={handleComplete}
        onExit={handleExit}
      />
    </IonPage>
  );
};

export default Review;
