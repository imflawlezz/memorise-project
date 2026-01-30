import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonAlert, IonIcon, IonToast } from '@ionic/react';
import {
  downloadOutline,
  cloudUploadOutline,
  trashOutline,
  chevronForwardOutline,
  informationCircleOutline,
  removeOutline,
  addOutline
} from 'ionicons/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useStorage } from '../hooks/useStorage';
import { useDeckContext } from '../contexts/DeckContext';
import { StorageService, AppSettings, getDefaultSettings } from '../services/storageService';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { exportData, importData, downloadFile, readFile, clearAllData } = useStorage();
  const { refreshData } = useDeckContext();
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());
  const [showClearAlert, setShowClearAlert] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; color?: string }>({ show: false, message: '' });

  useEffect(() => {
    StorageService.getSettings().then(setSettings);
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    await setTheme(newTheme);
  };

  const updateSetting = async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      downloadFile(data, `memorise-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
      setToast({ show: true, message: 'Data exported successfully!', color: 'success' });
    } catch (error) {
      setToast({ show: true, message: 'Error exporting data', color: 'danger' });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const data = await readFile(file);
        await importData(data);
        await refreshData();
        setToast({ show: true, message: 'Data imported successfully!', color: 'success' });
        // Reset input so same file can be imported again
        event.target.value = '';
      } catch (error) {
        setToast({ show: true, message: 'Error importing data - invalid format', color: 'danger' });
      }
    }
  };

  const handleClearData = async () => {
    await clearAllData();
    setShowClearAlert(false);
    await refreshData();
    setToast({ show: true, message: 'All data cleared!', color: 'warning' });
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="settings-page">
          <header className="page-header">
            <h1>Settings</h1>
          </header>

          {/* Appearance Section */}
          <section className="settings-section">
            <h2>Appearance</h2>
            <div className="settings-group">
              <div className="setting-row">
                <span className="setting-label">Theme</span>
                <div className="theme-selector">
                  {(['light', 'dark', 'auto'] as const).map((t) => (
                    <button
                      key={t}
                      className={`theme-option ${theme === t ? 'active' : ''}`}
                      onClick={() => handleThemeChange(t)}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Study Section */}
          <section className="settings-section">
            <h2>Daily Learning Goals</h2>
            <div className="settings-group">
              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">New cards per day</span>
                  <span className="setting-description">Maximum new cards to learn daily</span>
                </div>
                <div className="number-stepper">
                  <button
                    className="stepper-btn"
                    onClick={() => updateSetting('dailyNewCardLimit', Math.max(1, settings.dailyNewCardLimit - 5))}
                  >
                    <IonIcon icon={removeOutline} />
                  </button>
                  <input
                    type="number"
                    className="stepper-input"
                    value={settings.dailyNewCardLimit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      updateSetting('dailyNewCardLimit', Math.max(1, Math.min(100, val)));
                    }}
                    min={1}
                    max={100}
                  />
                  <button
                    className="stepper-btn"
                    onClick={() => updateSetting('dailyNewCardLimit', Math.min(100, settings.dailyNewCardLimit + 5))}
                  >
                    <IonIcon icon={addOutline} />
                  </button>
                </div>
              </div>

              <div className="setting-row">
                <div className="setting-info">
                  <span className="setting-label">Reviews per day</span>
                  <span className="setting-description">Maximum review cards per day</span>
                </div>
                <div className="number-stepper">
                  <button
                    className="stepper-btn"
                    onClick={() => updateSetting('dailyReviewLimit', Math.max(10, settings.dailyReviewLimit - 10))}
                  >
                    <IonIcon icon={removeOutline} />
                  </button>
                  <input
                    type="number"
                    className="stepper-input"
                    value={settings.dailyReviewLimit}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 10;
                      updateSetting('dailyReviewLimit', Math.max(10, Math.min(500, val)));
                    }}
                    min={10}
                    max={500}
                  />
                  <button
                    className="stepper-btn"
                    onClick={() => updateSetting('dailyReviewLimit', Math.min(500, settings.dailyReviewLimit + 10))}
                  >
                    <IonIcon icon={addOutline} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Data Section */}
          <section className="settings-section">
            <h2>Data</h2>
            <div className="settings-group">
              <button className="setting-action" onClick={handleExport}>
                <IonIcon icon={downloadOutline} />
                <span>Export Data</span>
                <IonIcon icon={chevronForwardOutline} className="action-arrow" />
              </button>

              <label className="setting-action">
                <IonIcon icon={cloudUploadOutline} />
                <span>Import Data</span>
                <IonIcon icon={chevronForwardOutline} className="action-arrow" />
                <input
                  type="file"
                  accept=".json"
                  style={{ display: 'none' }}
                  onChange={handleImport}
                />
              </label>
            </div>
          </section>

          {/* About Section */}
          <section className="settings-section">
            <h2>About</h2>
            <div className="settings-group">
              <button className="setting-action" onClick={() => setShowAbout(true)}>
                <IonIcon icon={informationCircleOutline} />
                <span>About Memorise</span>
                <IonIcon icon={chevronForwardOutline} className="action-arrow" />
              </button>
            </div>
            <p className="version-text">Version 1.0.0</p>
          </section>

          {/* Danger Zone */}
          <section className="settings-section">
            <h2>Danger Zone</h2>
            <div className="settings-group danger">
              <button
                className="setting-action danger"
                onClick={() => setShowClearAlert(true)}
              >
                <IonIcon icon={trashOutline} />
                <span>Clear All Data</span>
                <IonIcon icon={chevronForwardOutline} className="action-arrow" />
              </button>
            </div>
          </section>
        </div>

        <IonAlert
          isOpen={showClearAlert}
          onDidDismiss={() => setShowClearAlert(false)}
          header="Clear All Data"
          message="Are you sure you want to delete all your data? This action cannot be undone."
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Clear', role: 'destructive', handler: handleClearData },
          ]}
        />

        <IonAlert
          isOpen={showAbout}
          onDidDismiss={() => setShowAbout(false)}
          header="Memorise"
          message="A spaced repetition flashcard app to help you learn and remember anything. Built with Ionic and React."
          buttons={['Close']}
        />

        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast({ ...toast, show: false })}
          message={toast.message}
          duration={2000}
          position="bottom"
          color={toast.color}
        />
      </IonContent>
    </IonPage>
  );
};

export default Settings;
