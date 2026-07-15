import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { Card, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { fetchMyBookings } from '../../src/lib/api';
import { formatBookingDate, formatTime } from '../../src/lib/format';
import { useTheme } from '../../src/theme/ThemeContext';
import { Booking } from '../../src/types';

export default function Bookings() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (profile) fetchMyBookings(profile.id).then(setBookings);
    }, [profile])
  );

  const now = Date.now();
  const upcoming = bookings.filter((b) => new Date(b.starts_at).getTime() >= now);
  const past = bookings.filter((b) => new Date(b.starts_at).getTime() < now);

  const renderRow = (b: Booking) => (
    <Card
      key={b.id}
      onPress={() => router.push({ pathname: '/(customer)/booking/[id]', params: { id: b.id } })}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          backgroundColor: theme.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Feather name="calendar" size={18} color={theme.iconStroke} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{b.salon_name ?? b.service_name}</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>
          {b.service_name} · {formatBookingDate(b.starts_at)} · {formatTime(b.starts_at)}
        </Text>
      </View>
      <Feather name="chevron-right" size={18} color={theme.iconMuted} />
    </Card>
  );

  return (
    <Screen clearTabBar>
      <ScreenTitle title="Bookings" subtitle="Your upcoming and past appointments" />
      <View style={{ gap: 12 }}>
        {upcoming.map(renderRow)}
        {upcoming.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginVertical: 30 }}>
            Nothing booked yet — find your next me time on Home.
          </Text>
        ) : null}
        {past.length > 0 ? (
          <>
            <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginTop: 20, marginBottom: 2 }}>
              Past
            </Text>
            {past.map(renderRow)}
          </>
        ) : null}
      </View>
    </Screen>
  );
}
