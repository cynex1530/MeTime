import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ImageSlot } from '../../src/components/ImageSlot';
import { BackButton, Card, GlassBadge, Screen } from '../../src/components/ui';
import { searchSalons } from '../../src/lib/api';
import { useTheme } from '../../src/theme/ThemeContext';
import { Salon } from '../../src/types';

export default function Search() {
  const { theme } = useTheme();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(q ?? '');
  const [results, setResults] = useState<Salon[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      searchSalons(query).then(setResults);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <Screen clearTabBar>
      <BackButton />
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
          marginBottom: 18,
        }}
      >
        <Feather name="search" size={18} color={theme.iconMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search salons & services"
          placeholderTextColor={theme.textFaint}
          autoFocus
          returnKeyType="search"
          style={{ flex: 1, fontSize: 16, color: theme.text, padding: 0 }}
        />
      </View>

      <View style={{ gap: 14 }}>
        {results.map((s) => (
          <Card
            key={s.id}
            onPress={() => router.push({ pathname: '/(customer)/salon/[id]', params: { id: s.id } })}
            style={{ padding: 12 }}
          >
            <View>
              <ImageSlot uri={s.cover_image_url} aspectRatio={16 / 9} radius={14} caption={s.name} />
              {s.tag ? <GlassBadge style={{ position: 'absolute', top: 10, left: 10 }}>{s.tag}</GlassBadge> : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
              <Text style={{ flex: 1, fontSize: 17, fontWeight: '700', color: theme.text }}>{s.name}</Text>
              <Feather name="star" size={14} color={theme.iconStroke} />
              <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text, marginLeft: 4 }}>
                {s.rating.toFixed(1)}
              </Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 3 }}>
              {[s.distance, s.area].filter(Boolean).join(' · ')}
            </Text>
          </Card>
        ))}
        {query.trim().length > 0 && results.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
            No salons or services match “{query.trim()}”.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}
