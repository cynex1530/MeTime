import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { CitySearchModal } from '../../../src/components/CitySearchModal';
import { ImageSlot } from '../../../src/components/ImageSlot';
import { Segmented } from '../../../src/components/Segmented';
import { Skeleton } from '../../../src/components/Skeleton';
import { Card, GlassBadge, Screen, SectionTitle } from '../../../src/components/ui';
import { useAuth } from '../../../src/hooks/useAuth';
import { useT } from '../../../src/i18n/i18n';
import { fetchCategories, searchSalons } from '../../../src/lib/api';
import { useTheme } from '../../../src/theme/ThemeContext';
import { Category, Salon } from '../../../src/types';

type AudienceTab = 'him' | 'her';

export default function Home() {
  const { theme } = useTheme();
  const { profile, updateProfile } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const [audience, setAudience] = useState<AudienceTab>('him');
  const [cats, setCats] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Salon[]>([]);
  const [showCity, setShowCity] = useState(false);
  const autoLocated = useRef(false);
  const searching = search.trim().length > 0;

  useEffect(() => {
    setCatsLoading(true);
    fetchCategories(audience)
      .then(setCats)
      .finally(() => setCatsLoading(false));
  }, [audience]);

  // Live-filter salons & services as the user types (debounced).
  useEffect(() => {
    const q = search.trim();
    if (!q) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      searchSalons(q).then(setResults);
    }, 150);
    return () => clearTimeout(t);
  }, [search]);

  // If device location is already enabled, show the real city (no prompt).
  useEffect(() => {
    if (autoLocated.current) return;
    autoLocated.current = true;
    (async () => {
      try {
        const { granted } = await Location.getForegroundPermissionsAsync();
        if (!granted) return;
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const [place] = await Location.reverseGeocodeAsync({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        const city = place?.city ?? place?.subregion;
        if (city) updateProfile({ city: place?.region && place.region !== city ? `${city}, ${place.region}` : city });
      } catch {
        // keep the stored / default city
      }
    })();
  }, [updateProfile]);

  return (
    <Screen clearTabBar>
      {/* Location row */}
      <Pressable onPress={() => setShowCity(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Feather name="map-pin" size={15} color={theme.iconMuted} />
        <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textSecondary }}>
          {profile?.city ?? t('home.selectCity')}
        </Text>
        <Feather name="chevron-down" size={14} color={theme.iconMuted} />
      </Pressable>

      <Text style={{ fontSize: 33, fontWeight: '800', letterSpacing: -0.9, color: theme.text, marginTop: 8 }}>
        {t('home.title')}
      </Text>

      {/* Search salons & services + filter button (opens city picker) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: theme.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <Feather name="search" size={18} color={theme.iconMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder={t('home.search')}
            placeholderTextColor={theme.textFaint}
            returnKeyType="search"
            style={{ flex: 1, fontSize: 16, color: theme.text, padding: 0 }}
          />
          {searching ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Feather name="x" size={18} color={theme.iconMuted} />
            </Pressable>
          ) : null}
        </View>
        <Pressable
          onPress={() => setShowCity(true)}
          style={({ pressed }) => ({
            width: 52,
            height: 52,
            borderRadius: 16,
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <Feather name="sliders" size={20} color={theme.iconStroke} />
        </Pressable>
      </View>

      {searching ? (
        <SearchResults results={results} query={search.trim()} />
      ) : (
        <CategoryGrid cats={cats} loading={catsLoading} audience={audience} setAudience={setAudience} />
      )}

      {/* City picker (opened by the location row or the filter button) */}
      <CitySearchModal
        visible={showCity}
        current={profile?.city}
        onClose={() => setShowCity(false)}
        onSelect={(city) => updateProfile({ city })}
      />
    </Screen>
  );
}

function CategoryGrid({
  cats,
  loading,
  audience,
  setAudience,
}: {
  cats: Category[];
  loading: boolean;
  audience: AudienceTab;
  setAudience: (v: AudienceTab) => void;
}) {
  const { theme } = useTheme();
  const { t } = useT();
  const router = useRouter();
  return (
    <>
      {/* For him / For her switch */}
      <View style={{ marginTop: 16 }}>
        <Segmented<AudienceTab>
          options={[
            { value: 'him', label: t('home.forHim') },
            { value: 'her', label: t('home.forHer') },
          ]}
          value={audience}
          onChange={setAudience}
        />
      </View>

      <SectionTitle>{t('home.categories')}</SectionTitle>
      {loading ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} style={{ width: '48.3%', aspectRatio: 1, borderRadius: 20, marginBottom: 12 }} />
          ))}
        </View>
      ) : (
      /* 2-column grid of square tiles */
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {cats.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => router.push({ pathname: '/(customer)/home/salons', params: { catId: c.id, catName: c.name } })}
            style={({ pressed }) => ({ width: '48.3%', marginBottom: 12, opacity: pressed ? 0.9 : 1 })}
          >
            <View style={{ borderRadius: 20, overflow: 'hidden' }}>
              <ImageSlot uri={c.image_url} aspectRatio={1} radius={20} caption={c.name} />
              {/* readability scrim so the white label reads over any photo */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.45)']}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%' }}
                pointerEvents="none"
              />
              {/* ANYONE badge for categories open to everyone */}
              {c.audience === 'both' ? (
                <GlassBadge style={{ position: 'absolute', top: 10, right: 10 }}>{t('home.anyone')}</GlassBadge>
              ) : null}
              {/* Name + nearby count overlaid at the bottom */}
              <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '800',
                    color: '#fff',
                    textShadowColor: 'rgba(0,0,0,0.35)',
                    textShadowRadius: 6,
                  }}
                >
                  {c.name}
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: 'rgba(255,255,255,0.9)',
                    textShadowColor: 'rgba(0,0,0,0.35)',
                    textShadowRadius: 6,
                    marginTop: 1,
                  }}
                >
                  {c.count ?? 0} {t('home.nearby')}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
      )}
    </>
  );
}

function SearchResults({ results, query }: { results: Salon[]; query: string }) {
  const { theme } = useTheme();
  const { t } = useT();
  const router = useRouter();
  return (
    <View style={{ marginTop: 20, gap: 14 }}>
      {results.map((s) => (
        <Card
          key={s.id}
          onPress={() =>
            router.push({
              pathname: '/(customer)/home/artists',
              params: { salonId: s.id, salonName: s.name },
            })
          }
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
            {[s.distance, s.area, ...(s.sub_services ?? [])].filter(Boolean).join(' · ')}
          </Text>
        </Card>
      ))}
      {results.length === 0 ? (
        <Text style={{ color: theme.textSecondary, textAlign: 'center', marginTop: 40 }}>
          {t('home.noResults', { q: query })}
        </Text>
      ) : null}
    </View>
  );
}
