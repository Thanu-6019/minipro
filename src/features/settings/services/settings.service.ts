import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'medtrack_settings';

export interface UserSettings {
  pushEnabled: boolean;
  criticalEnabled: boolean;
  leadTime: number;
  biometricEnabled: boolean;
  shareEnabled: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  pushEnabled: true,
  criticalEnabled: true,
  leadTime: 3,
  biometricEnabled: true,
  shareEnabled: false,
};

export const settingsService = {
  getSettings: async (): Promise<UserSettings> => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (settings: Partial<UserSettings>): Promise<void> => {
    const current = await settingsService.getSettings();
    const merged = { ...current, ...settings };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  },
};
