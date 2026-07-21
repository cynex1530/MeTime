import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, View } from 'react-native';
import { AvatarSlot } from '../../src/components/ImageSlot';
import { ConfirmDialog } from '../../src/components/Sheet';
import { EmptyState, SkeletonList } from '../../src/components/Skeleton';
import { SwipeRow } from '../../src/components/SwipeRow';
import { Card, Screen, ScreenTitle } from '../../src/components/ui';
import { useAuth } from '../../src/hooks/useAuth';
import { useT } from '../../src/i18n/i18n';
import { fetchFavorites, FavoriteArtist, removeFavorite } from '../../src/lib/api';
import { useTheme } from '../../src/theme/ThemeContext';

export default function Favorites() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const { t } = useT();
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeId, setRemoveId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!profile) return;
      setLoading(true);
      fetchFavorites(profile.id)
        .then(setFavorites)
        .finally(() => setLoading(false));
    }, [profile])
  );

  // Tapping a favorite jumps straight to the booking form (service + time).
  function book(fav: FavoriteArtist) {
    router.push({
      pathname: '/(customer)/home/book',
      params: {
        salonId: fav.salon_id ?? '',
        salonName: fav.salon_name ?? '',
        artistId: fav.id,
        artistName: fav.display_name,
        catId: '',
      },
    });
  }

  return (
    <Screen clearTabBar>
      <ScreenTitle title={t('favorites.title')} subtitle={t('favorites.subtitle')} />

      {loading ? (
        <SkeletonList count={4} />
      ) : favorites.length === 0 ? (
        <EmptyState icon="heart" title={t('favorites.empty')} />
      ) : (
        <View style={{ gap: 12 }}>
          {favorites.map((fav) => (
            <SwipeRow key={fav.id} onPress={() => book(fav)} onDelete={() => setRemoveId(fav.id)}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <AvatarSlot uri={fav.photo_url} size={52} name={fav.display_name} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{fav.display_name}</Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 2 }}>
                    {[fav.title, fav.salon_name].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={theme.iconMuted} />
              </Card>
            </SwipeRow>
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={removeId !== null}
        title={t('favorites.removeTitle')}
        message={favorites.find((f) => f.id === removeId)?.display_name ?? ''}
        confirmLabel={t('common.remove')}
        onCancel={() => setRemoveId(null)}
        onConfirm={async () => {
          const id = removeId;
          setRemoveId(null);
          if (id && profile) {
            await removeFavorite(profile.id, id);
            setFavorites((list) => list.filter((f) => f.id !== id));
          }
        }}
      />
    </Screen>
  );
}
