import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { BackButton, Card, Screen } from '../../src/components/ui';
import { SALON_DEMO } from '../../src/lib/salonStats';
import { useTheme } from '../../src/theme/ThemeContext';

/**
 * Per-artist detailed analytics — placeholder. The full detailed design will
 * be built out next; for now this shows the artist's headline numbers.
 */
export default function SalonArtistDetail() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = SALON_DEMO.artists.find((x) => x.id === id) ?? SALON_DEMO.artists[0];

  return (
    <Screen clearTabBar>
      <BackButton />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: a.color, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{a.initials}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.7, color: theme.text }}>{a.name}</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>{a.profession}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {[
          { v: `$${(a.revenue / 1000).toFixed(1)}k`, l: 'Revenue' },
          { v: `${a.appts}`, l: 'Appointments' },
          { v: `${a.rating}`, l: 'Avg rating' },
          { v: `${a.occupancy}%`, l: 'Occupancy' },
          { v: `${a.returnPct}%`, l: 'Returning' },
          { v: `${a.noShow}%`, l: 'No-show' },
        ].map((s) => (
          <Card key={s.l} style={{ width: '47%' }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text }}>{s.v}</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{s.l}</Text>
          </Card>
        ))}
      </View>

      <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Feather name="info" size={16} color={theme.iconMuted} />
        <Text style={{ flex: 1, fontSize: 14, color: theme.textSecondary }}>
          More detailed per-artist analytics coming soon.
        </Text>
      </Card>
    </Screen>
  );
}
