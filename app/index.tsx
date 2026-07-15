import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../src/hooks/useAuth';
import { useTheme } from '../src/theme/ThemeContext';

/** Role routing: null → auth, customer / artist / manager → their shell */
export default function Index() {
  const { loading, profile } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.text} />
      </View>
    );
  }

  if (!profile) return <Redirect href="/(auth)/welcome" />;
  if (profile.role === 'manager') return <Redirect href="/(manager)/locations" />;
  if (profile.role === 'artist') return <Redirect href="/(artist)/schedule" />;
  return <Redirect href="/(customer)/home" />;
}
