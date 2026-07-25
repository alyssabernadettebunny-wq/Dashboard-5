import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { GhostButton } from '@/components/Buttons';
import { colors, spacing, typography } from '@/theme';
import type { TimelineEventItem } from './types';
import { filterDisplayParticipants } from './participantExtraction';

interface EventCardProps {
  item: TimelineEventItem;
  onPressSource: () => void;
  onHide?: () => void;
  onRestore?: () => void;
}

/** One event's read-only presentation on the timeline — no interpretation, only what was reconstructed. */
export function EventCard({ item, onPressSource, onHide, onRestore }: EventCardProps) {
  const displayParticipants = filterDisplayParticipants(item.event.participants);
  return (
    <Card style={styles.card}>
      <Text style={typography.caption}>{item.displayTime}</Text>
      <Text style={typography.body}>{item.event.summary}</Text>
      {displayParticipants.length > 0 && (
        <Text style={typography.bodySoft}>{displayParticipants.join(', ')}</Text>
      )}

      <View style={styles.footerRow}>
        <Pressable onPress={onPressSource} hitSlop={8}>
          <Text style={styles.sourceLink}>View source</Text>
        </Pressable>
        {item.isCorrectedByUser && <Text style={styles.correctedBadge}>Updated by you</Text>}
      </View>

      {(onHide || onRestore) && (
        <View style={styles.actionRow}>
          {onHide && <GhostButton onPress={onHide}>Hide</GhostButton>}
          {onRestore && <GhostButton onPress={onRestore}>Restore</GhostButton>}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.xs },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  sourceLink: { ...typography.label, color: colors.mauve },
  correctedBadge: { ...typography.caption, fontStyle: 'italic', color: colors.inkSoft },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.hairline, paddingTop: spacing.xs },
});
