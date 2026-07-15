import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, Theme } from './tokens';

const STORAGE_KEY = 'mtDark'; // matches the prototype's persistence key

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
  setDark: (v: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: light,
  isDark: false,
  setDark: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // OS appearance is the initial default; a manual choice persists and wins.
  const system = useColorScheme();
  const [override, setOverride] = useState<boolean | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === '1') setOverride(true);
        else if (v === '0') setOverride(false);
      })
      .finally(() => setLoaded(true));
  }, []);

  const isDark = override ?? system === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: isDark ? dark : light,
      isDark,
      setDark: (v: boolean) => {
        setOverride(v);
        AsyncStorage.setItem(STORAGE_KEY, v ? '1' : '0').catch(() => {});
      },
    }),
    [isDark]
  );

  if (!loaded) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
