import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton, Screen } from '../../../src/components/ui';
import { useTheme } from '../../../src/theme/ThemeContext';

export default function Success() {
  const { theme } = useTheme();
  const router = useRouter();
  const { salonName, artistName, serviceName, when } = useLocalSearchParams<{
    salonName?: string;
    artistName?: string;
    serviceName?: string;
    when?: string;
  }>();

  // Collapse the home stack (index → salons → artists → success) back to the
  // home index so leaving this screen — and returning to the Home tab later —
  // shows the discovery page, not this confirmation again.
  function resetHomeStack() {
    if (router.canDismiss()) router.dismissAll();
  }

  return (
    <Screen scroll={false} style={{ alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: theme.inkSurface,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="check" size={40} color={theme.onInk} />
      </View>
      <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.7, color: theme.text, marginTop: 24 }}>
        You're booked!
      </Text>
      <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 10, textAlign: 'center', lineHeight: 22 }}>
        {serviceName} with {artistName}{'\n'}
        {salonName} · {when}
      </Text>

      <View style={{ alignSelf: 'stretch', marginTop: 40, gap: 12 }}>
        <PrimaryButton
          title="View my bookings"
          onPress={() => {
            resetHomeStack();
            router.navigate('/(customer)/bookings');
          }}
        />
        <Text
          onPress={resetHomeStack}
          style={{ textAlign: 'center', fontSize: 15, fontWeight: '600', color: theme.textSecondary, paddingVertical: 8 }}
        >
          Back to home
        </Text>
      </View>
    </Screen>
  );
}
