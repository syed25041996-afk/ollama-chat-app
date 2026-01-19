import { create } from 'zustand';
import { OllamaSettings } from '../features/settings/types';

interface SettingsState {
  settings: OllamaSettings;
  updateSettings: (settings: OllamaSettings) => void;
}

const useSettingsStore = create<SettingsState>((set) => ({
  settings: { host: 'http://localhost', port: 11434 },
  updateSettings: (settings) => set({ settings }),
}));

export default useSettingsStore;