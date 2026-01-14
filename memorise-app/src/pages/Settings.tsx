import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonAlert, IonIcon } from '@ionic/react';
import { downloadOutline, cloudUploadOutline, trashOutline, chevronForwardOutline } from 'ionicons/icons';
import { useTheme } from '../contexts/ThemeContext';
import { useStorage } from '../hooks/useStorage';
import { StorageService, AppSettings, getDefaultSettings } from '../services/storageService';
import './Settings.css';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { exportData, importData, downloadFile, readFile, clearAllData } = useStorage();
  const [settings, setSettings] = useState<AppSettings>(getDefaultSettings());
  const [showClearAlert, setShowClearAlert] = useState(false);

  useEffect(() => {
    StorageService.getSettings().then(setSettings);
  }, []);

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'auto') => {
    await setTheme(newTheme);
  };

  const handleExport = async () => {
    try {
      const data = await exportData();
      downloadFile(data, `memorise-backup-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } catch (error) {
      alert('Error exporting data');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const data = await readFile(file);
        await importData(data);
        alert('Data imported successfully! Please refresh the page.');
      } catch (error) {
        alert('Error importing data');
      }
    }
  };

  const handleClearData = async () => {
    await clearAllData();
    setShowClearAlert(false);
    alert('All data cleared. Please refresh the page.');
  };

  const toggleSetting = async (key: keyof AppSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await StorageService.saveSettings(newSettings);
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

              <div className="setting-row">
                <span className="setting-label">Animations</span>
                <button
                  className={`toggle ${settings.animationsEnabled ? 'on' : ''}`}
                  onClick={() => toggleSetting('animationsEnabled', !settings.animationsEnabled)}
                  aria-pressed={settings.animationsEnabled}
                />
              </div>

              <div className="setting-row">
                <span className="setting-label">Haptics</span>
                <button
                  className={`toggle ${settings.hapticsEnabled ? 'on' : ''}`}
                  onClick={() => toggleSetting('hapticsEnabled', !settings.hapticsEnabled)}
                  aria-pressed={settings.hapticsEnabled}
                />
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
      </IonContent>
    </IonPage>
  );
};

export default Settings;
