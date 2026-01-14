import React from 'react';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonBadge } from '@ionic/react';
import { home, library, school, statsChart, settings } from 'ionicons/icons';
import { Route, Redirect } from 'react-router-dom';
import { useDeckContext } from '../../contexts/DeckContext';

interface NavigationProps {
  children: React.ReactNode;
}

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  const { getDueCards } = useDeckContext();
  const dueCardsCount = getDueCards().length;

  return (
    <IonTabs>
      {children}
      <IonTabBar slot="bottom">
        <IonTabButton tab="home" href="/home">
          <IonIcon icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="decks" href="/decks">
          <IonIcon icon={library} />
          <IonLabel>Decks</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="review" href="/review">
          <IonIcon icon={school} />
          <IonLabel>Review</IonLabel>
          {dueCardsCount > 0 && (
            <IonBadge color="danger">{dueCardsCount}</IonBadge>
          )}
        </IonTabButton>
        
        <IonTabButton tab="statistics" href="/statistics">
          <IonIcon icon={statsChart} />
          <IonLabel>Statistics</IonLabel>
        </IonTabButton>
        
        <IonTabButton tab="settings" href="/settings">
          <IonIcon icon={settings} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};


