import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, Text, View } from 'react-native';
import { BackButton, Card, Screen, ScreenTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/hooks/useAuth';
import { useT } from '../../../src/i18n/i18n';
import { fetchMyBookings, hasReviewedArtist } from '../../../src/lib/api';
import { formatBookingDate, formatPrice, formatTimeRange } from '../../../src/lib/format';
import { scheduleReviewReminder } from '../../../src/lib/notifications';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Booking } from '../../../src/types';

export default function BookingDetail() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  // Whether this customer already reviewed this artist — if so, don't ask again.
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchMyBookings(profile.id).then((all) => setBooking(all.find((b) => b.id === id) ?? null));
    }
  }, [profile, id]);

  useEffect(() => {
    if (profile && booking?.artist_id) {
      hasReviewedArtist(profile.id, booking.artist_id).then(setReviewed);
    }
  }, [profile, booking?.artist_id]);

  if (!booking) return <Screen scroll={false} />;

  const artistFirstName = booking.artist_name?.split(' ')[0] ?? 'the artist';

  function callArtist() {
    if (!booking?.artist_phone) {
      Alert.alert(t('bd.noPhone'), t('bd.noPhoneMsg', { name: booking?.artist_name ?? 'This artist' }));
      return;
    }
    // tel: URLs must not contain spaces
    Linking.openURL(`tel:${booking.artist_phone.replace(/[\s()-]/g, '')}`);
  }

  // "Finish" = appointment is done → send a review-reminder notification.
  // Tapping the notification opens the review screen (handled in the root layout).
  async function finishAppointment() {
    if (!booking) return;
    const artistName = booking.artist_name ?? 'the artist';
    await scheduleReviewReminder(t('notif.reviewBody', { name: artistName }), {
      kind: 'review',
      id: booking.id,
      artist: artistName,
      service: booking.service_name,
      salon: booking.salon_name ?? '',
      salonId: booking.salon_id ?? '',
      artistId: booking.artist_id ?? '',
    });
  }

  const rows: Array<{ icon: keyof typeof Feather.glyphMap; label: string; value: string }> = [
    { icon: 'scissors', label: t('bd.service'), value: booking.service_name },
    { icon: 'user', label: t('bd.artist'), value: booking.artist_name ?? '—' },
    { icon: 'calendar', label: t('bd.when'), value: `${formatBookingDate(booking.starts_at)} · ${formatTimeRange(booking.starts_at, booking.ends_at)}` },
    { icon: 'map-pin', label: t('bd.where'), value: `${booking.salon_name ?? ''}${booking.salon_area ? ` · ${booking.salon_area}` : ''}` },
    { icon: 'tag', label: t('bd.price'), value: formatPrice(booking.price_cents) },
  ];

  return (
    <Screen clearTabBar>
      <BackButton />
      <ScreenTitle
        title={booking.salon_name ?? 'Booking'}
        subtitle={booking.status === 'confirmed' ? t('bookings.confirmed') : booking.status}
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
        <Text style={{ color: theme.onInk, fontSize: 16, fontWeight: '700' }}>{t('bd.call', { name: artistFirstName })}</Text>
      </Pressable>
      <Text style={{ fontSize: 13, color: theme.textFaint, textAlign: 'center', marginTop: 12, lineHeight: 18 }}>
        {t('bd.callHint', { name: artistFirstName })}
      </Text>

      {/* Temporary: mark the appointment finished. This fires a local
          "leave a review" notification — but only if the customer hasn't
          already reviewed this artist (we never ask twice for the same one). */}
      {!reviewed ? (
        <Pressable
          onPress={finishAppointment}
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
          <Text style={{ color: theme.text, fontSize: 16, fontWeight: '700' }}>{t('bd.finish')}</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}
