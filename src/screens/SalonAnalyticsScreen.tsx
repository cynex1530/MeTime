import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Sheet } from '../components/Sheet';
import { BackButton, Card, Screen } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { fetchMyLocations } from '../lib/api';
import { ACCENT, ArtistPerf, leaderboards, SALON_DEMO } from '../lib/salonStats';
import { Salon } from '../types';
import { useTheme } from '../theme/ThemeContext';

const GREEN = '#1f8a4c';
const RED = '#e5484d';
const PURPLE = '#6C5CE7';
const GREEN_BAR = '#42B883';
const AMBER = '#E8A94B';

function H2({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: theme.text, marginTop: 26, marginBottom: 12 }}>
      {children}
    </Text>
  );
}

function DeltaInline({ delta, good }: { delta: number; good: boolean }) {
  const color = good ? GREEN : RED;
  return (
    <Text style={{ color, fontSize: 13, fontWeight: '700' }}>
      {good ? '▲' : '▼'} {delta > 0 ? '+' : ''}
      {delta}%
    </Text>
  );
}

function Delta({ delta, good }: { delta: number; good: boolean }) {
  const color = good ? GREEN : RED;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      <Text style={{ color, fontSize: 10 }}>{good ? '▲' : '▼'}</Text>
      <Text style={{ color, fontSize: 13, fontWeight: '700' }}>
        {delta > 0 ? '+' : ''}
        {delta}%
      </Text>
    </View>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary }}>{children}</Text>;
}

function FilterDropdown({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
}) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: theme.card,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          paddingHorizontal: 14,
          paddingVertical: 10,
        }}
      >
        <Text style={{ fontSize: 13, color: theme.textSecondary }}>{label}</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{value}</Text>
        <Feather name="chevron-down" size={14} color={theme.iconMuted} />
      </Pressable>
      <Sheet visible={open} onClose={() => setOpen(false)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 10 }}>{label}</Text>
        {options.map((o, i) => (
          <Pressable
            key={o}
            onPress={() => {
              onSelect(o);
              setOpen(false);
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: theme.hairline,
            }}
          >
            <Text style={{ fontSize: 16, color: theme.text }}>{o}</Text>
            {value === o ? <Feather name="check" size={18} color={theme.iconStroke} /> : null}
          </Pressable>
        ))}
      </Sheet>
    </>
  );
}

function Avatar({ initials, color, size = 46 }: { initials: string; color: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: 14, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontSize: size * 0.32, fontWeight: '800' }}>{initials}</Text>
    </View>
  );
}

function Badge({ kind }: { kind: ArtistPerf['badge'] }) {
  const map = {
    Excellent: { bg: 'rgba(48,164,108,0.16)', fg: GREEN },
    Average: { bg: 'rgba(232,169,75,0.18)', fg: '#b5791f' },
    Low: { bg: 'rgba(229,72,77,0.14)', fg: RED },
  }[kind];
  return (
    <View style={{ backgroundColor: map.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ color: map.fg, fontSize: 12, fontWeight: '700' }}>{kind}</Text>
    </View>
  );
}

export function SalonAnalyticsScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const router = useRouter();
  const stats = SALON_DEMO;

  const [metric, setMetric] = useState<'revenue' | 'appts'>('revenue');
  const [query, setQuery] = useState('');

  // Owner's salons + selected one (selector appears when there's more than one)
  const [salons, setSalons] = useState<Salon[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);

  // Working filters
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [artistFilter, setArtistFilter] = useState('All');
  const [serviceFilter, setServiceFilter] = useState('All');

  useEffect(() => {
    if (profile)
      fetchMyLocations(profile.id).then((locs) => {
        setSalons(locs);
        setSalonId((prev) => prev ?? locs[0]?.id ?? null);
      });
  }, [profile]);

  const selectedSalonName = salons.find((s) => s.id === salonId)?.name ?? stats.salonName;

  const bars = stats.overview[metric];
  const barMax = useMemo(() => Math.max(...bars.map((b) => b.value)), [bars]);
  const leaders = useMemo(() => leaderboards(stats.artists), [stats.artists]);
  const filteredArtists = stats.artists.filter((a) => {
    const matchesQuery =
      a.name.toLowerCase().includes(query.toLowerCase()) || a.profession.toLowerCase().includes(query.toLowerCase());
    const matchesFilter = artistFilter === 'All' || a.name === artistFilter;
    return matchesQuery && matchesFilter;
  });
  const filteredServices =
    serviceFilter === 'All' ? stats.services.list : stats.services.list.filter((s) => s.name === serviceFilter);

  const artistOptions = ['All', ...stats.artists.map((a) => a.name)];
  const serviceOptions = ['All', ...stats.services.list.map((s) => s.name)];

  return (
    <Screen clearTabBar>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <BackButton />
        <View>
          <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>Salon Analytics</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>{selectedSalonName} · full performance</Text>
        </View>
      </View>

      {/* Salon selector — shown only when the owner has more than one salon */}
      {salons.length > 1 ? (
        <View style={{ marginBottom: 12 }}>
          <FilterDropdown
            label="Salon"
            value={selectedSalonName}
            options={salons.map((s) => s.name)}
            onSelect={(name) => setSalonId(salons.find((s) => s.name === name)?.id ?? null)}
          />
        </View>
      ) : null}

      {/* Filters (working dropdowns; export/print removed) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginBottom: 18 }}>
        <FilterDropdown
          label="Date range"
          value={dateRange}
          options={['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This year']}
          onSelect={setDateRange}
        />
        <FilterDropdown label="Artist" value={artistFilter} options={artistOptions} onSelect={setArtistFilter} />
        <FilterDropdown label="Service" value={serviceFilter} options={serviceOptions} onSelect={setServiceFilter} />
      </ScrollView>

      {/* KPI grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {stats.kpis.map((k) => (
          <Card key={k.key} style={{ width: '47%', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: k.tint, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={k.icon as any} size={18} color={k.fg} />
              </View>
              <Delta delta={k.delta} good={k.good} />
            </View>
            <View>
              <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text }}>{k.value}</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{k.label}</Text>
            </View>
          </Card>
        ))}
      </View>

      {/* Overview chart */}
      <Card style={{ marginTop: 16, gap: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Label>OVERVIEW</Label>
            <Text style={{ fontSize: 30, fontWeight: '800', color: theme.text, marginTop: 4 }}>
              {metric === 'revenue' ? stats.overview.revenueTotal : stats.overview.apptsTotal}
            </Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>{dateRange}</Text>
          </View>
          <View style={{ gap: 8 }}>
            {(['revenue', 'appts'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMetric(m)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: metric === m ? PURPLE : theme.bg,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: metric === m ? '#fff' : theme.textSecondary }}>
                  {m === 'revenue' ? 'Revenue' : 'Appointments'}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* value labels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {bars.map((b) => (
            <Text key={b.label} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: theme.textTertiary, fontWeight: '600' }}>
              {metric === 'revenue' ? `$${b.value}k` : b.value}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 12 }}>
          {bars.map((b) => (
            <View key={b.label} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ width: '100%', height: Math.max(10, (b.value / barMax) * 140), backgroundColor: PURPLE, borderRadius: 12 }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {bars.map((b) => (
            <Text key={b.label} style={{ flex: 1, textAlign: 'center', fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>
              {b.label}
            </Text>
          ))}
        </View>

        {/* range toggle — shares state with the top Date range filter */}
        <View style={{ flexDirection: 'row', backgroundColor: theme.bg, borderRadius: 999, padding: 4 }}>
          {[
            { k: 'Last 7 days', l: '7 Days' },
            { k: 'Last 30 days', l: '30 Days' },
            { k: 'Last 90 days', l: '3 Months' },
            { k: 'This year', l: '12 Months' },
          ].map((r) => (
            <Pressable
              key={r.k}
              onPress={() => setDateRange(r.k)}
              style={{ flex: 1, paddingVertical: 9, borderRadius: 999, alignItems: 'center', backgroundColor: dateRange === r.k ? theme.inkSurface : 'transparent' }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: dateRange === r.k ? theme.onInk : theme.textSecondary }}>{r.l}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Artist performance */}
      <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: theme.text, marginTop: 26, marginBottom: 12 }}>
        Artist performance
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: theme.card,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 14,
        }}
      >
        <Feather name="search" size={18} color={theme.iconMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search artists or profession"
          placeholderTextColor={theme.textFaint}
          style={{ flex: 1, fontSize: 16, color: theme.text, padding: 0 }}
        />
      </View>
      <View style={{ gap: 14 }}>
        {filteredArtists.map((a) => (
          <Card key={a.id} style={{ gap: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Avatar initials={a.initials} color={ACCENT} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>{a.name}</Text>
                <Text style={{ fontSize: 14, color: theme.textSecondary }}>{a.profession}</Text>
              </View>
              <Badge kind={a.badge} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[
                { v: `$${(a.revenue / 1000).toFixed(1)}k`, l: 'Revenue' },
                { v: `${a.appts}`, l: 'Appts' },
                { v: `${a.rating}`, l: 'Rating' },
                { v: `${a.occupancy}%`, l: 'Occupancy' },
              ].map((s) => (
                <View key={s.l}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>{s.v}</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>{s.l}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.hairline }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                Return <Text style={{ fontWeight: '700', color: theme.text }}>{a.returnPct}%</Text>
              </Text>
              <View style={{ marginLeft: 14 }}>
                <Delta delta={a.growth} good={a.growth >= 0} />
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/salon-artist/[id]', params: { id: a.id } })}
                style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: PURPLE }}>View</Text>
                <Feather name="chevron-right" size={16} color={PURPLE} />
              </Pressable>
            </View>
          </Card>
        ))}
      </View>

      {/* Leaderboards */}
      <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: theme.text, marginTop: 26, marginBottom: 12 }}>
        Leaderboards
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {leaders.map((l) => (
          <Card key={l.title} style={{ width: '47%', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Label>{l.title}</Label>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: '#E8A94B', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#fff' }}>1</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Avatar initials={l.artist.initials} color={ACCENT} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.text }} numberOfLines={1}>
                  {l.artist.name}
                </Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: PURPLE }}>{l.value}</Text>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* SERVICES ANALYTICS */}
      <H2>Services analytics</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {[
          { l: 'MOST POPULAR', v: stats.services.mostPopular.name, s: `${stats.services.mostPopular.booked} booked` },
          { l: 'TOP REVENUE', v: stats.services.topRevenue.name, s: stats.services.topRevenue.amount },
          { l: 'AVG PRICE', v: stats.services.avgPrice, s: 'per service' },
          { l: 'AVG DURATION', v: stats.services.avgDuration, s: 'per appt' },
        ].map((t) => (
          <Card key={t.l} style={{ width: '47%' }}>
            <Label>{t.l}</Label>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, marginTop: 6 }}>{t.v}</Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{t.s}</Text>
          </Card>
        ))}
      </View>
      <Card style={{ marginTop: 14, gap: 18 }}>
        {filteredServices.map((s) => {
          const max = Math.max(...stats.services.list.map((x) => x.revenue));
          return (
            <View key={s.name} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{s.name}</Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>${(s.revenue / 1000).toFixed(1)}k</Text>
              </View>
              <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.bg, overflow: 'hidden' }}>
                <View style={{ width: `${(s.revenue / max) * 100}%`, height: '100%', backgroundColor: PURPLE, borderRadius: 999 }} />
              </View>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                {s.appts} appts · {s.minutes} min · ★ {s.rating}
              </Text>
            </View>
          );
        })}
      </Card>

      {/* OCCUPANCY BY DAY */}
      <Card style={{ marginTop: 16, gap: 12 }}>
        <Label>OCCUPANCY BY DAY</Label>
        <View style={{ flexDirection: 'row', paddingLeft: 92 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '700', color: theme.textTertiary }}>
              {d}
            </Text>
          ))}
        </View>
        {stats.occupancy.map((row) => (
          <View key={row.name} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 92, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Avatar initials={row.initials} color={ACCENT} size={28} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{row.name}</Text>
            </View>
            {row.cells.map((c, i) => (
              <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                <View style={{ width: '86%', aspectRatio: 1, maxWidth: 34, borderRadius: 8, backgroundColor: `rgba(108,92,231,${Math.max(0.15, c)})` }} />
              </View>
            ))}
          </View>
        ))}
      </Card>

      {/* TIME-SLOT DEMAND */}
      <Card style={{ marginTop: 16, gap: 12 }}>
        <Label>TIME-SLOT DEMAND</Label>
        {(() => {
          const max = Math.max(...stats.demand.slots.map((s) => s.value));
          return stats.demand.slots.map((s) => {
            const color = s.level === 'peak' ? GREEN_BAR : s.level === 'low' ? theme.hairlineStrong : PURPLE;
            return (
              <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ width: 52, fontSize: 13, color: theme.textSecondary }}>{s.label}</Text>
                {/* bar in its own flex box, value in a fixed column so it never overflows */}
                <View style={{ flex: 1 }}>
                  <View style={{ width: `${(s.value / max) * 100}%`, minWidth: 24, height: 26, borderRadius: 8, backgroundColor: color }} />
                </View>
                <Text style={{ width: 34, textAlign: 'right', fontSize: 13, fontWeight: '700', color: theme.textSecondary }}>
                  {s.value}
                </Text>
              </View>
            );
          });
        })()}
        <View style={{ height: 1, backgroundColor: theme.hairline, marginTop: 4 }} />
        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>Suggested free slots</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {stats.demand.suggested.map((s) => (
            <View key={s} style={{ backgroundColor: theme.bg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>{s}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* CUSTOMER ANALYTICS */}
      <H2>Customer analytics</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {stats.customers.map((c) => (
          <Card key={c.label} style={{ width: '47%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.dot }} />
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>{c.label}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 6 }}>
              <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text }}>{c.value}</Text>
              <View style={{ marginBottom: 4 }}>
                <DeltaInline delta={c.delta} good={c.good} />
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* REVIEWS */}
      <H2>Reviews</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {[
          { l: 'Average rating', v: `★ ${stats.reviews.avg}`, green: false },
          { l: '5-star reviews', v: stats.reviews.fiveStar, green: false },
          { l: 'Negative reviews', v: stats.reviews.negative, green: false },
          { l: 'Review trend', v: stats.reviews.trend, green: true },
        ].map((t) => (
          <Card key={t.l} style={{ width: '47%' }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>{t.l}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: t.green ? GREEN : theme.text, marginTop: 6 }}>{t.v}</Text>
          </Card>
        ))}
      </View>
      <Card style={{ marginTop: 14, gap: 12 }}>
        <Label>RATING EVOLUTION</Label>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {stats.reviews.evolution.map((e, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: theme.textTertiary, fontWeight: '600' }}>
              {e.value}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 90, gap: 10 }}>
          {stats.reviews.evolution.map((e, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ width: '100%', height: Math.max(10, ((e.value - 4.3) / 0.6) * 70), backgroundColor: AMBER, borderRadius: 8 }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {stats.reviews.evolution.map((e, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>
              {e.label}
            </Text>
          ))}
        </View>
      </Card>

      {/* CANCELLATIONS & NO-SHOWS */}
      <H2>Cancellations</H2>
      <Card>
        <Text style={{ fontSize: 14, color: theme.textSecondary }}>Cancellation rate</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 6 }}>
          {stats.cancellations.cancelRate.value}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: GREEN, marginTop: 6 }}>
          ▼ {stats.cancellations.cancelRate.delta}% vs last month
        </Text>
      </Card>
      <Card style={{ marginTop: 14, gap: 12 }}>
        <Label>CANCELLATIONS BY ARTIST</Label>
        {stats.cancellations.byArtist.map((a) => {
          const color = a.level === 'high' ? RED : a.level === 'mid' ? AMBER : GREEN_BAR;
          const max = Math.max(...stats.cancellations.byArtist.map((x) => x.pct));
          return (
            <View key={a.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ width: 56, fontSize: 14, fontWeight: '700', color: theme.text }}>{a.name}</Text>
              <View style={{ flex: 1, height: 8, borderRadius: 999, backgroundColor: theme.bg, overflow: 'hidden' }}>
                <View style={{ width: `${(a.pct / max) * 100}%`, height: '100%', backgroundColor: color, borderRadius: 999 }} />
              </View>
              <Text style={{ width: 36, textAlign: 'right', fontSize: 14, fontWeight: '700', color: theme.textSecondary }}>{a.pct}%</Text>
            </View>
          );
        })}
      </Card>

      {/* FINANCIAL */}
      <H2>Financial</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {stats.financial.map((t) => (
          <Card key={t.label} style={{ width: '47%' }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>{t.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 6 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text }}>{t.value}</Text>
              <View style={{ marginBottom: 4 }}>
                <DeltaInline delta={t.delta} good />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
