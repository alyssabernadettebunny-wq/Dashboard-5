import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GhostButton } from '@/components/Buttons';
import { colors, radius, spacing, typography } from '@/theme';
import type { EventSourceContext } from './types';

interface EventSourceSheetProps {
  visible: boolean;
  context: EventSourceContext | null;
  onClose: () => void;
}

/**
 * Read-only view of the exact passage a reconstructed event came from, plus
 * the rest of the original entry for context. Rendered as an in-screen Modal
 * (not a routed screen) so the timeline behind it keeps its scroll position
 * untouched while this is open.
 */
export function EventSourceSheet({ visible, context, onClose }: EventSourceSheetProps) {
  if (!context) return null;

  const { sourcePassage, journalEntry } = context;
  const before = journalEntry.originalText.slice(0, sourcePassage.startIndex);
  const after = journalEntry.originalText.slice(sourcePassage.endIndex);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={typography.label}>CITED PASSAGE</Text>
          <View style={styles.citedBlock}>
            <Text style={[typography.body, styles.citedText]} selectable>
              "{sourcePassage.text}"
            </Text>
          </View>

          {context.isCorrectedByUser && <Text style={styles.correctedNote}>This event was updated by you.</Text>}

          <Text style={[typography.label, styles.fullEntryLabel]}>FULL ENTRY (READ-ONLY)</Text>
          <ScrollView style={styles.scroll}>
            <Text style={[typography.bodySoft, styles.entryText]} selectable>
              {before}
              <Text style={styles.highlighted}>{sourcePassage.text}</Text>
              {after}
            </Text>
          </ScrollView>

          <GhostButton onPress={onClose} style={styles.closeButton}>
            Close
          </GhostButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    maxHeight: '80%',
  },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.hairline, marginBottom: spacing.xs },
  citedBlock: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.creamDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  citedText: { fontStyle: 'italic' },
  correctedNote: { ...typography.caption, fontStyle: 'italic', color: colors.inkSoft },
  fullEntryLabel: { marginTop: spacing.xs },
  scroll: { flexGrow: 0 },
  entryText: { lineHeight: 22 },
  highlighted: { backgroundColor: colors.creamDeep, color: colors.darkCherry },
  closeButton: { alignSelf: 'center', marginTop: spacing.sm },
});
