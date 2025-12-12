
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from './IconSymbol';

export interface TabBarItem {
  name: string;
  route: string;
  icon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
}

const iconMap: Record<string, { ios: string; android: string }> = {
  home: { ios: 'house.fill', android: 'home' },
  calendar: { ios: 'calendar.badge.plus', android: 'event' },
  image: { ios: 'photo.fill', android: 'photo_library' },
  list: { ios: 'list.bullet.clipboard.fill', android: 'assignment' },
  person: { ios: 'person.fill', android: 'person' },
};

export default function FloatingTabBar({ tabs }: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => {
    if (route === '/(tabs)/(home)/') {
      return pathname === '/' || pathname.startsWith('/(tabs)/(home)');
    }
    return pathname.startsWith(route);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const active = isActive(tab.route);
          const icons = iconMap[tab.icon] || { ios: 'circle', android: 'circle' };
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.tabButton}
              onPress={() => router.push(tab.route as any)}
            >
              <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                <IconSymbol
                  ios_icon_name={icons.ios}
                  android_material_icon_name={icons.android}
                  size={24}
                  color={active ? colors.primary : colors.text}
                />
              </View>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
    pointerEvents: 'box-none',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 8,
    boxShadow: '0px 4px 16px rgba(30, 144, 255, 0.2)',
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    marginBottom: 4,
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
