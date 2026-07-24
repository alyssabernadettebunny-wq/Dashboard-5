import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '@/components/Chip';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { colors, spacing, typography } from '@/theme';
import { contextEngine } from './index';
import { clarificationQuestionStore } from './defaultStores';
import { saveJournalEntry } from './saveJournalEntry';
import type { ClarificationQuestion, ContextExtractionResult } from './types';

/**
 * Sprint 001 developer-facing test view. Not part of the main navigation —
 * a section inside Settings for manually verifying the Context Engine:
 * one entry becoming multiple events, exact source passages, pending
 * clarification storage, and answering/dismissing. A full review-screen
 * redesign is out of scope for this sprint.
 */
export function ContextEngineDevPanel() {
  const [text, setText] = useState('');
  const [lastResult, setLastResult] = useState<ContextExtractionResult | null>(null);
  const [pending, setPending] = useState<ClarificationQuestion[]>([]);
  const [running, setRunning] = useState(false);

  const refreshPending = useCallback(async () => {
    setPending(await clarificationQuestionStore.getPendingQuestions());
  }, []);

  const runExtraction = useCallback(async () => {
    if (!text.trim()) return;
    setRunning(true);
    try {
      const entry = await saveJournalEntry(text, contextEngine);
      // saveJournalEntry fires extraction in the background; for this dev
      // view we also await it directly so the result renders immediately.
      const result = await contextEngine.extractFromJournalEntry(entry);
      setLastResult(result);
      await refreshPending();
    } finally {
      setRunning(false);
    }
  }, [text, refreshPending]);

  const answer = useCallback(
    async (id: string) => {
      await contextEngine.answerClarification(id, 'Answered from dev panel.');
      await refreshPending();
    },
    [refreshPending],
  );

  const dismiss = useCallback(
    async (id: string) => {
      await contextEngine.dismissClarification(id);
      await refreshPending();
    },
    [refreshPending],
  );

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={typography.bodySoft}>
        Paste or type a journal entry and run it through the Context Engine to see the reconstructed events and any
        pending clarification questions — nothing here is interpretation yet, just what happened.
      </Text>

      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="e.g. I missed my appointment. Later Mom called and we argued about money."
        placeholderTextColor={colors.inkSoft}
        multiline
        style={[typography.body, styles.input]}
      />

      <SecondaryButton onPress={runExtraction} disabled={!text.trim() || running} style={styles.button}>
        {running ? 'Running…' : 'Run Context Engine'}
      </SecondaryButton>

      {lastResult && (
        <View style={{ gap: spacing.sm }}>
          <Text style={typography.label}>RECONSTRUCTED EVENTS ({lastResult.events.length})</Text>
          {lastResult.events.length === 0 && <Text style={typography.bodySoft}>No events reconstructed.</Text>}
          {lastResult.events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={typography.caption}>Sequence {event.sequenceIndex}</Text>
              <Text style={typography.body}>{event.summary}</Text>
              <Text style={typography.caption}>
                Stated time: {event.statedTime ?? '—'} · Resolved: {event.resolvedTime ?? '—'} · Precision: {event.timePrecision}
              </Text>
              <Text style={typography.caption}>Participants: {event.participants.length > 0 ? event.participants.join(', ') : '—'}</Text>
              <Text style={typography.caption}>Source: "{event.source.text}" [{event.source.startIndex}, {event.source.endIndex})</Text>
              {event.needsClarification && <Chip label="Needs clarification" tone="cherry" />}
            </View>
          ))}
        </View>
      )}

      <Text style={typography.label}>PENDING CLARIFICATION QUESTIONS ({pending.length})</Text>
      {pending.length === 0 && <Text style={typography.bodySoft}>None pending.</Text>}
      {pending.map((q) => (
        <View key={q.id} style={styles.eventCard}>
          <Text style={typography.body}>{q.question}</Text>
          <Text style={typography.caption}>{q.reason}</Text>
          <View style={styles.tagRow}>
            <PrimaryButton onPress={() => answer(q.id)} style={styles.smallButton}>
              Answer
            </PrimaryButton>
            <SecondaryButton onPress={() => dismiss(q.id)} style={styles.smallButton}>
              Dismiss
            </SecondaryButton>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 12,
    padding: spacing.sm,
    backgroundColor: colors.white,
  },
  button: { alignSelf: 'flex-start' },
  eventCard: {
    gap: 4,
    padding: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.creamDeep,
  },
  tagRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  smallButton: { paddingHorizontal: spacing.md },
});
