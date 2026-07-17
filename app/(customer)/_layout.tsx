import { Tabs } from 'expo-router';
import React from 'react';
import { makeFloatingTabBar } from '../../src/components/FloatingTabBar';

const tabBar = makeFloatingTabBar(
  [
    { name: 'home', label: 'Home', icon: 'home' },
    { name: 'bookings', label: 'Bookings', icon: 'calendar' },
    { name: 'profile', label: 'Profile', icon: 'user' },
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
