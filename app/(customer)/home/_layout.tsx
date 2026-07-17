import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../../src/theme/ThemeContext';

/**
 * Stack nested inside the Home tab: index → salons → artists → book → success.
 * The tab bar stays visible on index & salons and hides on the immersive
 * artists/book/success screens (see FloatingTabBar). Back walks the stack:
 * artists → salon list → home.
 */
export default function HomeStackLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="salons" />
      <Stack.Screen name="artists" />
      <Stack.Screen name="book" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
