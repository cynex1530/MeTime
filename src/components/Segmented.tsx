import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

/**
 * Segmented pill control (Him / Her / Anyone, theme toggle, role picker).
 * Dark theme: active pill #4c4e55 with white text, per the handoff.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.segTrack,
        borderRadius: 999,
        padding: 3,
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: 999,
              alignItems: 'center',
              backgroundColor: active ? theme.segActiveBg : 'transparent',
              shadowColor: theme.shadow,
              shadowOpacity: active ? (theme.isDark ? 0.4 : 0.12) : 0,
              shadowRadius: 6,
              shadowOffset: { width: 0, height: 2 },
              elevation: active ? 3 : 0,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: active ? theme.segActiveText : theme.segInactiveText,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
