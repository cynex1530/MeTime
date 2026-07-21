import { Feather } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * A single pulsing placeholder block. Compose several to mimic a card/list row
 * while data loads, so slow networks never show a blank white screen.
 */
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 750, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 750, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const base = theme.isDark ? 'rgba(235,235,245,0.12)' : '#e7e7ec';
  return <Animated.View style={[{ backgroundColor: base, borderRadius: 12, opacity: pulse }, style]} />;
}

/** A card-shaped skeleton row (avatar block + two text lines). */
export function SkeletonCard() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        backgroundColor: theme.card,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        padding: 16,
      }}
    >
      <Skeleton style={{ width: 52, height: 52, borderRadius: 14 }} />
      <View style={{ flex: 1, gap: 8 }}>
        <Skeleton style={{ width: '60%', height: 14, borderRadius: 7 }} />
        <Skeleton style={{ width: '40%', height: 12, borderRadius: 6 }} />
      </View>
    </View>
  );
}

/** N stacked skeleton cards. */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

/** Centered empty-state message with an optional icon. */
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      {icon ? <Feather name={icon} size={38} color={theme.iconMuted} style={{ marginBottom: 12 }} /> : null}
      <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text, textAlign: 'center' }}>{title}</Text>
      {subtitle ? (
        <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: 6 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
