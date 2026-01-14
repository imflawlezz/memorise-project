import { useCallback } from 'react';
import { StorageService } from '../services/storageService';
import { Deck } from '../models/Deck';
import { Card } from '../models/Card';

export const useStorage = () => {
  const exportData = useCallback(async (): Promise<string> => {
    return StorageService.exportData();
  }, []);

  const importData = useCallback(async (json: string): Promise<void> => {
    await StorageService.importData(json);
  }, []);

  const clearAllData = useCallback(async (): Promise<void> => {
    await StorageService.clearAllData();
  }, []);

  const downloadFile = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  const readFile = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }, []);

  return {
    exportData,
    importData,
    clearAllData,
    downloadFile,
    readFile,
  };
};


