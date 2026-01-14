import React from 'react';
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { home, library, statsChart, settings } from 'ionicons/icons';

export const NavigationTabs: React.FC = () => {
  return (
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/home">
        <IonIcon icon={home} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      
      <IonTabButton tab="decks" href="/decks">
        <IonIcon icon={library} />
        <IonLabel>Decks</IonLabel>
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
  );
};

