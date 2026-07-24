import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DesktopSidebar } from '@/components/DesktopSidebar';
import { useResponsive } from '@/hooks/useResponsive';
import { AppDataProvider } from '@/state';
import { colors } from '@/theme';

function RootShell() {
  const { isDesktop } = useResponsive();

  return (
    <View style={[styles.shell, isDesktop && styles.shellDesktop]}>
      {isDesktop && <DesktopSidebar />}
      <View style={styles.stackArea}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="pattern/[id]"
            options={{
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: colors.cream },
              headerTintColor: colors.darkCherry,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="entry/[id]"
            options={{
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: colors.cream },
              headerTintColor: colors.darkCherry,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="review/index"
            options={{
              headerShown: true,
              title: 'Context Review',
              headerStyle: { backgroundColor: colors.cream },
              headerTintColor: colors.darkCherry,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="review/[journalEntryId]"
            options={{
              headerShown: true,
              title: '',
              headerStyle: { backgroundColor: colors.cream },
              headerTintColor: colors.darkCherry,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="timeline/index"
            options={{
              headerShown: true,
              title: 'What Happened',
              headerStyle: { backgroundColor: colors.cream },
              headerTintColor: colors.darkCherry,
              presentation: 'card',
            }}
          />
          <Stack.Screen
            name="timeline/hidden"
            options={{
              headerShown: true,
              title: 'Hidden Events',
              headerStyle: { backgroundColor: colors.cream },
              headerTintColor: colors.darkCherry,
              presentation: 'card',
            }}
          />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppDataProvider>
          <StatusBar style="dark" />
          <RootShell />
        </AppDataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  shellDesktop: { flexDirection: 'row' },
  stackArea: { flex: 1 },
});
