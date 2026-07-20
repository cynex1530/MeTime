import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { RingProgress } from '../components/RingProgress';
import { BackButton, Card, Screen } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n/i18n';
import { ArtistReview, fetchArtistReviews, fetchMyArtistRow, fetchStatsBookings } from '../lib/api';
import { supabase } from '../lib/supabase';
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
  const { t } = useT();
  // Real data from the database; the demo dataset is only used with no backend.
  const [stats, setStats] = useState<Stats>(supabase ? computeStats([]) : DEMO_STATS);
  const [reviews, setReviews] = useState<ArtistReview[]>([]);
  const [revKey, setRevKey] = useState<RevenueKey>('month');
  const [bookKey, setBookKey] = useState<BookingKey>('today');

  useEffect(() => {
    (async () => {
      if (!supabase) {
        setStats(DEMO_STATS);
        return;
      }
      if (!profile) return;
      const bookings = await fetchStatsBookings(profile);
      setStats(computeStats(bookings));
      const artist = await fetchMyArtistRow(profile.id);
      setReviews(await fetchArtistReviews(artist?.id ?? null));
    })();
  }, [profile]);

  const avgRating = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  const recentTextReviews = reviews.filter((r) => r.comment && r.comment.trim()).slice(0, 3);

  const rev = revKey === 'custom' ? null : stats.revenue[revKey];
  const book = stats.bookings[bookKey];
  const apptsLabel =
    bookKey === 'today' ? t('dash.apptsToday') : bookKey === 'tomorrow' ? t('dash.apptsTomorrow') : bookKey === 'week' ? t('dash.apptsWeek') : t('dash.apptsMonth');
  const trendMax = useMemo(() => Math.max(...stats.trend.map((pt) => pt.value), 1), [stats.trend]);

  const barGrey = theme.isDark ? 'rgba(235,235,245,0.22)' : '#d3d3d8';

  return (
    <Screen clearTabBar>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <BackButton />
        <View>
          <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>{t('dash.title')}</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>{t('dash.subtitle')}</Text>
        </View>
      </View>

      <View style={{ gap: 16 }}>
        {/* REVENUE */}
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>{t('dash.revenue')}</Label>
            <GreenBadge label={rev && rev.deltaPct ? `+${rev.deltaPct}%` : undefined} />
          </View>
          <Pills<RevenueKey>
            options={[
              { key: 'today', label: t('dash.today') },
              { key: 'week', label: t('dash.week') },
              { key: 'month', label: t('dash.month') },
              { key: 'year', label: t('dash.year') },
              { key: 'custom', label: t('dash.custom') },
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
              {t('dash.customRangeHint')}
            </Text>
          )}
        </Card>

        {/* BOOKINGS */}
        <Card style={{ gap: 14 }}>
          <Label>{t('dash.bookings')}</Label>
          <Pills<BookingKey>
            options={[
              { key: 'today', label: t('dash.today') },
              { key: 'tomorrow', label: t('dash.tomorrow') },
              { key: 'week', label: t('dash.week') },
              { key: 'month', label: t('dash.month') },
            ]}
            value={bookKey}
            onChange={setBookKey}
          />
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
            <Text style={{ fontSize: 38, fontWeight: '800', color: theme.text }}>{book.total}</Text>
            <Text style={{ fontSize: 16, color: theme.textSecondary, marginBottom: 8 }}>{apptsLabel}</Text>
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
                  <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{book.done} {t('dash.done')}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: barGrey }} />
                  <Text style={{ fontSize: 14, color: theme.textSecondary }}>{book.todo} {t('dash.todo')}</Text>
                </View>
              </View>
            </View>
          ) : null}
        </Card>

        {/* CLIENTS */}
        <Card style={{ gap: 12 }}>
          <Label>{t('dash.clients')}</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
            {[
              { n: stats.clients.all, title: t('dash.allClients'), s: t('dash.clientsTotal') },
              { n: stats.clients.new, title: t('dash.new'), s: t('dash.clientsThisMonth') },
              { n: stats.clients.returning, title: t('dash.returning'), s: t('dash.bookedAgain') },
              { n: stats.clients.active, title: t('dash.active'), s: t('dash.last90') },
            ].map((c) => (
              <View
                key={c.title}
                style={{ width: '47%', backgroundColor: theme.bg, borderRadius: 16, padding: 16 }}
              >
                <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text }}>{c.n}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginTop: 4 }}>{c.title}</Text>
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>{c.s}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* RETURN RATE */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
          <RingProgress pct={stats.returnRate.pct} />
          <View style={{ flex: 1, gap: 6 }}>
            <Label>{t('dash.returnRate')}</Label>
            <Text style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 21 }}>
              {t('dash.returnRateDesc', { returned: stats.returnRate.returned, all: stats.returnRate.all })}
            </Text>
            <GreenBadge label={stats.returnRate.deltaPts ? t('dash.returnRateDelta', { n: stats.returnRate.deltaPts }) : undefined} />
          </View>
        </Card>

        {/* REVENUE BY SERVICE */}
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>{t('dash.byService')}</Label>
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
            <Label>{t('dash.trend')}</Label>
            <GreenBadge label={stats.revenue.month.deltaPct ? `+${stats.revenue.month.deltaPct}%` : undefined} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {stats.trend.map((pt) => (
              <Text
                key={pt.label}
                style={{ flex: 1, textAlign: 'center', fontSize: 12, color: pt.current ? theme.text : theme.textTertiary, fontWeight: pt.current ? '800' : '600' }}
              >
                {pt.value}k
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 10 }}>
            {stats.trend.map((pt) => (
              <View key={pt.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                <View
                  style={{
                    width: '100%',
                    height: Math.max(8, (pt.value / trendMax) * 120),
                    backgroundColor: pt.current ? theme.text : barGrey,
                    borderTopLeftRadius: 8,
                    borderTopRightRadius: 8,
                  }}
                />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            {stats.trend.map((pt) => (
              <Text
                key={pt.label}
                style={{ flex: 1, textAlign: 'center', fontSize: 13, color: pt.current ? theme.text : theme.textSecondary, fontWeight: pt.current ? '800' : '500' }}
              >
                {pt.label}
              </Text>
            ))}
          </View>
        </Card>

        {/* TOP CLIENTS */}
        <Card style={{ gap: 14 }}>
          <Label>{t('dash.topClients')}</Label>
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
                <Text style={{ fontSize: 13, color: theme.textSecondary }}>{c.visits} {t('dash.visits')}</Text>
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{formatMoney(c.amount)}</Text>
            </View>
          ))}
        </Card>

        {/* GROWTH */}
        <Card style={{ gap: 2 }}>
          <Label>{t('dash.growth')}</Label>
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

        {/* RATING & RECENT REVIEWS */}
        <Card style={{ gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Label>{t('dash.rating')}</Label>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 20, color: '#E8A94B' }}>★</Text>
              <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>
                {avgRating ? avgRating.toFixed(1) : '—'}
              </Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>
                {reviews.length === 1 ? t('dash.reviewCount', { n: reviews.length }) : t('dash.reviewsCount', { n: reviews.length })}
              </Text>
            </View>
          </View>

          {recentTextReviews.length > 0 ? (
            recentTextReviews.map((r, i) => (
              <View key={i} style={{ paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.hairline }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }}>
                    {r.customer_name || t('dash.anonymous')}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#E8A94B', letterSpacing: 1 }}>{'★'.repeat(r.rating)}</Text>
                </View>
                <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 3 }}>{r.comment}</Text>
              </View>
            ))
          ) : (
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>{t('dash.noReviews')}</Text>
          )}
        </Card>
      </View>
    </Screen>
  );
}
