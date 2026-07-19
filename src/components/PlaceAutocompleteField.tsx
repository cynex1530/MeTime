import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { placeDetails, PlaceSuggestion, searchPlaces } from '../lib/places';
import { useTheme } from '../theme/ThemeContext';
import { Field } from './ui';

/**
 * Address field with Google Places autocomplete. As the user types, real
 * place suggestions appear; picking one fills the address and reports its
 * coordinates. Falls back to a plain text field when Places isn't configured.
 */
export function PlaceAutocompleteField({
  label,
  value,
  placeholder,
  onChangeText,
  onSelect,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (v: string) => void;
  onSelect: (address: string, lat: number | null, lng: number | null) => void;
}) {
  const { theme } = useTheme();
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const justPicked = useRef(false);

  useEffect(() => {
    if (justPicked.current) {
      justPicked.current = false;
      return;
    }
    const q = value.trim();
    if (q.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await searchPlaces(q);
      setSuggestions(res);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [value]);

  async function pick(s: PlaceSuggestion) {
    justPicked.current = true;
    onChangeText(s.primary);
    setSuggestions([]);
    const details = await placeDetails(s.placeId);
    onSelect(details?.address || s.full, details?.lat ?? null, details?.lng ?? null);
  }

  return (
    <View>
      <Field
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        rightIcon={loading ? undefined : 'map-pin'}
      />
      {loading ? (
        <View style={{ position: 'absolute', right: 16, top: 16 }}>
          <ActivityIndicator size="small" color={theme.iconMuted} />
        </View>
      ) : null}
      {suggestions.length > 0 ? (
        <View
          style={{
            marginTop: 6,
            backgroundColor: theme.card,
            borderRadius: 14,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            overflow: 'hidden',
          }}
        >
          {suggestions.map((s, i) => (
            <Pressable
              key={s.placeId}
              onPress={() => pick(s)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: theme.hairline,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Feather name="map-pin" size={15} color={theme.iconMuted} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{s.primary}</Text>
                {s.secondary ? (
                  <Text style={{ fontSize: 13, color: theme.textSecondary }}>{s.secondary}</Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
