import { Feather } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ConfirmDialog, Sheet } from '../components/Sheet';
import { EmptyState, SkeletonList } from '../components/Skeleton';
import { SwipeRow } from '../components/SwipeRow';
import { Card, PrimaryButton, Screen, ScreenTitle, SectionTitle } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n/i18n';
import { cancelBooking, fetchArtistScheduleFull, fetchMyArtistRow, rescheduleBooking, setBookingNoShow } from '../lib/api';
import { formatTime, formatTimeRange, WEEKDAYS } from '../lib/format';
import { generateDaySlots } from '../lib/schedule';
import { useTheme } from '../theme/ThemeContext';
import { Artist, Booking } from '../types';

const RED = '#E5484D';

function nextDays(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + 1 + i);
    return d;
  });
}

// A stable per-calendar-day key (local time).
const dayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export function ScheduleScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { t } = useT();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Reschedule sheet (upcoming bookings only)
  const [reschId, setReschId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [reschDay, setReschDay] = useState<Date | null>(null);
  const [reschTime, setReschTime] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      setLoading(true);
      try {
        const a = await fetchMyArtistRow(profile.id);
        setArtist(a);
        setBookings(await fetchArtistScheduleFull(a?.id ?? null));
      } finally {
        setLoading(false);
      }
    })();
  }, [profile]);

  // Group bookings into the distinct days that have appointments (sorted).
  const days = useMemo(() => {
    const map = new Map<string, { key: string; date: Date; items: Booking[] }>();
    [...bookings]
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
      .forEach((b) => {
        const key = dayKey(b.starts_at);
        if (!map.has(key)) {
          const d = new Date(b.starts_at);
          d.setHours(0, 0, 0, 0);
          map.set(key, { key, date: d, items: [] });
        }
        map.get(key)!.items.push(b);
      });
    return [...map.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bookings]);

  // Default the selected day to the one holding the closest upcoming appointment
  // (so opening the tab shows what's coming next); else the most recent day.
  useEffect(() => {
    if (!days.length) {
      setSelectedKey(null);
      return;
    }
    if (selectedKey && days.some((d) => d.key === selectedKey)) return;
    const now = Date.now();
    const firstUpcoming = days.find((d) => d.items.some((b) => new Date(b.starts_at).getTime() >= now));
    setSelectedKey((firstUpcoming ?? days[days.length - 1]).key);
  }, [days, selectedKey]);

  const selectedDay = days.find((d) => d.key === selectedKey) ?? null;
  const now = Date.now();
  const upcoming = (selectedDay?.items ?? [])
    .filter((b) => new Date(b.starts_at).getTime() >= now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const past = (selectedDay?.items ?? [])
    .filter((b) => new Date(b.starts_at).getTime() < now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const resch = bookings.find((b) => b.id === reschId);

  function confirmReschedule() {
    if (!resch || !reschDay || !reschTime) return;
    const [h, m] = reschTime.split(':').map(Number);
    const start = new Date(reschDay);
    start.setHours(h, m, 0, 0);
    const end = new Date(start.getTime() + resch.duration_minutes * 60000);
    rescheduleBooking(resch.id, start.toISOString(), end.toISOString());
    setBookings((bs) =>
      bs.map((b) => (b.id === resch.id ? { ...b, starts_at: start.toISOString(), ends_at: end.toISOString() } : b))
    );
    setReschId(null);
    setReschDay(null);
    setReschTime(null);
  }

  async function toggleNoShow(b: Booking) {
    const noShow = b.status !== 'no_show';
    setBookings((bs) => bs.map((x) => (x.id === b.id ? { ...x, status: noShow ? 'no_show' : 'confirmed' } : x)));
    await setBookingNoShow(b.id, noShow);
  }

  const timeBlock = (b: Booking) => (
    <View style={{ width: 62, alignItems: 'center' }}>
      <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{formatTime(b.starts_at)}</Text>
      <Text style={{ fontSize: 11, color: theme.textSecondary, marginTop: 1 }}>{formatTime(b.ends_at)}</Text>
    </View>
  );

  return (
    <Screen clearTabBar>
      <ScreenTitle title={t('schedule.title')} subtitle={t('schedule.subtitle')} />

      {loading ? (
        <SkeletonList count={4} />
      ) : days.length === 0 ? (
        <EmptyState icon="calendar" title={t('schedule.none')} />
      ) : (
        <>
          {/* Day selector — the days that have bookings; selected is bordered */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingVertical: 2, paddingRight: 8 }}
            style={{ marginBottom: 18 }}
          >
            {days.map((d) => {
              const selected = d.key === selectedKey;
              const isToday = isSameDay(d.date, new Date());
              return (
                <Pressable
                  key={d.key}
                  onPress={() => setSelectedKey(d.key)}
                  style={{
                    minWidth: 60,
                    paddingVertical: 10,
                    paddingHorizontal: 10,
                    borderRadius: 16,
                    alignItems: 'center',
                    backgroundColor: theme.card,
                    borderWidth: 2,
                    borderColor: selected ? theme.text : theme.cardBorder,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: theme.textSecondary }}>
                    {isToday ? t('schedule.today').toUpperCase() : WEEKDAYS[d.date.getDay()].toUpperCase()}
                  </Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: theme.text, marginTop: 2 }}>
                    {d.date.getDate()}
                  </Text>
                  <View
                    style={{
                      marginTop: 4,
                      minWidth: 18,
                      paddingHorizontal: 5,
                      height: 18,
                      borderRadius: 9,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: selected ? theme.inkSurface : theme.bg,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: selected ? theme.onInk : theme.textSecondary }}>
                      {d.items.length}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Upcoming for the selected day — closest first, still editable */}
          {upcoming.length > 0 ? (
            <>
              <SectionTitle style={{ marginTop: 0 }}>{t('schedule.upcoming')}</SectionTitle>
              <View style={{ gap: 12 }}>
                {upcoming.map((b) => (
                  <SwipeRow
                    key={b.id}
                    onEdit={() => {
                      setReschId(b.id);
                      setReschDay(null);
                      setReschTime(null);
                    }}
                    onDelete={() => setDelId(b.id)}
                  >
                    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                      {timeBlock(b)}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{b.customer_name}</Text>
                        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{b.service_name}</Text>
                      </View>
                    </Card>
                  </SwipeRow>
                ))}
              </View>
            </>
          ) : null}

          {/* Past for the selected day — read-only except "Not shown" */}
          {past.length > 0 ? (
            <>
              <SectionTitle>{t('schedule.past')}</SectionTitle>
              <View style={{ gap: 12 }}>
                {past.map((b) => {
                  const isNoShow = b.status === 'no_show';
                  return (
                    <Card
                      key={b.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 14,
                        borderWidth: isNoShow ? 2 : 1,
                        borderColor: isNoShow ? RED : theme.cardBorder,
                      }}
                    >
                      {timeBlock(b)}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{b.customer_name}</Text>
                        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{b.service_name}</Text>
                      </View>
                      {/* Only action allowed on a past booking: mark as no-show */}
                      <Pressable
                        onPress={() => toggleNoShow(b)}
                        hitSlop={6}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingHorizontal: 12,
                          paddingVertical: 8,
                          borderRadius: 999,
                          borderWidth: 1.5,
                          borderColor: isNoShow ? RED : theme.hairlineStrong,
                          backgroundColor: isNoShow ? 'rgba(229,72,77,0.12)' : 'transparent',
                        }}
                      >
                        <Feather name="user-x" size={14} color={isNoShow ? RED : theme.iconMuted} />
                        <Text style={{ fontSize: 12, fontWeight: '700', color: isNoShow ? RED : theme.textSecondary }}>
                          {t('schedule.notShown')}
                        </Text>
                      </Pressable>
                    </Card>
                  );
                })}
              </View>
            </>
          ) : null}

          {upcoming.length === 0 && past.length === 0 ? (
            <EmptyState icon="calendar" title={t('schedule.noneDay')} />
          ) : null}
        </>
      )}

      {/* Delete confirmation (upcoming only) */}
      <ConfirmDialog
        visible={delId !== null}
        title={t('schedule.deleteTitle')}
        message={(() => {
          const b = bookings.find((x) => x.id === delId);
          if (!b) return '';
          return `${b.customer_name} · ${formatTimeRange(b.starts_at, b.ends_at)}`;
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
          {nextDays(8).map((d) => {
            const sel = reschDay?.toDateString() === d.toDateString();
            return (
              <Pressable
                key={d.toISOString()}
                onPress={() => {
                  setReschDay(d);
                  setReschTime(null);
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
        {reschDay ? (
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
                const sel = reschTime === time;
                return (
                  <Pressable
                    key={time}
                    disabled={!available}
                    onPress={() => setReschTime(time)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: sel ? theme.inkSurface : theme.bg,
                      opacity: available ? 1 : 0.35,
                    }}
                  >
                    <Text style={{ fontSize: 14, fontWeight: '600', color: sel ? theme.onInk : theme.text }}>{time}</Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        ) : null}
        <PrimaryButton title={t('common.saveChanges')} disabled={!reschDay || !reschTime} onPress={confirmReschedule} />
      </Sheet>
    </Screen>
  );
}
