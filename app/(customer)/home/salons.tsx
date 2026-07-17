import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ImageSlot } from '../../../src/components/ImageSlot';
import { BackButton, Card, GlassBadge, Screen, ScreenTitle } from '../../../src/components/ui';
import { fetchSalons } from '../../../src/lib/api';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Salon } from '../../../src/types';

export default function SalonList() {
  const { theme } = useTheme();
  const router = useRouter();
  const { catId, catName } = useLocalSearchParams<{ catId: string; catName?: string }>();
  const [salons, setSalons] = useState<Salon[]>([]);

  useEffect(() => {
    if (catId) fetchSalons(catId).then(setSalons);
  }, [catId]);

  return (
    <Screen clearTabBar>
      <BackButton />
      <ScreenTitle title={catName ?? 'Salons'} subtitle={`${salons.length} places near you`} />
      <View style={{ gap: 14 }}>
        {salons.map((s) => (
          <Card
            key={s.id}
            onPress={() =>
              // Selecting a salon goes straight to the artist carousel
              router.push({
                pathname: '/(customer)/home/artists',
                params: { salonId: s.id, salonName: s.name, catId: catId ?? '' },
              })
            }
            style={{ padding: 12 }}
          >
            <View>
              <ImageSlot uri={s.cover_image_url} aspectRatio={16 / 9} radius={14} caption={s.name} />
              {s.tag ? (
                <GlassBadge style={{ position: 'absolute', top: 10, left: 10 }}>{s.tag}</GlassBadge>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: theme.text }}>{s.name}</Text>
              <Feather name="star" size={14} color={theme.iconStroke} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginLeft: 4 }}>
                {s.rating.toFixed(1)}
              </Text>
              <Text style={{ fontSize: 13, color: theme.textTertiary, marginLeft: 4 }}>({s.reviews_count})</Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 3 }}>
              {[s.distance, s.area].filter(Boolean).join(' · ')}
            </Text>
          </Card>
        ))}
        {salons.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No salons in this category yet.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
