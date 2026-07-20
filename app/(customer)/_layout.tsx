import { Tabs } from 'expo-router';
import React from 'react';
import { makeFloatingTabBar } from '../../src/components/FloatingTabBar';

const tabBar = makeFloatingTabBar(
  [
    { name: 'home', labelKey: 'tab.home', icon: 'home' },
    { name: 'bookings', labelKey: 'tab.bookings', icon: 'calendar' },
    { name: 'profile', labelKey: 'tab.profile', icon: 'user' },
  ],
  // immersive nested routes hide the tab bar
  ['artists', 'book', 'success']
);

export default function CustomerLayout() {
  return (
    <Tabs tabBar={tabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
