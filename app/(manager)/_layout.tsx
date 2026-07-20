import { Tabs } from 'expo-router';
import React from 'react';
import { makeFloatingTabBar } from '../../src/components/FloatingTabBar';

/** Manager = worker tabs plus Locations and Team; starts on Locations. */
const tabBar = makeFloatingTabBar([
  { name: 'locations', labelKey: 'tab.locations', icon: 'map-pin' },
  { name: 'team', labelKey: 'tab.team', icon: 'users' },
  { name: 'schedule', labelKey: 'tab.bookings', icon: 'calendar' },
  { name: 'services', labelKey: 'tab.services', icon: 'scissors' },
  { name: 'profile', labelKey: 'tab.profile', icon: 'user' },
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
