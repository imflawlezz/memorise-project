import React from 'react';
import { IonModal, IonContent, IonIcon } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave?: () => void;
  saveLabel?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSave,
  saveLabel = 'Save',
}) => {
  const handleSave = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="custom-modal">
      <IonContent>
        <div className="modal-container">
          {/* Header */}
          <header className="modal-header">
            <button className="modal-close" onClick={onClose}>
              <IonIcon icon={closeOutline} />
            </button>
            <h2 className="modal-title">{title}</h2>
            {onSave && (
              <button className="modal-save" onClick={handleSave}>
                {saveLabel}
              </button>
            )}
          </header>

          {/* Body */}
          <div className="modal-body">
            {children}
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
