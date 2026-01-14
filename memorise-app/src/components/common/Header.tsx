import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon } from '@ionic/react';
import { arrowBack } from 'ionicons/icons';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ title, showBackButton, onBack, action }) => {
  return (
    <IonHeader>
      <IonToolbar>
        {showBackButton && (
          <IonButtons slot="start">
            <IonButton onClick={onBack}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
        )}
        <IonTitle>{title}</IonTitle>
        {action && (
          <IonButtons slot="end">
            {action}
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  );
};


