import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { dark, light, Theme } from './tokens';

type ThemeContextValue = {
  theme: Theme;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: light,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // The app always follows the phone's appearance. useColorScheme() re-renders
  // live when the system switches between light and dark.
  const system = useColorScheme();
  const isDark = system === 'dark';

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: isDark ? dark : light, isDark }),
    [isDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
