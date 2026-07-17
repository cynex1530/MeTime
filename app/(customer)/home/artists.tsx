import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, Text, View } from 'react-native';
import { ImageSlot } from '../../../src/components/ImageSlot';
import { BackButton, PrimaryButton, Screen } from '../../../src/components/ui';
import { fetchSalonArtists } from '../../../src/lib/api';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Artist } from '../../../src/types';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = Math.min(280, SCREEN_W * 0.7);
const GAP = 16;
const INTERVAL = CARD_W + GAP;
const SIDE_PAD = (SCREEN_W - CARD_W) / 2;

/**
 * "Choose a pro" — a centered, snapping carousel of portrait 3:4 artist cards.
 * Swiping changes the selection; the name updates below and the CTA reads
 * "Book <name>". Immersive: the tab bar is hidden on this route.
 */
export default function ArtistSelect() {
  const { theme } = useTheme();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { salonId, salonName, catId } = useLocalSearchParams<{
    salonId: string;
    salonName?: string;
    catId?: string;
  }>();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!salonId) return;
    fetchSalonArtists(salonId).then(setArtists);
  }, [salonId]);

  const selected = artists[index];

  // Auto-select the centered artist as the user swipes — no tap required.
  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / INTERVAL);
    const clamped = Math.max(0, Math.min(i, artists.length - 1));
    setIndex((prev) => (prev === clamped ? prev : clamped));
  }

  function centerOn(i: number) {
    scrollRef.current?.scrollTo({ x: i * INTERVAL, animated: true });
    setIndex(i);
  }

  return (
    <Screen scroll={false} padded={false}>
      {/* Header: back + title + salon name */}
      <View style={{ paddingHorizontal: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
        <BackButton />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', letterSpacing: -0.8, color: theme.text }}>
            Choose a pro
          </Text>
          {salonName ? (
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>{salonName}</Text>
          ) : null}
        </View>
      </View>

      {/* Carousel */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={INTERVAL}
          decelerationRate="fast"
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: SIDE_PAD, gap: GAP, alignItems: 'center' }}
        >
          {artists.map((a, i) => {
            const active = i === index;
            return (
              <Pressable key={a.id} onPress={() => centerOn(i)} style={{ width: CARD_W }}>
                <View
                  style={{
                    opacity: active ? 1 : 0.5,
                    transform: [{ scale: active ? 1 : 0.92 }],
                  }}
                >
                  <ImageSlot uri={a.photo_url} aspectRatio={3 / 4} radius={24} caption={a.display_name} />
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Selected name (rating & experience intentionally omitted here) */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', letterSpacing: -0.4, color: theme.text }}>
            {selected?.display_name ?? ''}
          </Text>
        </View>
      </View>

      {/* Swipe hint + Book CTA */}
      <View style={{ paddingHorizontal: 20, marginBottom: 30 }}>
        <Text style={{ textAlign: 'center', fontSize: 13, color: theme.textFaint, marginBottom: 14 }}>
          Swipe to change
        </Text>
        <PrimaryButton
          floating
          title={selected ? `Book ${selected.display_name}` : 'Book'}
          disabled={!selected}
          onPress={() =>
            router.push({
              pathname: '/(customer)/home/book',
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
