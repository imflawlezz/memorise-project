import React, { useCallback, useState, useEffect } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import { useHistory, useParams, useLocation } from 'react-router-dom';
import { useDeckContext } from '../contexts/DeckContext';
import { ReviewSession } from '../components/review/ReviewSession';

const Review: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const location = useLocation();
  const { getDeck } = useDeckContext();

  // Use a unique session key to force remount when the route is revisited
  // This ensures a fresh session each time
  const [sessionKey, setSessionKey] = useState(() => Date.now());

  // Update the session key when the location changes (new navigation to this route)
  useEffect(() => {
    setSessionKey(Date.now());
  }, [location.key]);

  // Support "all" as a special ID for reviewing all due cards
  const isAllDecks = id === 'all';
  const deck = isAllDecks ? null : getDeck(id || '');

  const handleComplete = useCallback(() => {
    // Use replace to prevent going back to a stale session
    history.replace('/home');
  }, [history]);

  const handleExit = useCallback(() => {
    if (isAllDecks) {
      // Use replace to prevent going back to a stale session
      history.replace('/home');
    } else {
      history.replace(`/deck/${id}`);
    }
  }, [history, id, isAllDecks]);

  // Validate - either "all" or a valid deck
  if (!isAllDecks && (!deck || !id)) {
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
        key={sessionKey}
        deckId={id}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    </IonPage>
  );
};

export default Review;
