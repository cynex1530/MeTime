import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Image with a theme-aware empty placeholder — mirrors the prototype's
 * <image-slot>. In dark theme the caption/ring go light per the handoff.
 */
export function ImageSlot({
  uri,
  caption,
  aspectRatio,
  radius = 20,
  style,
}: {
  uri?: string | null;
  caption?: string;
  aspectRatio?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[{ aspectRatio, borderRadius: radius, width: '100%' }, style as any]}
        resizeMode="cover"
      />
    );
  }
  return (
    <View
      style={[
        {
          aspectRatio,
          borderRadius: radius,
          width: '100%',
          backgroundColor: theme.placeholderFill,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: theme.placeholderRing,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        },
        style,
      ]}
    >
      <Feather name="image" size={22} color={theme.placeholderCaption} />
      {caption ? (
        <Text style={{ fontSize: 12, fontWeight: '600', color: theme.placeholderCaption }}>{caption}</Text>
      ) : null}
    </View>
  );
}

/** Circular avatar placeholder (team rows) */
export function AvatarSlot({ uri, size = 52, name }: { uri?: string | null; size?: number; name?: string }) {
  const { theme } = useTheme();
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  const initials = (name ?? '')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: theme.placeholderFill,
        borderWidth: 1.5,
        borderColor: theme.placeholderRing,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size / 3, fontWeight: '700', color: theme.placeholderCaption }}>{initials || '?'}</Text>
    </View>
  );
}
