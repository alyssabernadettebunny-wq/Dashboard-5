import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useResponsive } from '@/hooks/useResponsive';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { isDesktop } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.darkCherry,
        tabBarInactiveTintColor: colors.mauve,
        tabBarStyle: isDesktop
          ? { display: 'none' }
          : { backgroundColor: colors.cream, borderTopColor: colors.hairline },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="drop"
        options={{ title: 'Drop In', tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="garden"
        options={{ title: 'Garden', tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="stream"
        options={{ title: 'Stream', tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
