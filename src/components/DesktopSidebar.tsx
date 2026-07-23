import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CherrySprig } from './CherrySprig';
import { colors, radius, spacing, typography } from '@/theme';

interface NavItem {
  href: '/' | '/drop' | '/garden' | '/stream' | '/settings';
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Home', icon: 'sparkles-outline' },
  { href: '/drop', label: 'Drop Something In', icon: 'add-circle-outline' },
  { href: '/garden', label: 'Pattern Garden', icon: 'leaf-outline' },
  { href: '/stream', label: 'Life Stream', icon: 'time-outline' },
  { href: '/settings', label: 'Settings', icon: 'settings-outline' },
];

export function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.sidebar}>
      <View style={styles.brandRow}>
        <CherrySprig size={26} />
        <Text style={[typography.title, styles.brand]}>Cherry Brain</Text>
      </View>

      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href)}
              style={({ hovered }: { hovered?: boolean }) => [
                styles.navItem,
                active && styles.navItemActive,
                hovered && !active && styles.navItemHovered,
              ]}
            >
              <Ionicons name={item.icon} size={18} color={active ? colors.cream : colors.mauve} />
              <Text style={[typography.body, styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={typography.caption}>Stored only on this device</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 248,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.creamDeep,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: colors.hairline,
    justifyContent: 'space-between',
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.sm, marginBottom: spacing.xl },
  brand: { fontSize: 19 },
  nav: { gap: 4, flex: 1 },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  navItemHovered: { backgroundColor: 'rgba(92,31,46,0.06)' },
  navItemActive: { backgroundColor: colors.darkCherry },
  navLabel: { color: colors.inkSoft },
  navLabelActive: { color: colors.cream, fontWeight: '600' },
  footer: { paddingHorizontal: spacing.sm },
});
