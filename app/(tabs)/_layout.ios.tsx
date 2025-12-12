
import React from 'react';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  return (
    <NativeTabs
      backgroundColor={colors.background}
      tintColor={colors.primary}
      iconColor={colors.text}
      labelStyle={{
        color: colors.text,
      }}
    >
      <NativeTabs.Trigger key="home" name="(home)">
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="book" name="book">
        <Icon sf={{ default: 'calendar', selected: 'calendar.badge.plus' }} />
        <Label>Book</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="portfolio" name="portfolio">
        <Icon sf={{ default: 'photo', selected: 'photo.fill' }} />
        <Label>Portfolio</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="appointments" name="appointments">
        <Icon sf={{ default: 'list.bullet', selected: 'list.bullet.clipboard.fill' }} />
        <Label>My Appointments</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger key="profile" name="profile">
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
