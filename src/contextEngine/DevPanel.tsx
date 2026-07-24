import { useCallback, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Chip } from '@/components/Chip';
import { PrimaryButton, SecondaryButton } from '@/components/Buttons';
import { generateId } from '@/models/ids';
import { entryRepository } from '@/storage';
import { colors, spacing, typography } from '@/theme';
import { contextEngine } from './index';
import { clarificationQuestionStore, eventTimelineVisibilityStore, factCorrectionStore, reconstructedEventStore } from './defaultStores';
import { saveJournalEntry } from './saveJournalEntry';
import type { ClarificationQuestion, ContextExtractionResult, FactCorrection, ReconstructedEvent } from './types';

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

  /**
   * Manual QA aid only: the local provider doesn't yet detect sequence
   * ambiguity on its own (out of scope for this sprint), so this manufactures
   * one sequence-category clarification question — using two real events
   * from the last extraction — purely so the Context Review sequence-options
   * UI can be exercised against real Context Engine data.
   */
  const addDemoSequenceQuestion = useCallback(async () => {
    if (!lastResult || lastResult.events.length < 2) return;
    const [first, second] = lastResult.events;
    const now = new Date().toISOString();
    const question: ClarificationQuestion = {
      id: generateId('clarification'),
      journalEntryId: first.journalEntryId,
      eventId: first.id,
      question: 'Which happened first?',
      reason: 'Demo sequence-ambiguity question for manual QA of the Context Review sequence-options UI.',
      category: 'sequence',
      targetField: 'sequenceIndex',
      options: [
        { id: generateId('option'), label: `"${second.summary}" first`, value: second.sequenceIndex },
        { id: generateId('option'), label: `"${first.summary}" first`, value: first.sequenceIndex },
      ],
      status: 'pending',
      answer: null,
      createdAt: now,
      answeredAt: null,
      dismissedAt: null,
    };
    await clarificationQuestionStore.saveMany([question]);
    await refreshPending();
  }, [lastResult, refreshPending]);

  /**
   * Manual QA aid only: the local provider can't naturally produce every
   * timeline state (an explicit date genuinely different from the entry's
   * own day, an already-corrected event, a hidden event) without new
   * extraction heuristics, which is out of scope for this sprint. This
   * manufactures three real app journal entries plus reconstructed-event
   * fixtures covering exact, relative, unknown, and anchored time states, one
   * pre-applied correction (for the "Updated by you" marker), and one hidden
   * event — purely so the Event Timeline UI can be exercised end to end.
   */
  const seedTimelineDemoData = useCallback(async () => {
    const now = new Date();
    const today = now.toISOString();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();

    const entryA = {
      id: generateId('entry'),
      createdAt: today,
      updatedAt: today,
      text: 'I met Amy for coffee at 9:00 am. This morning we also talked about the move.',
      isImportant: false,
      entryType: 'text' as const,
      suggestedSubjects: [],
      userTags: [],
      connectedPatternIds: [],
    };
    const entryB = {
      id: generateId('entry'),
      createdAt: today,
      updatedAt: today,
      text: 'Something happened with my brother but I do not remember when.',
      isImportant: false,
      entryType: 'text' as const,
      suggestedSubjects: [],
      userTags: [],
      connectedPatternIds: [],
    };
    const entryC = {
      id: generateId('entry'),
      createdAt: yesterday,
      updatedAt: yesterday,
      text: 'Dinner with my mother went fine.',
      isImportant: false,
      entryType: 'text' as const,
      suggestedSubjects: [],
      userTags: [],
      connectedPatternIds: [],
    };
    const entryD = {
      id: generateId('entry'),
      createdAt: today,
      updatedAt: today,
      text: 'On Tuesday, Mom called about the appointment.',
      isImportant: false,
      entryType: 'text' as const,
      suggestedSubjects: [],
      userTags: [],
      connectedPatternIds: [],
    };
    await entryRepository.save(entryA);
    await entryRepository.save(entryB);
    await entryRepository.save(entryC);
    await entryRepository.save(entryD);

    const exactEvent: ReconstructedEvent = {
      id: generateId('event'),
      journalEntryId: entryA.id,
      summary: 'The user met Amy for coffee.',
      statedTime: 'at 9:00 am',
      resolvedTime: today.slice(0, 10) + 'T09:00:00' + today.slice(19),
      timePrecision: 'exact',
      resolvedDate: today.slice(0, 10),
      participants: ['Amy'],
      sequenceIndex: 0,
      source: { text: 'I met Amy for coffee at 9:00 am.', startIndex: 0, endIndex: 33 },
      needsClarification: false,
      createdAt: today,
      updatedAt: today,
    };
    const relativeEvent: ReconstructedEvent = {
      id: generateId('event'),
      journalEntryId: entryA.id,
      summary: 'The user talked about the move.',
      statedTime: 'This morning',
      resolvedTime: null,
      timePrecision: 'relative',
      resolvedDate: null,
      participants: [],
      sequenceIndex: 1,
      source: { text: 'This morning we also talked about the move.', startIndex: 34, endIndex: 78 },
      needsClarification: false,
      createdAt: today,
      updatedAt: today,
    };
    const unknownEvent: ReconstructedEvent = {
      id: generateId('event'),
      journalEntryId: entryB.id,
      summary: 'Something happened with the user\'s brother.',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
      participants: ['my brother'],
      sequenceIndex: 0,
      source: { text: 'Something happened with my brother but I do not remember when.', startIndex: 0, endIndex: 65 },
      needsClarification: true,
      createdAt: today,
      updatedAt: today,
    };
    const anchoredEvent: ReconstructedEvent = {
      id: generateId('event'),
      journalEntryId: entryC.id,
      summary: 'The user had dinner with their mother.',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
      participants: ['my mother'],
      sequenceIndex: 0,
      source: { text: 'Dinner with my mother went fine.', startIndex: 0, endIndex: 33 },
      needsClarification: false,
      createdAt: yesterday,
      updatedAt: yesterday,
    };
    /**
     * Demonstrates date certainty independent of time-of-day precision: the
     * day is safely known (a stated weekday), but the clock time is not, so
     * this groups under its own resolved day rather than the journal entry's
     * own (later) creation date.
     */
    const explicitDateEvent: ReconstructedEvent = {
      id: generateId('event'),
      journalEntryId: entryD.id,
      summary: "The user's mother called about the appointment.",
      statedTime: 'Tuesday',
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: twoDaysAgo.slice(0, 10),
      participants: ['my mother'],
      sequenceIndex: 0,
      source: { text: 'On Tuesday, Mom called about the appointment.', startIndex: 0, endIndex: 46 },
      needsClarification: false,
      createdAt: today,
      updatedAt: today,
    };

    await reconstructedEventStore.saveMany([exactEvent, relativeEvent, unknownEvent, anchoredEvent, explicitDateEvent]);

    const demoCorrection: FactCorrection = {
      id: generateId('correction'),
      journalEntryId: entryB.id,
      eventId: unknownEvent.id,
      clarificationQuestionId: generateId('clarification'),
      category: 'participant',
      changes: [{ eventId: unknownEvent.id, field: 'participants', previousValue: ['my brother'], correctedValue: ['Sam'] }],
      source: 'user',
      createdAt: today,
    };
    await factCorrectionStore.create(demoCorrection);

    await eventTimelineVisibilityStore.hide(anchoredEvent.id, today);
  }, []);

  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={typography.bodySoft}>
        Paste or type a journal entry and run it through the Context Engine to see the reconstructed events and any
        pending clarification questions — nothing here is interpretation yet, just what happened.
      </Text>

      <SecondaryButton onPress={seedTimelineDemoData} style={styles.button}>
        Seed timeline demo data (QA only)
      </SecondaryButton>

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
          {lastResult.events.length >= 2 && (
            <SecondaryButton onPress={addDemoSequenceQuestion} style={styles.button}>
              Add demo sequence question (QA only)
            </SecondaryButton>
          )}
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
