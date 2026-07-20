import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

/** Donut progress ring with a centered value label. */
export function RingProgress({
  pct,
  size = 96,
  stroke = 12,
  color,
  suffix = '%',
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
  suffix?: string;
}) {
  const { theme } = useTheme();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c * (1 - clamped / 100);
  const arc = color ?? theme.text;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.hairlineStrong} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={arc}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute' }}>
        <Text style={{ fontSize: size * 0.22, fontWeight: '800', color: theme.text }}>
          {Math.round(clamped)}
          {suffix}
        </Text>
      </View>
    </View>
  );
}
