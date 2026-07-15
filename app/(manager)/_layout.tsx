import { Tabs } from 'expo-router';
import React from 'react';
import { makeFloatingTabBar } from '../../src/components/FloatingTabBar';

/** Manager = worker tabs plus Locations and Team; starts on Locations. */
const tabBar = makeFloatingTabBar([
  { name: 'locations', label: 'Locations', icon: 'map-pin' },
  { name: 'team', label: 'Team', icon: 'users' },
  { name: 'schedule', label: 'Bookings', icon: 'calendar' },
  { name: 'services', label: 'Services', icon: 'scissors' },
  { name: 'profile', label: 'Profile', icon: 'user' },
]);

export default function ManagerLayout() {
  return (
    <Tabs tabBar={tabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="locations" />
      <Tabs.Screen name="team" />
      <Tabs.Screen name="schedule" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
