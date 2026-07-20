import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ConfirmDialog, Sheet } from '../components/Sheet';
import { SwipeRow } from '../components/SwipeRow';
import { Card, PrimaryButton, Screen, ScreenTitle } from '../components/ui';
import { fetchArtistSchedule, fetchMyArtistRow, cancelBooking, rescheduleBooking } from '../lib/api';
import { formatBookingDate, formatTimeRange, WEEKDAYS } from '../lib/format';
import { generateDaySlots } from '../lib/schedule';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n/i18n';
import { useTheme } from '../theme/ThemeContext';
import { Artist, Booking } from '../types';

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
  const { t } = useT();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [reschId, setReschId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [selDay, setSelDay] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const a = profile ? await fetchMyArtistRow(profile.id) : null;
      setArtist(a);
      setBookings(await fetchArtistSchedule(a?.id ?? null));
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
      <ScreenTitle title={t('schedule.title')} subtitle={t('schedule.subtitle')} />
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
              // no row-tap handler: reschedule opens only from the Edit action
              onEdit={openReschedule}
              onDelete={() => setDelId(b.id)}
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
            {t('schedule.none')}
          </Text>
        ) : null}
      </View>

      {/* Delete confirmation */}
      <ConfirmDialog
        visible={delId !== null}
        title={t('schedule.deleteTitle')}
        message={(() => {
          const b = bookings.find((x) => x.id === delId);
          if (!b) return '';
          return `${b.customer_name} · ${formatBookingDate(b.starts_at)}, ${formatTimeRange(b.starts_at, b.ends_at)}`;
        })()}
        confirmLabel={t('common.delete')}
        onCancel={() => setDelId(null)}
        onConfirm={() => {
          if (delId) {
            cancelBooking(delId);
            setBookings((bs) => bs.filter((x) => x.id !== delId));
          }
          setDelId(null);
        }}
      />

      {/* Reschedule sheet */}
      <Sheet visible={reschId !== null} onClose={() => setReschId(null)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 4 }}>{t('schedule.reschedule')}</Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>
          {resch?.customer_name} · {resch?.service_name}
        </Text>
        <Text style={{ fontSize: 15, color: theme.textSecondary, marginBottom: 10 }}>{t('schedule.pickDay')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {days.map((d) => {
            const sel = selDay?.toDateString() === d.toDateString();
            return (
              <Pressable
                key={d.toISOString()}
                // changing the day refreshes the slots below and clears the time
                onPress={() => {
                  setSelDay(d);
                  setSelTime(null);
                }}
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
        {selDay ? (
          <>
            <Text style={{ fontSize: 15, color: theme.textSecondary, marginBottom: 10 }}>{t('schedule.pickTime')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {generateDaySlots(
                artist?.open_hour,
                artist?.close_hour,
                artist?.slot_minutes ?? 60,
                artist?.lunch_start,
                artist?.lunch_minutes
              ).map(({ time, available }) => {
                const sel = selTime === time;
                return (
                  <Pressable
                    key={time}
                    disabled={!available}
                    onPress={() => setSelTime(time)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: sel ? theme.inkSurface : theme.bg,
                      opacity: available ? 1 : 0.35,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: sel ? theme.onInk : theme.text }}>
                      {time}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
        <PrimaryButton title={t('common.saveChanges')} disabled={!selDay || !selTime} onPress={confirmReschedule} />
      </Sheet>
    </Screen>
  );
}
