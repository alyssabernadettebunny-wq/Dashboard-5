import { StyleSheet, Text, View } from 'react-native';
import type { PatternStatus } from '@/models';
import { colors, radius, spacing, typography } from '@/theme';

const LABELS: Record<PatternStatus, string> = {
  emerging: 'Emerging',
  recurring: 'Recurring',
  strong_signal: 'Strong Signal',
  uncertain: 'Uncertain',
  sleeping: 'Sleeping',
};

const TONES: Record<PatternStatus, string> = {
  emerging: colors.emerging,
  recurring: colors.recurring,
  strong_signal: colors.strongSignal,
  uncertain: colors.uncertain,
  sleeping: colors.sleeping,
};

export function ConfidenceBadge({ status }: { status: PatternStatus }) {
  const tone = TONES[status];
  return (
    <View style={[styles.badge, { backgroundColor: `${tone}22`, borderColor: `${tone}55` }]}>
      <View style={[styles.dot, { backgroundColor: tone }]} />
      <Text style={[typography.label, { color: colors.ink }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
