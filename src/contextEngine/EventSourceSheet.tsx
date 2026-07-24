import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GhostButton } from '@/components/Buttons';
import { colors, radius, spacing, typography } from '@/theme';
import type { EventSourceContext } from './types';

interface EventSourceSheetProps {
  visible: boolean;
  context: EventSourceContext | null;
  onClose: () => void;
}

function formatJournalDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

/**
 * Read-only view of what Cherry Brain reconstructed, the exact passage it
 * came from, and (on request) the full original entry. Rendered as an
 * in-screen Modal (not a routed screen) so the timeline behind it keeps its
 * scroll position untouched while this is open. The full entry is collapsed
 * by default — only the cited passage is shown immediately.
 */
export function EventSourceSheet({ visible, context, onClose }: EventSourceSheetProps) {
  const [showFullEntry, setShowFullEntry] = useState(false);

  // Reset the collapsed state each time a different event's sheet opens.
  useEffect(() => {
    if (visible) setShowFullEntry(false);
  }, [visible, context?.event.id]);

  if (!context) return null;

  const { event, sourcePassage, journalEntry } = context;
  const before = journalEntry.originalText.slice(0, sourcePassage.startIndex);
  const after = journalEntry.originalText.slice(sourcePassage.endIndex);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView>
            <Text style={typography.label}>CHERRY BRAIN RECONSTRUCTED</Text>
            <Text style={typography.body}>{event.summary}</Text>
            {context.isCorrectedByUser && <Text style={styles.correctedNote}>Updated by you.</Text>}

            <Text style={typography.caption}>Journal entry from {formatJournalDate(journalEntry.createdAt)}</Text>

            <Text style={[typography.label, styles.blockLabel]}>CITED PASSAGE</Text>
            <View style={styles.citedBlock}>
              <Text style={[typography.body, styles.citedText]} selectable>
                "{sourcePassage.text}"
              </Text>
            </View>

            {!showFullEntry ? (
              <GhostButton onPress={() => setShowFullEntry(true)} style={styles.toggleButton}>
                Show full entry
              </GhostButton>
            ) : (
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.label, styles.blockLabel]}>FULL ENTRY (READ-ONLY)</Text>
                <Text style={[typography.bodySoft, styles.entryText]} selectable>
                  {before}
                  <Text style={styles.highlighted}>{sourcePassage.text}</Text>
                  {after}
                </Text>
                <GhostButton onPress={() => setShowFullEntry(false)} style={styles.toggleButton}>
                  Hide full entry
                </GhostButton>
              </View>
            )}
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
  blockLabel: { marginTop: spacing.sm },
  citedBlock: {
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.creamDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
    marginTop: spacing.xs,
  },
  citedText: { fontStyle: 'italic' },
  correctedNote: { ...typography.caption, fontStyle: 'italic', color: colors.inkSoft },
  toggleButton: { alignSelf: 'flex-start', marginTop: spacing.sm },
  entryText: { lineHeight: 22 },
  highlighted: { backgroundColor: colors.creamDeep, color: colors.darkCherry },
  closeButton: { alignSelf: 'center', marginTop: spacing.sm },
});
