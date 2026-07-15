import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ImageSlot } from '../../src/components/ImageSlot';
import { BackButton, PrimaryButton, Screen } from '../../src/components/ui';
import { fetchSalonArtists } from '../../src/lib/api';
import { useTheme } from '../../src/theme/ThemeContext';
import { Artist } from '../../src/types';

/**
 * Artist select carousel — portrait 3:4 cards, the selected card grows
 * (195 → 265 wide). Full-screen: tab bar is hidden on this route.
 */
export default function ArtistSelect() {
  const { theme } = useTheme();
  const router = useRouter();
  const { salonId, salonName, catId } = useLocalSearchParams<{
    salonId: string;
    salonName?: string;
    catId?: string;
  }>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!salonId) return;
    fetchSalonArtists(salonId).then((list) => {
      setArtists(list);
      setSelectedId(list[0]?.id ?? null);
    });
  }, [salonId]);

  const selected = artists.find((a) => a.id === selectedId);

  return (
    <Screen scroll={false} padded={false}>
      <View style={{ paddingHorizontal: 20 }}>
        <BackButton />
        <Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>
          Pick your artist
        </Text>
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>{salonName}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 14, alignItems: 'center', paddingVertical: 24 }}
        style={{ flexGrow: 0, marginTop: 12 }}
      >
        {artists.map((a) => {
          const sel = a.id === selectedId;
          return (
            <Pressable key={a.id} onPress={() => setSelectedId(a.id)} style={{ width: sel ? 265 : 195 }}>
              <View>
                <ImageSlot uri={a.photo_url} aspectRatio={3 / 4} radius={20} caption={a.display_name} />
                <View
                  style={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 12,
                    backgroundColor: theme.glassBadgeBg,
                    borderRadius: 14,
                    padding: 10,
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '700', color: theme.glassBadgeText }}>
                    {a.display_name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={{ flex: 1, fontSize: 12, color: 'rgba(60,60,67,0.6)' }}>
                      {a.title} · {a.years_experience} yrs
                    </Text>
                    <Feather name="star" size={11} color="#1c1c1e" />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#1c1c1e', marginLeft: 3 }}>
                      {a.rating.toFixed(1)}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 'auto', marginBottom: 30 }}>
        <PrimaryButton
          floating
          title={selected ? `Continue with ${selected.display_name.split(' ')[0]}` : 'Continue'}
          disabled={!selected}
          onPress={() =>
            router.push({
              pathname: '/(customer)/book',
              params: {
                salonId: salonId ?? '',
                salonName: salonName ?? '',
                artistId: selected?.id ?? '',
                artistName: selected?.display_name ?? '',
                catId: catId ?? '',
              },
            })
          }
        />
      </View>
    </Screen>
  );
}
