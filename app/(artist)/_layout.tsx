import { Tabs } from 'expo-router';
import React from 'react';
import { makeFloatingTabBar } from '../../src/components/FloatingTabBar';

const tabBar = makeFloatingTabBar([
  { name: 'schedule', labelKey: 'tab.bookings', icon: 'calendar' },
  { name: 'services', labelKey: 'tab.services', icon: 'scissors' },
  { name: 'profile', labelKey: 'tab.profile', icon: 'user' },
]);

export default function ArtistLayout() {
  return (
    <Tabs tabBar={tabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
