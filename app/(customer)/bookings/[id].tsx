import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { BackButton, Card, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/hooks/useAuth';
import { fetchMyBookings } from '../../../src/lib/api';
import { formatBookingDate, formatPrice, formatTimeRange } from '../../../src/lib/format';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Booking } from '../../../src/types';

export default function BookingDetail() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (profile) {
      fetchMyBookings(profile.id).then((all) => setBooking(all.find((b) => b.id === id) ?? null));
    }
  }, [profile, id]);

  if (!booking) return <Screen scroll={false} />;

  const artistFirstName = booking.artist_name?.split(' ')[0] ?? 'the artist';

  function callArtist() {
    if (!booking?.artist_phone) {
      Alert.alert('No phone number', `${booking?.artist_name ?? 'This artist'} has no phone number on file yet.`);
      return;
    }
    // tel: URLs must not contain spaces
    Linking.openURL(`tel:${booking.artist_phone.replace(/[\s()-]/g, '')}`);
  }

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
      <ScreenTitle
        title={booking.salon_name ?? 'Booking'}
        subtitle={booking.status === 'confirmed' ? 'Confirmed' : booking.status}
      />
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

      {/* Changes go through the artist directly — no in-app cancellation */}
      <Pressable
        onPress={callArtist}
        style={({ pressed }) => ({
          marginTop: 24,
          backgroundColor: theme.inkSurface,
          borderRadius: 18,
          paddingVertical: 17,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Feather name="phone" size={17} color={theme.onInk} />
        <Text style={{ color: theme.onInk, fontSize: 16, fontWeight: '700' }}>Call {artistFirstName} to cancel</Text>
      </Pressable>
      <Text style={{ fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 12, lineHeight: 18 }}>
        Need to reschedule or cancel? Give {artistFirstName} a quick call.
      </Text>

      {/* Temporary: mark the appointment finished and leave a review */}
      <Pressable
        onPress={() =>
          router.push({
            pathname: '/(customer)/bookings/review',
            params: {
              id: booking.id,
              artist: booking.artist_name ?? 'the artist',
              service: booking.service_name,
              salon: booking.salon_name ?? '',
              salonId: booking.salon_id ?? '',
              artistId: booking.artist_id ?? '',
            },
          })
        }
        style={({ pressed }) => ({
          marginTop: 14,
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1.5,
          borderColor: theme.hairlineStrong,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        })}
      >
        <Feather name="check-circle" size={17} color={theme.text} />
        <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>Finish</Text>
      </Pressable>
    </Screen>
  );
}
