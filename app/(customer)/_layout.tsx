import { Tabs } from 'expo-router';
import React from 'react';
import { makeFloatingTabBar } from '../../src/components/FloatingTabBar';

const tabBar = makeFloatingTabBar(
  [
    { name: 'home', label: 'Home', icon: 'home' },
    { name: 'bookings', label: 'Bookings', icon: 'calendar' },
    { name: 'profile', label: 'Profile', icon: 'user' },
  ],
  // immersive routes hide the tab bar
  ['artists', 'book', 'success']
);

export default function CustomerLayout() {
  return (
    <Tabs tabBar={tabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="home" />
      <Tabs.Screen name="bookings" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="search" options={{ href: null }} />
      <Tabs.Screen name="salons" options={{ href: null }} />
      <Tabs.Screen name="salon/[id]" options={{ href: null }} />
      <Tabs.Screen name="artists" options={{ href: null }} />
      <Tabs.Screen name="book" options={{ href: null }} />
      <Tabs.Screen name="success" options={{ href: null }} />
      <Tabs.Screen name="booking/[id]" options={{ href: null }} />
    </Tabs>
  );
}
