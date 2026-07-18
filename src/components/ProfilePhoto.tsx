import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, Text, View } from 'react-native';
import { uploadImage } from '../lib/upload';
import { useTheme } from '../theme/ThemeContext';

/**
 * Profile photo control:
 * - empty  → dashed container with a "+" button; tapping requests photo-library
 *   permission (remembered by the OS) and opens the picker
 * - filled → the photo with a Replace and a Delete button at the top-right
 */
export function ProfilePhoto({
  uri,
  userId,
  onChange,
  shape = 'circle',
  size = 120,
  caption = 'Add photo',
}: {
  uri?: string | null;
  userId: string;
  onChange: (uri: string | null) => void;
  shape?: 'circle' | 'portrait';
  size?: number;
  caption?: string;
}) {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);

  const width = size;
  const height = shape === 'portrait' ? Math.round(size * (4 / 3)) : size;
  const radius = shape === 'circle' ? size / 2 : 20;

  async function pick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow Me Time to access your photos to set a picture. You can enable it in Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: shape === 'portrait' ? [3, 4] : [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;

    const localUri = result.assets[0].uri;
    setBusy(true);
    onChange(localUri); // show immediately
    const uploaded = await uploadImage(localUri, userId); // best-effort remote copy
    if (uploaded) onChange(uploaded);
    setBusy(false);
  }

  function confirmRemove() {
    Alert.alert('Remove photo?', 'Your profile picture will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
    ]);
  }

  const circleBtn = (icon: keyof typeof Feather.glyphMap, bg: string, fg: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.bg,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Feather name={icon} size={16} color={fg} />
    </Pressable>
  );

  return (
    <View style={{ width, height }}>
      {uri ? (
        <>
          <Image source={{ uri }} style={{ width, height, borderRadius: radius }} />
          {busy ? (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: radius,
                backgroundColor: 'rgba(0,0,0,0.35)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator color="#fff" />
            </View>
          ) : null}
          {/* Replace (left) + Delete (right) at the top-right of the container */}
          <View style={{ position: 'absolute', top: -8, right: -8, flexDirection: 'row', gap: 8 }}>
            {circleBtn('refresh-cw', theme.inkSurface, theme.onInk, pick)}
            {circleBtn('trash-2', theme.destructive, '#fff', confirmRemove)}
          </View>
        </>
      ) : (
        <Pressable
          onPress={pick}
          style={{
            width,
            height,
            borderRadius: radius,
            backgroundColor: theme.placeholderFill,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: theme.placeholderRing,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {busy ? (
            <ActivityIndicator color={theme.placeholderCaption} />
          ) : (
            <>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.inkSurface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="plus" size={22} color={theme.onInk} />
              </View>
              <Text style={{ fontSize: 12, fontWeight: '600', color: theme.placeholderCaption }}>{caption}</Text>
            </>
          )}
        </Pressable>
      )}
    </View>
  );
}
