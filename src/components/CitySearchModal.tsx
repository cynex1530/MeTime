import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CITIES } from '../lib/sampleData';
import { useTheme } from '../theme/ThemeContext';

/**
 * Full-screen city / area picker (design screenshot 2).
 * - Search a city or area (free text — the typed value can be selected as a
 *   custom city when it doesn't match a suggestion)
 * - Use current location (device GPS → reverse-geocoded city)
 * - Suggestions list, filtered live by the query
 */
export function CitySearchModal({
  visible,
  current,
  onClose,
  onSelect,
}: {
  visible: boolean;
  current?: string;
  onClose: () => void;
  onSelect: (city: string) => void;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [query]);

  // Let the user pick exactly what they typed when nothing matches.
  const typedIsNew =
    query.trim().length > 0 && !CITIES.some((c) => c.toLowerCase() === query.trim().toLowerCase());

  function choose(city: string) {
    onSelect(city);
    setQuery('');
    onClose();
  }

  async function useCurrentLocation() {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocating(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const [place] = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      const city = place?.city ?? place?.subregion ?? place?.region;
      const region = place?.region;
      if (city) {
        choose(region && region !== city ? `${city}, ${region}` : city);
        return;
      }
    } catch {
      // fall through — user can pick manually
    } finally {
      setLocating(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: theme.bg, paddingTop: insets.top + 12, paddingHorizontal: 20 }}>
        {/* Search row + Done */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: theme.card,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: theme.cardBorder,
              paddingHorizontal: 14,
              paddingVertical: 12,
            }}
          >
            <Feather name="search" size={18} color={theme.iconMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search a city or area"
              placeholderTextColor={theme.textFaint}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={() => {
                if (typedIsNew) choose(query.trim());
                else if (filtered[0]) choose(filtered[0]);
              }}
              style={{ flex: 1, fontSize: 16, color: theme.text, padding: 0 }}
            />
          </View>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>Done</Text>
          </Pressable>
        </View>

        {/* Use current location */}
        <Pressable
          onPress={useCurrentLocation}
          disabled={locating}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            backgroundColor: theme.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            paddingHorizontal: 16,
            paddingVertical: 15,
            marginTop: 14,
            opacity: pressed ? 0.85 : 1,
          })}
        >
          {locating ? (
            <ActivityIndicator size="small" color={theme.iconStroke} />
          ) : (
            <Feather name="navigation" size={18} color={theme.iconStroke} />
          )}
          <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>Use current location</Text>
        </Pressable>

        {/* Typed-but-new city */}
        {typedIsNew ? (
          <Pressable
            onPress={() => choose(query.trim())}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingVertical: 16,
              marginTop: 18,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Feather name="plus" size={18} color={theme.iconStroke} />
            <Text style={{ fontSize: 16, color: theme.text }}>
              Use “<Text style={{ fontWeight: '700' }}>{query.trim()}</Text>”
            </Text>
          </Pressable>
        ) : null}

        {/* Suggestions */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.6,
            textTransform: 'uppercase',
            color: theme.textTertiary,
            marginTop: 24,
            marginBottom: 8,
          }}
        >
          Suggestions
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          style={{
            backgroundColor: theme.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.cardBorder,
          }}
        >
          {filtered.map((c, i) => (
            <Pressable
              key={c}
              onPress={() => choose(c)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 16,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.hairline,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 16, color: theme.text }}>{c}</Text>
              {current === c ? <Feather name="check" size={18} color={theme.iconStroke} /> : null}
            </Pressable>
          ))}
          {filtered.length === 0 && !typedIsNew ? (
            <Text style={{ padding: 16, fontSize: 15, color: theme.textSecondary }}>No matches.</Text>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
