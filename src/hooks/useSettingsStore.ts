import { useState, useEffect } from 'react';

const SETTINGS_KEY = 'chitchat-settings';

interface SettingsState {
  voice: string;
  backgroundConversations: boolean;
  autocomplete: boolean;
  trendingSearches: boolean;
  followUpSuggestions: boolean;
}

const defaultSettings: SettingsState = {
  voice: 'Ember',
  backgroundConversations: true,
  autocomplete: true,
  trendingSearches: false,
  followUpSuggestions: true,
};

export const useSettingsStore = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return {
    settings,
    updateSetting,
  };
};
