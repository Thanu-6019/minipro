import { Tabs } from 'expo-router';
import { theme } from '@/theme';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors['on-surface-variant'],
      // The native tab bar is hidden — every screen (tab screens and
      // top-level stack screens like /medicines, /appointments, /history,
      // /settings/* alike) renders <UnifiedBottomNav /> itself so the
      // footer is pixel-identical everywhere, including on stack routes
      // that live outside this (tabs) group.
      tabBarStyle: { display: 'none' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="medicines" options={{ title: 'Medicines' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}