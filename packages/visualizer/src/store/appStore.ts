import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export type ThemeMode = 'light' | 'dark';

type AppStoreState = {
  themeMode: ThemeMode;
};

type AppStoreActions = {
  setThemeMode: (themeMode: ThemeMode) => void;
};

export type AppStore = AppStoreState & AppStoreActions;

export const useAppStore = create<AppStore>()(
  immer((set) => ({
    themeMode: 'dark',
    setThemeMode: (themeMode: ThemeMode) => set({ themeMode }),
  })),
);
