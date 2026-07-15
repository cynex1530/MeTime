import { Tabs } from 'expo-router';
import React from 'react';
import { makeFloatingTabBar } from '../../src/components/FloatingTabBar';

const tabBar = makeFloatingTabBar([
  { name: 'schedule', label: 'Bookings', icon: 'calendar' },
  { name: 'services', label: 'Services', icon: 'scissors' },
  { name: 'profile', label: 'Profile', icon: 'user' },
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
