import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ImageSlot } from '../../../src/components/ImageSlot';
import { BackButton, GlassBadge, PrimaryButton, Screen, SectionTitle } from '../../../src/components/ui';
import { fetchSalon, fetchSalonArtists } from '../../../src/lib/api';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Artist, Salon } from '../../../src/types';
import { AvatarSlot } from '../../../src/components/ImageSlot';

export default function SalonDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id, catId } = useLocalSearchParams<{ id: string; catId?: string }>();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    if (!id) return;
    fetchSalon(id).then(setSalon);
    fetchSalonArtists(id).then(setArtists);
  }, [id]);

  if (!salon) return <Screen scroll={false} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <Screen clearTabBar>
        <BackButton />
        <View>
          <ImageSlot uri={salon.cover_image_url} aspectRatio={16 / 10} radius={20} caption={salon.name} />
          {salon.tag ? <GlassBadge style={{ position: 'absolute', top: 12, left: 12 }}>{salon.tag}</GlassBadge> : null}
        </View>

        <Text style={{ fontSize: 28, fontWeight: '800', letterSpacing: -0.7, color: theme.text, marginTop: 18 }}>
          {salon.name}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 6 }}>
          <Feather name="star" size={14} color={theme.iconStroke} />
          <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>{salon.rating.toFixed(1)}</Text>
          <Text style={{ fontSize: 14, color: theme.textTertiary }}>
            ({salon.reviews_count}) · {[salon.distance, salon.area].filter(Boolean).join(' · ')}
          </Text>
        </View>
        <Text style={{ fontSize: 15, lineHeight: 22, color: theme.textSecondary, marginTop: 12 }}>
          {salon.description}
        </Text>

        <SectionTitle>Artists</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          {artists.slice(0, 4).map((a) => (
            <View key={a.id} style={{ alignItems: 'center', gap: 6 }}>
              <AvatarSlot uri={a.photo_url} size={56} name={a.display_name} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.textSecondary }}>
                {a.display_name.split(' ')[0]}
              </Text>
            </View>
          ))}
        </View>
      </Screen>

      {/* Floating Book now CTA */}
      <View style={{ position: 'absolute', left: 20, right: 20, bottom: 110 }}>
        <PrimaryButton
          floating
          title="Book now"
          onPress={() =>
            router.push({
              pathname: '/(customer)/artists',
              params: { salonId: salon.id, salonName: salon.name, catId: catId ?? '' },
            })
          }
        />
      </View>
    </View>
  );
}
