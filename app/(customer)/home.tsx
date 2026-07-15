import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ImageSlot } from '../../src/components/ImageSlot';
import { Segmented } from '../../src/components/Segmented';
import { Sheet } from '../../src/components/Sheet';
import { GlassBadge, Screen, SectionTitle } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { fetchCategories } from '../../src/lib/api';
import { CITIES } from '../../src/lib/sampleData';
import { useTheme } from '../../src/theme/ThemeContext';
import { Category } from '../../src/types';

type AudienceTab = 'him' | 'her' | 'anyone';

export default function Home() {
  const { theme } = useTheme();
  const { profile, updateProfile } = useAuth();
  const router = useRouter();
  const [audience, setAudience] = useState<AudienceTab>('him');
  const [cats, setCats] = useState<Category[]>([]);
  const [showCity, setShowCity] = useState(false);

  useEffect(() => {
    fetchCategories(audience).then(setCats);
  }, [audience]);

  return (
    <Screen clearTabBar>
      {/* Location row */}
      <Pressable onPress={() => setShowCity(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Feather name="map-pin" size={15} color={theme.iconMuted} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary }}>
          {profile?.city ?? 'San Francisco, CA'}
        </Text>
        <Feather name="chevron-down" size={14} color={theme.iconMuted} />
      </Pressable>

      <Text
        style={{ fontSize: 33, fontWeight: '800', letterSpacing: -0.9, color: theme.text, marginTop: 10 }}
      >
        Book your next{'\n'}me time
      </Text>

      <View style={{ marginTop: 18 }}>
        <Segmented<AudienceTab>
          options={[
            { value: 'him', label: 'Him' },
            { value: 'her', label: 'Her' },
            { value: 'anyone', label: 'Anyone' },
          ]}
          value={audience}
          onChange={setAudience}
        />
      </View>

      <SectionTitle>Categories</SectionTitle>
      {/* 2-column grid of square tiles */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {cats.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/(customer)/salons', params: { catId: c.id, catName: c.name } })}
            style={({ pressed }) => ({ width: '48.3%', marginBottom: 12, opacity: pressed ? 0.9 : 1 })}
          >
            <View>
              <ImageSlot uri={c.image_url} aspectRatio={1} radius={20} caption={c.name} />
              <View style={{ position: 'absolute', left: 10, bottom: 10, right: 10 }}>
                <GlassBadge style={{ alignSelf: 'flex-start' }}>
                  {c.name} · {c.count ?? 0}
                </GlassBadge>
              </View>
            </View>
          </Pressable>
        ))}
      </View>

      {/* City picker sheet */}
      <Sheet visible={showCity} onClose={() => setShowCity(false)}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 10 }}>Your city</Text>
        {CITIES.map((c, i) => (
          <Pressable
            key={c}
            onPress={() => {
              updateProfile({ city: c });
              setShowCity(false);
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingVertical: 14,
              borderTopWidth: i === 0 ? 0 : 1,
              borderTopColor: theme.hairline,
            }}
          >
            <Text style={{ fontSize: 16, color: theme.text }}>{c}</Text>
            {profile?.city === c ? <Feather name="check" size={18} color={theme.iconStroke} /> : null}
          </Pressable>
        ))}
      </Sheet>
    </Screen>
  );
}
