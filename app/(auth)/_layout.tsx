import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { useTheme } from '../../src/theme/ThemeContext';

export default function AuthLayout() {
  const { theme } = useTheme();
  const { profile } = useAuth();

  // Once signed in, never stay on an auth screen — redirect to the role router.
  // This is reactive: the moment the profile loads after sign in, we leave the
  // login/register screen, so there's no double-attempt race for any role.
  if (profile) return <Redirect href="/" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg },
        animation: 'slide_from_right',
      }}
    />
  );
}
