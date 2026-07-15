import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ConfirmDialog } from '../../../src/components/Sheet';
import { BackButton, Card, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/hooks/useAuth';
import { cancelBooking, fetchMyBookings } from '../../../src/lib/api';
import { formatBookingDate, formatPrice, formatTimeRange } from '../../../src/lib/format';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Booking } from '../../../src/types';

export default function BookingDetail() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchMyBookings(profile.id).then((all) => setBooking(all.find((b) => b.id === id) ?? null));
    }
  }, [profile, id]);

  if (!booking) return <Screen scroll={false} />;

  const rows: Array<{ icon: keyof typeof Feather.glyphMap; label: string; value: string }> = [
    { icon: 'scissors', label: 'Service', value: booking.service_name },
    { icon: 'user', label: 'Artist', value: booking.artist_name ?? '—' },
    { icon: 'calendar', label: 'When', value: `${formatBookingDate(booking.starts_at)} · ${formatTimeRange(booking.starts_at, booking.ends_at)}` },
    { icon: 'map-pin', label: 'Where', value: `${booking.salon_name ?? ''}${booking.salon_area ? ` · ${booking.salon_area}` : ''}` },
    { icon: 'tag', label: 'Price', value: formatPrice(booking.price_cents) },
  ];

  return (
    <Screen clearTabBar>
      <BackButton />
      <ScreenTitle title={booking.salon_name ?? 'Booking'} subtitle={booking.status === 'confirmed' ? 'Confirmed' : booking.status} />
      <Card style={{ gap: 16 }}>
        {rows.map((r) => (
          <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Feather name={r.icon} size={17} color={theme.iconMuted} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', color: theme.textTertiary }}>
                {r.label}
              </Text>
              <Text style={{ fontSize: 16, fontWeight: '600', color: theme.text, marginTop: 2 }}>{r.value}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Pressable
        onPress={() => setConfirmCancel(true)}
        style={({ pressed }) => ({
          marginTop: 24,
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: theme.destructiveBorder,
          paddingVertical: 16,
          alignItems: 'center',
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ color: theme.destructive, fontSize: 16, fontWeight: '700' }}>Cancel booking</Text>
      </Pressable>

      <ConfirmDialog
        visible={confirmCancel}
        title="Cancel this booking?"
        message={`${booking.service_name} at ${booking.salon_name ?? 'the salon'} will be cancelled.`}
        confirmLabel="Cancel booking"
        onCancel={() => setConfirmCancel(false)}
        onConfirm={async () => {
          await cancelBooking(booking.id);
          setConfirmCancel(false);
          router.back();
        }}
      />
    </Screen>
  );
}
