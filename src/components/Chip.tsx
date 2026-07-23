import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  tone?: 'neutral' | 'cherry';
}

export function Chip({ label, onPress, selected, tone = 'neutral' }: ChipProps) {
  const Component = onPress ? Pressable : Text;
  const content = (
    <Text
      style={[
        typography.caption,
        styles.text,
        selected && styles.textSelected,
        tone === 'cherry' && !selected && styles.textCherry,
      ]}
    >
      {label}
    </Text>
  );

  if (!onPress) {
    return <Text style={[styles.chip, tone === 'cherry' && styles.chipCherry]}>{content}</Text>;
  }

  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected, tone === 'cherry' && styles.chipCherry]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.creamDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  chipCherry: {
    backgroundColor: 'rgba(92,31,46,0.06)',
  },
  chipSelected: {
    backgroundColor: colors.darkCherry,
    borderColor: colors.darkCherry,
  },
  text: { color: colors.inkSoft },
  textCherry: { color: colors.darkCherry },
  textSelected: { color: colors.cream },
});
