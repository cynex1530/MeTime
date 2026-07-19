import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { RingProgress } from '../components/RingProgress';
import { BackButton, Card, Screen } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { fetchArtistAllBookings, fetchMyArtistRow } from '../lib/api';
import { BookingKey, computeStats, DEMO_STATS, formatMoney, RevenueKey, Stats } from '../lib/stats';
import { useTheme } from '../theme/ThemeContext';

const GREEN_BG = 'rgba(48,164,108,0.16)';
const GREEN_FG = '#1f8a4c';

function GreenBadge({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: GREEN_BG,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: GREEN_FG, fontSize: 10 }}>▲</Text>
      <Text style={{ color: GREEN_FG, fontSize: 13, fontWeight: '700' }}>{label}</Text>
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary }}>{children}</Text>
  );
}

function Pills<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { theme } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => onChange(o.key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 999,
              backgroundColor: active ? theme.inkSurface : theme.bg,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: active ? theme.onInk : theme.textSecondary }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function DashboardScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>(DEMO_STATS);
  const [revKey, setRevKey] = useState<RevenueKey>('month');
  const [bookKey, setBookKey] = useState<BookingKey>('today');

  useEffect(() => {
    (async () => {
      const artist = profile ? await fetchMyArtistRow(profile.id) : null;
      const all = await fetchArtistAllBookings(artist?.id ?? null);
      setStats(computeStats(all));
    })();
  }, [profile]);

  const rev = revKey === 'custom' ? null : stats.revenue[revKey];
  const book = stats.bookings[bookKey];
  const bookNoun =
    bookKey === 'today' ? 'today' : bookKey === 'tomorrow' ? 'tomorrow' : bookKey === 'week' ? 'this week' : 'this month';
  const trendMax = useMemo(() => Math.max(...stats.trend.map((t) => t.value), 1), [stats.trend]);

  const barGrey = theme.isDark ? 'rgba(235,235,245,0.22)' : '#d3d3d8';

  return (
    <Screen clearTabBar>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <BackButton />
        <View>
          <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>Dashboard</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>Your salon at a glance</Text>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        {/* REVENUE */}
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>REVENUE</Label>
            <GreenBadge label={rev && rev.deltaPct ? `+${rev.deltaPct}%` : undefined} />
          </View>
          <Pills<RevenueKey>
            options={[
              { key: 'today', label: 'Today' },
              { key: 'week', label: 'This week' },
              { key: 'month', label: 'This month' },
              { key: 'year', label: 'This year' },
              { key: 'custom', label: 'Custom' },
            ]}
            value={revKey}
            onChange={setRevKey}
          />
          {rev ? (
            <View>
              <Text style={{ fontSize: 44, fontWeight: '800', letterSpacing: -1.5, color: theme.text }}>
                {formatMoney(rev.amount)}
              </Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{rev.sub}</Text>
            </View>
          ) : (
            <Text style={{ fontSize: 15, color: theme.textSecondary, paddingVertical: 8 }}>
              Pick a start and end date to see revenue for a custom range.
            </Text>
          )}
        </Card>

        {/* BOOKINGS */}
        <Card style={{ gap: 14 }}>
          <Label>BOOKINGS</Label>
          <Pills<BookingKey>
            options={[
              { key: 'today', label: 'Today' },
              { key: 'tomorrow', label: 'Tomorrow' },
              { key: 'week', label: 'This week' },
              { key: 'month', label: 'This month' },
            ]}
            value={bookKey}
            onChange={setBookKey}
          />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: theme.text }}>{book.total}</Text>
            <Text style={{ fontSize: 16, color: theme.textSecondary, marginBottom: 8 }}>appointments {bookNoun}</Text>
          </View>
          {bookKey === 'today' && book.done !== undefined ? (
            <View style={{ gap: 8 }}>
              <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.bg, overflow: 'hidden' }}>
                <View
                  style={{
                    width: `${book.total ? (book.done / book.total) * 100 : 0}%`,
                    height: '100%',
                    backgroundColor: theme.text,
                    borderRadius: 999,
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: theme.text }} />
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{book.done} done</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: barGrey }} />
                  <Text style={{ fontSize: 14, color: theme.textSecondary }}>{book.todo} to do</Text>
                </View>
              </View>
            </View>
          ) : null}
        </Card>

        {/* CLIENTS */}
        <Card style={{ gap: 12 }}>
          <Label>CLIENTS</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            {[
              { n: stats.clients.all, t: 'All clients', s: 'total' },
              { n: stats.clients.new, t: 'New', s: 'this month' },
              { n: stats.clients.returning, t: 'Returning', s: 'booked again' },
              { n: stats.clients.active, t: 'Active', s: 'last 90 days' },
            ].map((c) => (
              <View
                key={c.t}
                style={{ width: '47%', backgroundColor: theme.bg, borderRadius: 16, padding: 16 }}
              >
                <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text }}>{c.n}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginTop: 4 }}>{c.t}</Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>{c.s}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* RETURN RATE */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <RingProgress pct={stats.returnRate.pct} />
          <View style={{ flex: 1, gap: 6 }}>
            <Label>RETURN RATE</Label>
            <Text style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 21 }}>
              {stats.returnRate.returned} of {stats.returnRate.all} clients came back to book again.
            </Text>
            <GreenBadge label={stats.returnRate.deltaPts ? `+${stats.returnRate.deltaPts} pts vs last month` : undefined} />
          </View>
        </Card>

        {/* REVENUE BY SERVICE */}
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>REVENUE BY SERVICE</Label>
            <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>
              {formatMoney(stats.byService.reduce((n, s) => n + s.amount, 0))}
            </Text>
          </View>
          {stats.byService.map((s) => (
            <View key={s.name} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{s.name}</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                  {formatMoney(s.amount)} · {s.pct}%
                </Text>
              </View>
              <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.bg, overflow: 'hidden' }}>
                <View style={{ width: `${s.pct}%`, height: '100%', backgroundColor: theme.text, borderRadius: 999 }} />
              </View>
            </View>
          ))}
        </Card>

        {/* REVENUE TREND */}
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>REVENUE TREND</Label>
            <GreenBadge label={stats.revenue.month.deltaPct ? `+${stats.revenue.month.deltaPct}%` : undefined} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {stats.trend.map((t) => (
              <Text
                key={t.label}
                style={{ flex: 1, textAlign: 'center', fontSize: 12, color: t.current ? theme.text : theme.textTertiary, fontWeight: t.current ? '800' : '600' }}
              >
                {t.value}k
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 10 }}>
            {stats.trend.map((t) => (
              <View key={t.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                <View
                  style={{
                    width: '100%',
                    height: Math.max(8, (t.value / trendMax) * 120),
                    backgroundColor: t.current ? theme.text : barGrey,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {stats.trend.map((t) => (
              <Text
                key={t.label}
                style={{ flex: 1, textAlign: 'center', fontSize: 13, color: t.current ? theme.text : theme.textSecondary, fontWeight: t.current ? '800' : '500' }}
              >
                {t.label}
              </Text>
            ))}
          </View>
        </Card>

        {/* TOP CLIENTS */}
        <Card style={{ gap: 14 }}>
          <Label>TOP CLIENTS</Label>
          {stats.topClients.map((c, i) => (
            <View key={c.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: i === 0 ? theme.inkSurface : theme.bg,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '800', color: i === 0 ? theme.onInk : theme.textSecondary }}>
                  {i + 1}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{c.name}</Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>{c.visits} visits</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{formatMoney(c.amount)}</Text>
            </View>
          ))}
        </Card>

        {/* GROWTH */}
        <Card style={{ gap: 2 }}>
          <Label>GROWTH VS LAST MONTH</Label>
          {stats.growth.map((g, i) => (
            <View
              key={g.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 14,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.hairline,
              }}
            >
              <Text style={{ fontSize: 16, color: theme.text }}>{g.label}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{g.value}</Text>
                <GreenBadge label={g.delta || undefined} />
              </View>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}
