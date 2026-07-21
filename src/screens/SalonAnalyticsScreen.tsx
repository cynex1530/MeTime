import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { EmptyState, Skeleton } from '../components/Skeleton';
import { BackButton, Card, Screen } from '../components/ui';
import { useAuth } from '../hooks/useAuth';
import { useT } from '../i18n/i18n';
import { fetchMyLocations, fetchSalonAnalyticsData } from '../lib/api';
import { ACCENT, ArtistPerf, computeSalonStats, leaderboards, SalonStats, scopeStatsToService } from '../lib/salonStats';
import { supabase } from '../lib/supabase';
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

/** A dropdown menu that opens anchored directly under its button. */
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
  const ref = useRef<View>(null);
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, w: 0 });

  function openMenu() {
    ref.current?.measureInWindow((x, y, w, h) => {
      setAnchor({ x, y: y + h + 6, w });
      setOpen(true);
    });
  }

  return (
    <View ref={ref} collapsable={false}>
      <Pressable
        onPress={openMenu}
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
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={14} color={theme.iconMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1 }} onPress={() => setOpen(false)}>
          <View
            style={{
              position: 'absolute',
              top: anchor.y,
              left: anchor.x,
              minWidth: Math.max(anchor.w, 190),
              maxHeight: 300,
              backgroundColor: theme.popoverBg,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.hairline,
              paddingVertical: 4,
              shadowColor: theme.shadow,
              shadowOpacity: 0.18,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 8 },
              elevation: 10,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
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
                    gap: 16,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: theme.hairline,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: value === o ? '700' : '500', color: theme.text }}>{o}</Text>
                  {value === o ? <Feather name="check" size={16} color={theme.iconStroke} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// A real, all-zero stats object (no demo data) used until the DB loads.
const EMPTY_STATS: SalonStats = computeSalonStats({ bookings: [], artists: [], reviews: [] });

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
  const { t } = useT();
  const router = useRouter();

  const [metric, setMetric] = useState<'revenue' | 'appts'>('revenue');
  const [query, setQuery] = useState('');

  // Date-range state stores stable English keys; labels are translated for display.
  const rangeLabel = (k: string) =>
    ({
      Today: t('sa.today'),
      'Last 7 days': t('sa.last7'),
      'Last 30 days': t('sa.last30'),
      'Last 90 days': t('sa.last90'),
      'This year': t('sa.thisYear'),
    } as Record<string, string>)[k] ?? k;
  const RANGE_KEYS = ['Today', 'Last 7 days', 'Last 30 days', 'Last 90 days', 'This year'];

  // Owner's salons + selected one (selector appears when there's more than one)
  const [salons, setSalons] = useState<Salon[]>([]);
  const [salonId, setSalonId] = useState<string | null>(null);

  // Working filters
  const [dateRange, setDateRange] = useState('Last 30 days');
  const [serviceFilter, setServiceFilter] = useState('All');

  // Base stats computed from the database. Starts as real zeros (never demo).
  const [baseStats, setBaseStats] = useState<SalonStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile)
      fetchMyLocations(profile.id).then((locs) => {
        setSalons(locs);
        setSalonId((prev) => prev ?? locs[0]?.id ?? null);
      });
  }, [profile]);

  // Read the selected salon's real data from the DB and compute the stats.
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const ids = salonId ? [salonId] : salons.map((s) => s.id);
    const realIds = ids.filter((id) => id && !id.startsWith('local') && id !== 'l1');
    if (!realIds.length) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchSalonAnalyticsData(realIds)
      .then((data) => setBaseStats(computeSalonStats(data)))
      .finally(() => setLoading(false));
  }, [salonId, salons]);

  // Selecting a service scopes the ENTIRE dashboard to that service.
  const stats = useMemo(
    () => (serviceFilter === 'All' ? baseStats : scopeStatsToService(baseStats, serviceFilter)),
    [serviceFilter, baseStats]
  );

  const selectedSalonName = salons.find((s) => s.id === salonId)?.name ?? stats.salonName;

  const bars = stats.overview[metric];
  const barMax = useMemo(() => Math.max(...bars.map((b) => b.value)), [bars]);
  const leaders = useMemo(() => leaderboards(stats.artists), [stats.artists]);
  const filteredArtists = stats.artists.filter(
    (a) => a.name.toLowerCase().includes(query.toLowerCase()) || a.profession.toLowerCase().includes(query.toLowerCase())
  );
  const filteredServices = stats.services.list;
  const isEmpty = stats.artists.length === 0 && stats.overview.apptsTotal === '0';

  if (loading) {
    return (
      <Screen clearTabBar>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <BackButton />
          <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>{t('sa.title')}</Text>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} style={{ width: '47%', height: 96, borderRadius: 20 }} />
          ))}
        </View>
        <Skeleton style={{ height: 260, borderRadius: 20, marginTop: 16 }} />
        <Skeleton style={{ height: 130, borderRadius: 20, marginTop: 16 }} />
        <Skeleton style={{ height: 130, borderRadius: 20, marginTop: 12 }} />
      </Screen>
    );
  }

  if (isEmpty) {
    return (
      <Screen clearTabBar>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          <BackButton />
          <View>
            <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>{t('sa.title')}</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>{selectedSalonName}</Text>
          </View>
        </View>
        {salons.length > 1 ? (
          <View style={{ marginBottom: 12 }}>
            <FilterDropdown
              label={t('sa.salon')}
              value={selectedSalonName}
              options={salons.map((s) => s.name)}
              onSelect={(name) => setSalonId(salons.find((s) => s.name === name)?.id ?? null)}
            />
          </View>
        ) : null}
        <EmptyState icon="bar-chart-2" title={t('dash.emptyTitle')} subtitle={t('dash.emptySubtitle')} />
      </Screen>
    );
  }

  return (
    <Screen clearTabBar>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <BackButton />
        <View>
          <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>{t('sa.title')}</Text>
          <Text style={{ fontSize: 14, color: theme.textSecondary }}>{selectedSalonName} · {t('sa.subtitle')}</Text>
        </View>
      </View>

      {/* Salon selector — shown only when the owner has more than one salon */}
      {salons.length > 1 ? (
        <View style={{ marginBottom: 12 }}>
          <FilterDropdown
            label={t('sa.salon')}
            value={selectedSalonName}
            options={salons.map((s) => s.name)}
            onSelect={(name) => setSalonId(salons.find((s) => s.name === name)?.id ?? null)}
          />
        </View>
      ) : null}

      {/* Filters (working dropdowns; export/print removed) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} style={{ marginBottom: 18 }}>
        <FilterDropdown
          label={t('sa.dateRange')}
          value={rangeLabel(dateRange)}
          options={RANGE_KEYS.map(rangeLabel)}
          onSelect={(label) => setDateRange(RANGE_KEYS.find((k) => rangeLabel(k) === label) ?? dateRange)}
        />
        <FilterDropdown
          label={t('sa.service')}
          value={serviceFilter === 'All' ? t('common.all') : serviceFilter}
          options={[t('common.all'), ...baseStats.services.list.map((s) => s.name)]}
          onSelect={(v) => setServiceFilter(v === t('common.all') ? 'All' : v)}
        />
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
            <Label>{t('sa.overview')}</Label>
            <Text style={{ fontSize: 30, fontWeight: '800', color: theme.text, marginTop: 4 }}>
              {metric === 'revenue' ? stats.overview.revenueTotal : stats.overview.apptsTotal}
            </Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>{rangeLabel(dateRange)}</Text>
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
                  {m === 'revenue' ? t('sa.revenue') : t('sa.appointments')}
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
            { k: 'Last 7 days', l: t('sa.range7') },
            { k: 'Last 30 days', l: t('sa.range30') },
            { k: 'Last 90 days', l: t('sa.range3mo') },
            { k: 'This year', l: t('sa.range12mo') },
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
        {t('sa.artistPerf')}
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
          placeholder={t('sa.searchArtists')}
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
                { v: `$${(a.revenue / 1000).toFixed(1)}k`, l: t('sa.revenue') },
                { v: `${a.appts}`, l: t('sa.appts') },
                { v: `${a.rating}`, l: t('sa.rating') },
                { v: `${a.occupancy}%`, l: t('sa.occupancy') },
              ].map((s) => (
                <View key={s.l}>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: theme.text }}>{s.v}</Text>
                  <Text style={{ fontSize: 12, color: theme.textSecondary }}>{s.l}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: theme.hairline }}>
              <Text style={{ fontSize: 13, color: theme.textSecondary }}>
                {t('sa.return')} <Text style={{ fontWeight: '700', color: theme.text }}>{a.returnPct}%</Text>
              </Text>
              <View style={{ marginLeft: 14 }}>
                <Delta delta={a.growth} good={a.growth >= 0} />
              </View>
              <Pressable
                onPress={() => router.push({ pathname: '/salon-artist/[id]', params: { id: a.id } })}
                style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 3 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: PURPLE }}>{t('sa.view')}</Text>
                <Feather name="chevron-right" size={16} color={PURPLE} />
              </Pressable>
            </View>
          </Card>
        ))}
      </View>

      {/* Leaderboards */}
      <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.5, color: theme.text, marginTop: 26, marginBottom: 12 }}>
        {t('sa.leaderboards')}
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
      <H2>{t('sa.servicesAnalytics')}</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {[
          { l: t('sa.mostPopular'), v: stats.services.mostPopular.name, s: t('sa.booked', { n: stats.services.mostPopular.booked }) },
          { l: t('sa.topRevenue'), v: stats.services.topRevenue.name, s: stats.services.topRevenue.amount },
          { l: t('sa.avgPrice'), v: stats.services.avgPrice, s: t('sa.perService') },
          { l: t('sa.avgDuration'), v: stats.services.avgDuration, s: t('sa.perAppt') },
        ].map((it) => (
          <Card key={it.l} style={{ width: '47%' }}>
            <Label>{it.l}</Label>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text, marginTop: 6 }}>{it.v}</Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{it.s}</Text>
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
                {s.appts} {t('sa.apptsUnit')} · {s.minutes} min · ★ {s.rating}
              </Text>
            </View>
          );
        })}
      </Card>

      {/* OCCUPANCY BY DAY */}
      <Card style={{ marginTop: 16, gap: 12 }}>
        <Label>{t('sa.occupancyByDay')}</Label>
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
        <Label>{t('sa.timeSlotDemand')}</Label>
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
        <Text style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{t('sa.suggestedSlots')}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {stats.demand.suggested.map((s) => (
            <View key={s} style={{ backgroundColor: theme.bg, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>{s}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* CUSTOMER ANALYTICS */}
      <H2>{t('sa.customerAnalytics')}</H2>
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
      <H2>{t('sa.reviews')}</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {[
          { l: t('sa.avgRating'), v: `★ ${stats.reviews.avg}`, green: false },
          { l: t('sa.fiveStar'), v: stats.reviews.fiveStar, green: false },
          { l: t('sa.negativeReviews'), v: stats.reviews.negative, green: false },
          { l: t('sa.reviewTrend'), v: stats.reviews.trend, green: true },
        ].map((it) => (
          <Card key={it.l} style={{ width: '47%' }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>{it.l}</Text>
            <Text style={{ fontSize: 24, fontWeight: '800', color: it.green ? GREEN : theme.text, marginTop: 6 }}>{it.v}</Text>
          </Card>
        ))}
      </View>
      <Card style={{ marginTop: 14, gap: 12 }}>
        <Label>{t('sa.ratingEvolution')}</Label>
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
      <H2>{t('sa.cancellations')}</H2>
      <Card>
        <Text style={{ fontSize: 14, color: theme.textSecondary }}>{t('sa.cancelRate')}</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: theme.text, marginTop: 6 }}>
          {stats.cancellations.cancelRate.value}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '700', color: GREEN, marginTop: 6 }}>
          ▼ {stats.cancellations.cancelRate.delta}% {t('sa.vsLastMonth')}
        </Text>
      </Card>
      <Card style={{ marginTop: 14, gap: 12 }}>
        <Label>{t('sa.cancByArtist')}</Label>
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
      <H2>{t('sa.financial')}</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 14 }}>
        {stats.financial.map((it) => (
          <Card key={it.label} style={{ width: '47%' }}>
            <Text style={{ fontSize: 14, color: theme.textSecondary }}>{it.label}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 6 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: theme.text }}>{it.value}</Text>
              <View style={{ marginBottom: 4 }}>
                <DeltaInline delta={it.delta} good />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
