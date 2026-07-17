import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BackButton, Card, PrimaryButton, Screen, SectionTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/hooks/useAuth';
import { createBooking, fetchArtistServices } from '../../../src/lib/api';
import { formatDuration, formatPrice, WEEKDAYS } from '../../../src/lib/format';
import { BOOKING_TIMES, BUSY_TIMES } from '../../../src/lib/sampleData';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Service } from '../../../src/types';

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return d;
  });
}

/** Full-screen booking form: pick service → day → time. Tab bar hidden. */
export default function Book() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const { salonId, salonName, artistId, artistName, catId } = useLocalSearchParams<{
    salonId: string;
    salonName?: string;
    artistId: string;
    artistName?: string;
    catId?: string;
  }>();

  const [services, setServices] = useState<Service[]>([]);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (artistId) fetchArtistServices(artistId, catId).then(setServices);
  }, [artistId, catId]);

  const days = useMemo(() => nextDays(8), []);
  const service = services.find((s) => s.id === serviceId);
  const canConfirm = !!service && !!selDay && !!selTime;

  async function confirm() {
    if (!service || !selDay || !selTime) return;
    setBusy(true);
    const [h, m] = selTime.split(':').map(Number);
    const start = new Date(selDay);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + service.duration_minutes * 60000);
    const booking = await createBooking({
      customer_id: profile?.id ?? null,
      salon_id: salonId ?? null,
      artist_id: artistId ?? null,
      service_id: service.id.startsWith('local') || service.id.includes('-s') ? null : service.id,
      service_name: service.name,
      duration_minutes: service.duration_minutes,
      price_cents: service.price_cents,
      customer_name: profile?.full_name ?? '',
      customer_phone: profile?.phone ?? null,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      salon_name: salonName,
      artist_name: artistName,
    });
    setBusy(false);
    router.replace({
      pathname: '/(customer)/home/success',
      params: {
        salonName: salonName ?? '',
        artistName: artistName ?? '',
        serviceName: booking.service_name,
        when: `${WEEKDAYS[start.getDay()]}, ${start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${selTime}`,
      },
    });
  }

  return (
    <Screen>
      <BackButton />
      <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>Book</Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
        {artistName} · {salonName}
      </Text>

      <SectionTitle>Service</SectionTitle>
      <View style={{ gap: 10 }}>
        {services.map((s) => {
          const sel = s.id === serviceId;
          return (
            <Card
              key={s.id}
              onPress={() => setServiceId(s.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1.5,
                borderColor: sel ? theme.text : theme.cardBorder,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{s.name}</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>
                  {formatDuration(s.duration_minutes)} · {formatPrice(s.price_cents)}
                </Text>
              </View>
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: sel ? theme.text : theme.hairlineStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {sel ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.text }} /> : null}
              </View>
            </Card>
          );
        })}
      </View>

      <SectionTitle>Day</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {days.map((d, i) => {
          const sel = selDay?.toDateString() === d.toDateString();
          const full = i === 3; // sample "fully booked" day, as in the prototype
          return (
            <Pressable
              key={d.toISOString()}
              disabled={full}
              onPress={() => setSelDay(d)}
              style={{
                width: 62,
                paddingVertical: 12,
                borderRadius: 14,
                alignItems: 'center',
                backgroundColor: sel ? theme.inkSurface : theme.card,
                borderWidth: 1,
                borderColor: sel ? theme.inkSurface : theme.cardBorder,
                opacity: full ? 0.35 : 1,
              }}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: sel ? theme.onInk : theme.textSecondary }}>
                {WEEKDAYS[d.getDay()].toUpperCase()}
              </Text>
              <Text style={{ fontSize: 17, fontWeight: '800', color: sel ? theme.onInk : theme.text, marginTop: 2 }}>
                {d.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle>Time</SectionTitle>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {BOOKING_TIMES.map((t) => {
          const busySlot = BUSY_TIMES.includes(t);
          const sel = selTime === t;
          return (
            <Pressable
              key={t}
              disabled={busySlot}
              onPress={() => setSelTime(t)}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 11,
                borderRadius: 999,
                backgroundColor: sel ? theme.inkSurface : theme.card,
                borderWidth: 1,
                borderColor: sel ? theme.inkSurface : theme.cardBorder,
                opacity: busySlot ? 0.35 : 1,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: sel ? theme.onInk : theme.text }}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        title="Confirm booking"
        disabled={!canConfirm}
        loading={busy}
        onPress={confirm}
        style={{ marginTop: 30 }}
      />
    </Screen>
  );
}
