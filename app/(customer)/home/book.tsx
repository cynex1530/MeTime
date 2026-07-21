import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { BackButton, Card, PrimaryButton, Screen, SectionTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/hooks/useAuth';
import { useT } from '../../../src/i18n/i18n';
import { createBooking, fetchArtistById, fetchArtistDayBookings, fetchArtistServices } from '../../../src/lib/api';
import { formatDuration, formatPrice, WEEKDAYS } from '../../../src/lib/format';
import { scheduleBookingReminder } from '../../../src/lib/notifications';
import { generateDaySlots } from '../../../src/lib/schedule';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Artist, Service } from '../../../src/types';

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return d;
  });
}

/**
 * Full-screen booking form with progressive disclosure:
 * service → (reveals) day → (reveals) time → Confirm enabled.
 * Time slots are the selected day's availability; changing the day refreshes
 * them and clears any previously picked time.
 */
export default function Book() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const { salonId, salonName, artistId, artistName, catId } = useLocalSearchParams<{
    salonId: string;
    salonName?: string;
    artistId: string;
    artistName?: string;
    catId?: string;
  }>();

  const [services, setServices] = useState<Service[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  // The artist's already-booked slots for the selected day (to grey them out).
  const [dayBookings, setDayBookings] = useState<{ starts_at: string; ends_at: string }[]>([]);

  useEffect(() => {
    if (artistId) {
      fetchArtistServices(artistId, catId).then(setServices);
      fetchArtistById(artistId).then(setArtist);
    }
  }, [artistId, catId]);

  // Load the artist's booked slots whenever the chosen day changes.
  useEffect(() => {
    if (!artistId || !selDay) {
      setDayBookings([]);
      return;
    }
    const dayStart = new Date(selDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    fetchArtistDayBookings(artistId, dayStart.toISOString(), dayEnd.toISOString()).then(setDayBookings);
  }, [artistId, selDay]);

  const days = useMemo(() => nextDays(8), []);
  // Slots come from the artist's open/close hours, slot length and lunch break.
  const daySlots = useMemo(
    () =>
      generateDaySlots(
        artist?.open_hour,
        artist?.close_hour,
        artist?.slot_minutes ?? 60,
        artist?.lunch_start,
        artist?.lunch_minutes
      ),
    [artist]
  );

  const service = services.find((s) => s.id === serviceId);
  const canConfirm = !!service && !!selDay && !!selTime;

  function pickService(id: string) {
    setServiceId(id);
  }

  // Selecting a day refreshes the time slots and clears any stale time pick.
  function pickDay(d: Date) {
    setSelDay(d);
    setSelTime(null);
  }

  // A slot is taken when the appointment it would create overlaps an existing
  // confirmed booking for this artist on the selected day.
  function slotTaken(time: string): boolean {
    if (!selDay || !service) return false;
    const [h, m] = time.split(':').map(Number);
    const s = new Date(selDay);
    s.setHours(h, m, 0, 0);
    const e = s.getTime() + service.duration_minutes * 60000;
    return dayBookings.some((b) => {
      const bs = new Date(b.starts_at).getTime();
      const be = new Date(b.ends_at).getTime();
      return s.getTime() < be && e > bs;
    });
  }

  async function refreshDayBookings() {
    if (!artistId || !selDay) return;
    const dayStart = new Date(selDay);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    setDayBookings(await fetchArtistDayBookings(artistId, dayStart.toISOString(), dayEnd.toISOString()));
  }

  async function confirm() {
    if (!service || !selDay || !selTime) return;
    setBusy(true);
    const [h, m] = selTime.split(':').map(Number);
    const start = new Date(selDay);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + service.duration_minutes * 60000);
    const { booking, conflict } = await createBooking({
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

    // The slot was taken between load and confirm (DB rejected the overlap).
    if (conflict || !booking) {
      Alert.alert(t('book.slotTakenTitle'), t('book.slotTakenMsg'));
      setSelTime(null);
      await refreshDayBookings();
      return;
    }

    // Remind the customer 3 hours before the appointment.
    scheduleBookingReminder(t('notif.upcomingBody', { name: artistName ?? '' }), booking.starts_at, booking.id);

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
      <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>{t('book.title')}</Text>
      <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
        {artistName} · {salonName}
      </Text>

      {/* Step 1 — service (always shown) */}
      <SectionTitle>{t('book.service')}</SectionTitle>
      <View style={{ gap: 10 }}>
        {services.map((s) => {
          const sel = s.id === serviceId;
          return (
            <Card
              key={s.id}
              onPress={() => pickService(s.id)}
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

      {/* Step 2 — day (revealed once a service is picked) */}
      {service ? (
        <>
          <SectionTitle>{t('book.day')}</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {days.map((d) => {
              const sel = selDay?.toDateString() === d.toDateString();
              return (
                <Pressable
                  key={d.toISOString()}
                  onPress={() => pickDay(d)}
                  style={{
                    width: 62,
                    paddingVertical: 12,
                    borderRadius: 14,
                    alignItems: 'center',
                    backgroundColor: theme.card,
                    borderWidth: 1.5,
                    borderColor: sel ? theme.text : theme.cardBorder,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary }}>
                    {WEEKDAYS[d.getDay()].toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text, marginTop: 2 }}>
                    {d.getDate()}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {/* Step 3 — time (revealed once a day is picked; slots follow the day) */}
      {service && selDay ? (
        <>
          <SectionTitle>{t('book.time')}</SectionTitle>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {daySlots.map(({ time, available }) => {
              const sel = selTime === time;
              const taken = slotTaken(time);
              const usable = available && !taken;
              return (
                <Pressable
                  key={time}
                  disabled={!usable}
                  onPress={() => setSelTime(time)}
                  style={{
                    paddingHorizontal: 18,
                    paddingVertical: 11,
                    borderRadius: 999,
                    backgroundColor: theme.card,
                    borderWidth: 1.5,
                    borderColor: sel ? theme.text : theme.cardBorder,
                    opacity: usable ? 1 : 0.35,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: theme.text,
                      textDecorationLine: taken ? 'line-through' : 'none',
                    }}
                  >
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <PrimaryButton
        title={t('book.confirm')}
        disabled={!canConfirm}
        loading={busy}
        onPress={confirm}
        style={{ marginTop: 30 }}
      />
    </Screen>
  );
}
