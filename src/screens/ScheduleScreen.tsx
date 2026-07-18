import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Sheet } from '../components/Sheet';
import { SwipeRow } from '../components/SwipeRow';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../components/ui';
import { fetchArtistSchedule, fetchMyArtistRow, cancelBooking, rescheduleBooking } from '../lib/api';
import { formatTimeRange, WEEKDAYS } from '../lib/format';
import { BOOKING_TIMES, BUSY_TIMES } from '../lib/sampleData';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../theme/ThemeContext';
import { Booking } from '../types';

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return d;
  });
}

export function ScheduleScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reschId, setReschId] = useState<string | null>(null);
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const artist = profile ? await fetchMyArtistRow(profile.id) : null;
      setBookings(await fetchArtistSchedule(artist?.id ?? null));
    })();
  }, [profile]);

  const days = useMemo(() => nextDays(8), []);
  const resch = bookings.find((b) => b.id === reschId);

  function confirmReschedule() {
    if (!resch || !selDay || !selTime) return;
    const [h, m] = selTime.split(':').map(Number);
    const start = new Date(selDay);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + resch.duration_minutes * 60000);
    rescheduleBooking(resch.id, start.toISOString(), end.toISOString());
    setBookings((bs) =>
      bs.map((b) =>
        b.id === resch.id ? { ...b, starts_at: start.toISOString(), ends_at: end.toISOString() } : b
      )
    );
    setReschId(null);
    setSelDay(null);
    setSelTime(null);
  }

  return (
    <Screen clearTabBar>
      <ScreenTitle title="Schedule" subtitle="Swipe a booking to edit or delete" />
      <View style={{ gap: 12 }}>
        {bookings.map((b) => {
          const d = new Date(b.starts_at);
          const openReschedule = () => {
            setReschId(b.id);
            setSelDay(null);
            setSelTime(null);
          };
          return (
            <SwipeRow
              key={b.id}
              onPress={openReschedule}
              onEdit={openReschedule}
              onDelete={() => {
                cancelBooking(b.id);
                setBookings((bs) => bs.filter((x) => x.id !== b.id));
              }}
            >
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 52,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: theme.bg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary }}>
                    {WEEKDAYS[d.getDay()].toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text }}>{d.getDate()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{b.customer_name}</Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{b.service_name}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: theme.textSecondary }}>
                  {formatTimeRange(b.starts_at, b.ends_at)}
                </Text>
              </Card>
            </SwipeRow>
          );
        })}
        {bookings.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No upcoming bookings.
          </Text>
        ) : null}
      </View>

      {/* Reschedule sheet */}
      <Sheet visible={reschId !== null} onClose={() => setReschId(null)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 4 }}>Reschedule</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>
          {resch?.customer_name} · {resch?.service_name}
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {days.map((d) => {
            const sel = selDay?.toDateString() === d.toDateString();
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => setSelDay(d)}
                style={{
                  width: 56,
                  paddingVertical: 10,
                  borderRadius: 14,
                  alignItems: 'center',
                  backgroundColor: sel ? theme.inkSurface : theme.bg,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: '700', color: sel ? theme.onInk : theme.textSecondary }}>
                  {WEEKDAYS[d.getDay()].toUpperCase()}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: sel ? theme.onInk : theme.text }}>
                  {d.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {BOOKING_TIMES.map((t) => {
            const busy = BUSY_TIMES.includes(t);
            const sel = selTime === t;
            return (
              <Pressable
                key={t}
                disabled={busy}
                onPress={() => setSelTime(t)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 999,
                  backgroundColor: sel ? theme.inkSurface : theme.bg,
                  opacity: busy ? 0.35 : 1,
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: sel ? theme.onInk : theme.text }}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton title="Confirm new time" disabled={!selDay || !selTime} onPress={confirmReschedule} />
      </Sheet>
    </Screen>
  );
}
