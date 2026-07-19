import React, { useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';

type Series = { id: string; name: string; color: string; points: number[] };

/** Multi-series line chart with a toggleable legend (artist revenue comparison). */
export function MultiLineChart({ series, height = 150 }: { series: Series[]; height?: number }) {
  const { theme } = useTheme();
  const [width, setWidth] = useState(0);
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const visible = series.filter((s) => !hidden.has(s.id));
  const all = series.flatMap((s) => s.points);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const pad = 12;

  const coords = (pts: number[]) =>
    pts.map((v, i) => {
      const x = pts.length > 1 ? (i / (pts.length - 1)) * (width - pad * 2) + pad : width / 2;
      const y = height - pad - (max > min ? (v - min) / (max - min) : 0.5) * (height - pad * 2);
      return { x, y };
    });

  return (
    <View>
      <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            <Line x1={0} y1={pad} x2={width} y2={pad} stroke={theme.hairline} strokeWidth={1} />
            <Line x1={0} y1={height - pad} x2={width} y2={height - pad} stroke={theme.hairline} strokeWidth={1} />
            {visible.map((s) => {
              const c = coords(s.points);
              return (
                <React.Fragment key={s.id}>
                  <Polyline
                    points={c.map((p) => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke={s.color}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Circle cx={c[c.length - 1].x} cy={c[c.length - 1].y} r={4} fill={s.color} />
                </React.Fragment>
              );
            })}
          </Svg>
        ) : (
          <View style={{ height }} />
        )}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {series.map((s) => {
          const on = !hidden.has(s.id);
          return (
            <Pressable
              key={s.id}
              onPress={() =>
                setHidden((prev) => {
                  const next = new Set(prev);
                  next.has(s.id) ? next.delete(s.id) : next.add(s.id);
                  return next;
                })
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1.5,
                borderColor: on ? s.color : theme.hairlineStrong,
                opacity: on ? 1 : 0.5,
              }}
            >
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: on ? s.color : theme.textTertiary }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{s.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
