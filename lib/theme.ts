import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'uz:theme';

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * Global theme preference. Persisted with AsyncStorage so the choice survives
 * restarts. `colorScheme` (NativeWind) is driven from here by <ThemeSync />.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: THEME_KEY,
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

/** Resolve a preference to the concrete scheme that should be applied now. */
export function resolveScheme(preference: ThemePreference): 'light' | 'dark' {
  if (preference === 'system') {
    return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
  }
  return preference;
}
