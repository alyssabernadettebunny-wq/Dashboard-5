import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, type ViewStyle } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface ButtonProps extends PropsWithChildren {
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

export function PrimaryButton({ children, onPress, style, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        style,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[typography.button, styles.primaryText]}>{children}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, onPress, style, disabled }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.secondary, style, disabled && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      <Text style={[typography.button, styles.secondaryText]}>{children}</Text>
    </Pressable>
  );
}

export function GhostButton({ children, onPress, style, disabled }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.ghost, style, pressed && styles.pressedGhost]}>
      <Text style={[typography.label, styles.ghostText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    backgroundColor: colors.darkCherry,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  primaryText: { color: colors.cream },
  secondary: {
    backgroundColor: colors.creamDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  secondaryText: { color: colors.darkCherry },
  ghost: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  ghostText: { color: colors.inkSoft, textTransform: 'uppercase' },
  pressed: { opacity: 0.85 },
  pressedGhost: { opacity: 0.6 },
  disabled: { opacity: 0.45 },
});
