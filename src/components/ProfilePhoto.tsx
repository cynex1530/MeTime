import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { uploadImage } from '../lib/upload';
import { useTheme } from '../theme/ThemeContext';

type Shape = 'circle' | 'portrait' | 'banner';

/**
 * Photo control used for avatars, discovery photos and location banners.
 * - empty  → dashed container with a "+" button; tapping requests photo-library
 *   permission (remembered by the OS) and opens the picker
 * - filled → a small "Replace" pill and a Delete button inside the top-right
 *   corner of the photo
 */
export function ProfilePhoto({
  uri,
  userId,
  onChange,
  shape = 'circle',
  size = 120,
  caption = 'Add photo',
  showReplace = true,
}: {
  uri?: string | null;
  userId: string;
  onChange: (uri: string | null) => void;
  shape?: Shape;
  size?: number;
  caption?: string;
  showReplace?: boolean;
}) {
  const { theme } = useTheme();
  const [busy, setBusy] = useState(false);

  // Box + corner radius per shape. Banner fills the available width.
  const box: StyleProp<ViewStyle> =
    shape === 'banner'
      ? { width: '100%', aspectRatio: 16 / 9, borderRadius: 16 }
      : shape === 'portrait'
        ? { width: size, height: Math.round(size * (4 / 3)), borderRadius: 20 }
        : { width: size, height: size, borderRadius: size / 2 };
  const radius = shape === 'banner' ? 16 : shape === 'portrait' ? 20 : size / 2;

  async function pick() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow Me Time to access your photos to set an image. You can enable it in Settings.',
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
      aspect: shape === 'banner' ? [16, 9] : shape === 'portrait' ? [3, 4] : [1, 1],
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
    Alert.alert('Remove photo?', 'This image will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onChange(null) },
    ]);
  }

  return (
    <View style={box}>
      {uri ? (
        <>
          <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: radius }} />
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
          {/* Controls inside the top-right corner: Replace pill + Delete */}
          <View style={{ position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {showReplace ? (
              <Pressable
                onPress={pick}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 10,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <Feather name="refresh-cw" size={13} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Replace</Text>
              </Pressable>
            ) : null}
            <Pressable
              onPress={confirmRemove}
              style={({ pressed }) => ({
                width: 30,
                height: 30,
                borderRadius: 10,
                backgroundColor: theme.destructive,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Feather name="trash-2" size={15} color="#fff" />
            </Pressable>
          </View>
        </>
      ) : (
        <Pressable
          onPress={pick}
          style={{
            width: '100%',
            height: '100%',
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
