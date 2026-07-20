/**
 * Core UI building blocks styled from the design tokens:
 * Screen, PrimaryButton, Card, Field, SectionTitle, ScreenTitle, BackButton,
 * GlassBadge, Grabber.
 */
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { layout, radii } from '../theme/tokens';

export function Screen({
  children,
  scroll = true,
  padded = true,
  clearTabBar = false,
  topInset = true,
  style,
}: {
  children?: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  clearTabBar?: boolean;
  topInset?: boolean; // false for modals, which already clear the status bar
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const base: ViewStyle = {
    flex: 1,
    backgroundColor: theme.bg,
  };
  const content: ViewStyle = {
    paddingTop: topInset ? insets.top + 12 : 16,
    paddingHorizontal: padded ? layout.gutter : 0,
    paddingBottom: clearTabBar ? layout.tabBarClearance : insets.bottom + 24,
  };
  if (!scroll) {
    return <View style={[base, content, style]}>{children}</View>;
  }
  return (
    <View style={base}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[content, style]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function ScreenTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{ fontSize: 33, fontWeight: '800', letterSpacing: -0.9, color: theme.text }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        { fontSize: 20, fontWeight: '700', letterSpacing: -0.4, color: theme.text, marginTop: 26, marginBottom: 12 },
        style as any,
      ]}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
  destructive,
  floating,
  style,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
  floating?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: destructive ? theme.destructive : theme.inkSurface,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
          borderRadius: radii.button + 2,
          paddingVertical: 17,
          alignItems: 'center',
          justifyContent: 'center',
        },
        floating && {
          shadowColor: theme.shadow,
          shadowOpacity: 0.28,
          shadowRadius: 30,
          shadowOffset: { width: 0, height: 10 },
          elevation: 10,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={theme.onInk} />
      ) : (
        <Text style={{ color: theme.onInk, fontSize: 16, fontWeight: '700' }}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const { theme } = useTheme();
  const inner: ViewStyle = {
    backgroundColor: theme.card,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: theme.cardBorder,
    padding: layout.cardPad,
    shadowColor: theme.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [inner, { opacity: pressed ? 0.9 : 1 }, style]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[inner, style]}>{children}</View>;
}

export function Field({
  label,
  rightIcon,
  onRightIconPress,
  style,
  ...inputProps
}: TextInputProps & {
  label: string;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: radii.card,
          borderWidth: 1,
          borderColor: theme.cardBorder,
          paddingHorizontal: 16,
          paddingVertical: 12,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          color: theme.textTertiary,
          marginBottom: 4,
        }}
      >
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TextInput
          {...inputProps}
          placeholderTextColor={theme.textFaint}
          style={{ flex: 1, fontSize: 16, color: theme.text, padding: 0 }}
        />
        {rightIcon ? (
          <Pressable onPress={onRightIconPress} hitSlop={10}>
            <Feather name={rightIcon} size={20} color={theme.iconMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function BackButton({ onPress }: { onPress?: () => void }) {
  const { theme } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      hitSlop={8}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
        marginBottom: 16,
      })}
    >
      <Feather name="chevron-left" size={22} color={theme.iconStroke} />
    </Pressable>
  );
}

/** White-glass badge over photos — text stays dark in both themes */
export function GlassBadge({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.glassBadgeBg,
          borderRadius: radii.chip,
          paddingHorizontal: 10,
          paddingVertical: 4,
        },
        style,
      ]}
    >
      <Text style={{ color: theme.glassBadgeText, fontSize: 12, fontWeight: '700' }}>{children}</Text>
    </View>
  );
}

export function Grabber() {
  const { theme } = useTheme();
  return (
    <View
      style={{
        alignSelf: 'center',
        width: 40,
        height: 5,
        borderRadius: 3,
        backgroundColor: theme.grabber,
        marginBottom: 14,
      }}
    />
  );
}

export function Chip({
  label,
  selected,
  onPress,
  style,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          borderRadius: radii.chip,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderWidth: 1.5,
          borderColor: selected ? theme.text : theme.hairlineStrong,
          backgroundColor: selected ? theme.inkSurface : 'transparent',
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text style={{ fontSize: 14, fontWeight: '600', color: selected ? theme.onInk : theme.textSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}
