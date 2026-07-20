import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '../../../src/theme/ThemeContext';

/**
 * Stack nested inside the Bookings tab so the booking detail pushes on top of
 * the list — the floating tab bar stays visible and Back returns to the list.
 */
export default function BookingsLayout() {
  const { theme } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="review" />
    </Stack>
  );
}
