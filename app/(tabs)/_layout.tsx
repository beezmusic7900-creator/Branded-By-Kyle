
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'home',
      label: 'Home',
    },
    {
      name: 'book',
      route: '/(tabs)/book',
      icon: 'calendar',
      label: 'Book',
    },
    {
      name: 'portfolio',
      route: '/(tabs)/portfolio',
      icon: 'image',
      label: 'Portfolio',
    },
    {
      name: 'appointments',
      route: '/(tabs)/appointments',
      icon: 'list',
      label: 'My Appointments',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person',
      label: 'Profile',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="book" name="book" />
        <Stack.Screen key="portfolio" name="portfolio" />
        <Stack.Screen key="appointments" name="appointments" />
        <Stack.Screen key="profile" name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
