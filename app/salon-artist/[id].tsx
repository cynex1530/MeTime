import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { RingProgress } from '../../src/components/RingProgress';
import { Card, Screen } from '../../src/components/ui';
import { buildArtistDetail, SALON_DEMO } from '../../src/lib/salonStats';
import { useTheme } from '../../src/theme/ThemeContext';

const GREEN = '#42B883';

function hexToRgba(hex: string, a: number) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function SalonArtistDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const a = SALON_DEMO.artists.find((x) => x.id === id) ?? SALON_DEMO.artists[0];
  const d = useMemo(() => buildArtistDetail(a), [a]);

  const tiles = [
    { v: `$${(a.revenue / 1000).toFixed(1)}k`, l: 'Revenue' },
    { v: `${a.appts}`, l: 'Appointments' },
    { v: `${d.customers}`, l: 'Customers' },
    { v: `★ ${a.rating.toFixed(1)}`, l: 'Avg rating' },
    { v: `${a.returnPct}%`, l: 'Returning' },
    { v: `${a.occupancy}%`, l: 'Occupancy' },
    { v: `${a.noShow}%`, l: 'No-show' },
    { v: `+${a.growth}%`, l: 'Growth' },
  ];

  const revMax = Math.max(...d.revenue6mo.map((x) => x.value));
  const apptMax = Math.max(...d.appts6mo.map((x) => x.value));
  const popMax = Math.max(...d.popular.map((x) => x.booked));

  return (
    <Screen clearTabBar topInset={false}>
      {/* Close (modal-style) */}
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        style={({ pressed }) => ({
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.8 : 1,
          marginBottom: 16,
        })}
      >
        <Feather name="x" size={20} color={theme.iconStroke} />
      </Pressable>

      {/* Identity */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: a.color, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '800' }}>{a.initials}</Text>
        </View>
        <View>
          <Text style={{ fontSize: 26, fontWeight: '800', letterSpacing: -0.7, color: theme.text }}>{a.name}</Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary, marginTop: 2 }}>{a.profession}</Text>
          <View style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: 'rgba(48,164,108,0.16)', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}>
            <Text style={{ color: '#1f8a4c', fontSize: 13, fontWeight: '700' }}>{a.badge}</Text>
          </View>
        </View>
      </View>

      {/* Stat grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
        {tiles.map((t) => (
          <View key={t.l} style={{ width: '47%', backgroundColor: theme.bg, borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: theme.text }}>{t.v}</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{t.l}</Text>
          </View>
        ))}
      </View>

      {/* Performance score */}
      <Card style={{ marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <RingProgress pct={d.score} color={GREEN} suffix="" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary }}>PERFORMANCE SCORE</Text>
          <Text style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 21, marginTop: 6 }}>
            Weighted from rating, occupancy and returning-customer rate.
          </Text>
        </View>
      </Card>

      {/* Revenue (6 mo) */}
      <Card style={{ marginTop: 16, gap: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary }}>REVENUE (6 MO)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {d.revenue6mo.map((m, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: theme.textTertiary, fontWeight: '600' }}>
              ${m.value}k
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 8 }}>
          {d.revenue6mo.map((m, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ width: '100%', height: Math.max(12, (m.value / revMax) * 96), backgroundColor: a.color, borderRadius: 10 }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {d.revenue6mo.map((m, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>
              {m.label}
            </Text>
          ))}
        </View>
      </Card>

      {/* Appointments (6 mo) */}
      <Card style={{ marginTop: 16, gap: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary }}>APPOINTMENTS (6 MO)</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {d.appts6mo.map((m, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: theme.textTertiary, fontWeight: '600' }}>
              {m.value}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 110, gap: 10 }}>
          {d.appts6mo.map((m, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
              <View style={{ width: '100%', height: Math.max(12, (m.value / apptMax) * 96), backgroundColor: theme.bg, borderRadius: 10 }} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {d.appts6mo.map((m, i) => (
            <Text key={i} style={{ flex: 1, textAlign: 'center', fontSize: 13, color: theme.textSecondary, fontWeight: '600' }}>
              {m.label}
            </Text>
          ))}
        </View>
      </Card>

      {/* Popular services */}
      <Card style={{ marginTop: 16, gap: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary }}>POPULAR SERVICES</Text>
        {d.popular.map((s) => (
          <View key={s.name} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{s.name}</Text>
              <Text style={{ fontSize: 14, color: theme.textSecondary }}>{s.booked} booked</Text>
            </View>
            <View style={{ height: 8, borderRadius: 999, backgroundColor: theme.bg, overflow: 'hidden' }}>
              <View style={{ width: `${(s.booked / popMax) * 100}%`, height: '100%', backgroundColor: a.color, borderRadius: 999 }} />
            </View>
          </View>
        ))}
      </Card>

      {/* Booking heatmap */}
      <Card style={{ marginTop: 16, gap: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary, marginBottom: 4 }}>
          BOOKING HEATMAP
        </Text>
        {d.heatmap.map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', gap: 8 }}>
            {row.map((c, i) => (
              <View key={i} style={{ flex: 1, aspectRatio: 1, borderRadius: 8, backgroundColor: hexToRgba(a.color, Math.max(0.12, c)) }} />
            ))}
          </View>
        ))}
      </Card>

      {/* Recent reviews */}
      <Card style={{ marginTop: 16, gap: 4 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', letterSpacing: 0.8, color: theme.textTertiary, marginBottom: 8 }}>
          RECENT REVIEWS
        </Text>
        {d.reviews.map((rv, i) => (
          <View key={i} style={{ paddingVertical: 12, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: theme.hairline }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: theme.text }}>{rv.name}</Text>
              <Text style={{ fontSize: 14, color: '#E8A94B', letterSpacing: 1 }}>{'★'.repeat(rv.stars)}</Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 3 }}>{rv.text}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
