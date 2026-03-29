import React from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Home, Grid2x2, User } from 'lucide-react-native';

const BLUE = '#2979FF';

interface TabItem {
  name: string;
  label: string;
  route: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number; fill?: string }>;
}

const TABS: TabItem[] = [
  { name: '(home)', label: 'Home', route: '/(tabs)/(home)', Icon: Home },
  { name: 'portfolio', label: 'Portfolio', route: '/(tabs)/portfolio', Icon: Grid2x2 },
  { name: 'profile', label: 'Profile', route: '/(tabs)/profile', Icon: User },
];

function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const getActiveIndex = () => {
    if (pathname.includes('portfolio')) return 1;
    if (pathname.includes('profile')) return 2;
    return 0;
  };

  const activeIndex = getActiveIndex();

  const handlePress = (tab: TabItem, index: number) => {
    console.log('[TabBar] Tab pressed:', tab.label);
    router.push(tab.route as any);
  };

  return (
    <View style={[styles.tabBarWrapper, { paddingBottom: insets.bottom + 8 }]}>
      <BlurView intensity={60} tint="dark" style={styles.blurPill}>
        <View style={styles.tabsRow}>
          {TABS.map((tab, index) => {
            const isActive = activeIndex === index;
            const iconColor = isActive ? BLUE : '#aaa';
            const labelColor = isActive ? BLUE : '#aaa';
            return (
              <TouchableOpacity
                key={tab.name}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => handlePress(tab, index)}
                activeOpacity={0.75}
              >
                <tab.Icon size={22} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
                <Text style={[styles.tabLabel, { color: labelColor }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarStyle: { display: 'none' } }}
      tabBar={() => <CustomTabBar />}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  blurPill: {
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: Platform.OS === 'android' ? 'rgba(20,20,20,0.92)' : undefined,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 3,
    minWidth: 80,
  },
  tabItemActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
