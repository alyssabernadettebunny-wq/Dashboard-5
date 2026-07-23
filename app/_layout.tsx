import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppDataProvider } from '@/state';
import { colors } from '@/theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppDataProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="pattern/[id]"
              options={{ headerShown: true, title: '', headerStyle: { backgroundColor: colors.cream }, headerTintColor: colors.darkCherry, presentation: 'card' }}
            />
            <Stack.Screen
              name="entry/[id]"
              options={{ headerShown: true, title: '', headerStyle: { backgroundColor: colors.cream }, headerTintColor: colors.darkCherry, presentation: 'card' }}
            />
          </Stack>
        </AppDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
