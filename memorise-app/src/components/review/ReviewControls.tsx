import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { pause, play, close } from 'ionicons/icons';

interface ReviewControlsProps {
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onExit: () => void;
}

export const ReviewControls: React.FC<ReviewControlsProps> = ({
  isPaused,
  onPause,
  onResume,
  onExit,
}) => {
  return (
    <div className="review-controls">
      {isPaused ? (
        <IonButton onClick={onResume}>
          <IonIcon icon={play} />
          Resume
        </IonButton>
      ) : (
        <IonButton onClick={onPause}>
          <IonIcon icon={pause} />
          Pause
        </IonButton>
      )}
      <IonButton color="medium" onClick={onExit}>
        <IonIcon icon={close} />
        Exit
      </IonButton>
    </div>
  );
};


