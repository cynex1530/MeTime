import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from '../src/i18n/i18n';
import { ReviewReminderData } from '../src/lib/notifications';
import { AuthProvider } from '../src/hooks/useAuth';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

function AppShell() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

  // Tapping a "leave a review" notification opens the review screen for it.
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as Partial<ReviewReminderData>;
      if (data?.kind === 'review' && data.id) {
        router.push({
          pathname: '/(customer)/bookings/review',
          params: {
            id: data.id,
            artist: data.artist ?? '',
            service: data.service ?? '',
            salon: data.salon ?? '',
            salonId: data.salonId ?? '',
            artistId: data.artistId ?? '',
          },
        });
      }
    });
    return () => sub.remove();
  }, [router]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="salon-artist/[id]" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppShell />
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
