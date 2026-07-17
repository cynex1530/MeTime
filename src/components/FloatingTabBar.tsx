import { Feather } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export type TabSpec = {
  name: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

/**
 * Floating frosted tab bar. Active icons are bolder + full-contrast in both
 * themes (Light #1c1c1e / Dark #f2f2f7); inactive are muted, per the handoff.
 * Renders nothing on immersive routes (artist carousel, booking form, success).
 */
function FloatingTabBar({
  tabs,
  hiddenRoutes,
  state,
  navigation,
}: BottomTabBarProps & { tabs: TabSpec[]; hiddenRoutes: string[] }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const currentRoute = state.routes[state.index]?.name ?? '';
  if (hiddenRoutes.some((r) => currentRoute.startsWith(r))) return null;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: Math.max(insets.bottom, 12) + 6,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: theme.tabBarBg,
          borderRadius: 30,
          borderWidth: 1,
          borderColor: theme.hairline,
          paddingVertical: 10,
          shadowColor: theme.shadow,
          shadowOpacity: 0.12,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}
      >
        {tabs.map((tab) => {
          const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
          const focused = state.index === routeIndex;
          return (
            <Pressable
              key={tab.name}
              onPress={() => navigation.navigate(tab.name as never)}
              style={{ flex: 1, alignItems: 'center', gap: 3 }}
            >
              <Feather
                name={tab.icon}
                size={22}
                color={focused ? theme.tabActive : theme.tabInactive}
                style={{ opacity: focused ? 1 : 0.95 }}
              />
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: focused ? theme.tabActive : theme.tabInactive,
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/**
 * React Navigation invokes the `tabBar` prop as a plain function, so it must
 * return an element (hooks live inside the FloatingTabBar component above),
 * never call hooks itself.
 */
export function makeFloatingTabBar(tabs: TabSpec[], hiddenRoutes: string[] = []) {
  return (props: BottomTabBarProps) => (
    <FloatingTabBar {...props} tabs={tabs} hiddenRoutes={hiddenRoutes} />
  );
}
