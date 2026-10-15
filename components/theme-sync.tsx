import { useEffect } from 'react';
import { Appearance } from 'react-native';
import { useColorScheme } from 'nativewind';
import { resolveScheme, useThemeStore } from '@/lib/theme';

/**
 * Applies the persisted theme preference to NativeWind's colour scheme and keeps
 * it in sync with the OS while the preference is "system".
 */
export function ThemeSync() {
  const { setColorScheme } = useColorScheme();
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    setColorScheme(resolveScheme(preference));
  }, [preference, setColorScheme]);

  useEffect(() => {
    if (preference !== 'system') return;
    const sub = Appearance.addChangeListener(() => {
      setColorScheme(resolveScheme('system'));
    });
    return () => sub.remove();
  }, [preference, setColorScheme]);

  return null;
}
