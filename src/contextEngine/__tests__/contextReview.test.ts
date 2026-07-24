import { ContextReviewError } from '../ContextReviewError';
import { ReconstructedEventStore } from '../storage';
import { buildReviewHarness, makeEvent, makeQuestion } from './reviewTestHarness';

describe('Inbox grouping', () => {
  it('groups pending questions by journal entry, excludes answered/dismissed, no duplicate cards', async () => {
    const { eventStore, clarificationStore, entries, service } = buildReviewHarness();

    entries.set('journal_A', { text: 'A busy day with a lot going on.', createdAt: '2026-07-20T09:00:00.000Z' });
    entries.set('journal_B', { text: 'A quieter day.', createdAt: '2026-07-21T09:00:00.000Z' });

    const eventA = makeEvent({ id: 'event_A', journalEntryId: 'journal_A' });
    const eventB = makeEvent({ id: 'event_B', journalEntryId: 'journal_B' });
    await eventStore.saveMany([eventA, eventB]);

    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', journalEntryId: 'journal_A', eventId: 'event_A', status: 'pending' }),
      makeQuestion({ id: 'q2', journalEntryId: 'journal_A', eventId: 'event_A', status: 'pending' }),
      makeQuestion({ id: 'q3', journalEntryId: 'journal_A', eventId: 'event_A', status: 'pending' }),
      makeQuestion({ id: 'q4', journalEntryId: 'journal_B', eventId: 'event_B', status: 'pending' }),
      makeQuestion({ id: 'q5', journalEntryId: 'journal_A', eventId: 'event_A', status: 'answered', answeredAt: '2026-07-20T10:00:00.000Z' }),
      makeQuestion({ id: 'q6', journalEntryId: 'journal_B', eventId: 'event_B', status: 'dismissed', dismissedAt: '2026-07-20T10:00:00.000Z' }),
    ]);

    const groups = await service.getInboxGroups();

    expect(groups).toHaveLength(2);
    const journalIds = groups.map((g) => g.journalEntryId);
    expect(new Set(journalIds).size).toBe(2);

    const groupA = groups.find((g) => g.journalEntryId === 'journal_A')!;
    const groupB = groups.find((g) => g.journalEntryId === 'journal_B')!;
    expect(groupA.pendingCount).toBe(3);
    expect(groupB.pendingCount).toBe(1);
    expect(groupA.questions.every((q) => q.question.status === 'pending')).toBe(true);
  });
});

describe('Group ordering', () => {
  it('orders journal groups most-recent-first, and questions within a group by createdAt then id', async () => {
    const { eventStore, clarificationStore, entries, service } = buildReviewHarness();

    entries.set('journal_old', { text: 'Older entry.', createdAt: '2026-07-10T09:00:00.000Z' });
    entries.set('journal_new', { text: 'Newer entry.', createdAt: '2026-07-22T09:00:00.000Z' });

    await eventStore.saveMany([
      makeEvent({ id: 'event_old', journalEntryId: 'journal_old' }),
      makeEvent({ id: 'event_new', journalEntryId: 'journal_new' }),
    ]);

    await clarificationStore.saveMany([
      makeQuestion({ id: 'q_old', journalEntryId: 'journal_old', eventId: 'event_old' }),
      makeQuestion({ id: 'q_new', journalEntryId: 'journal_new', eventId: 'event_new' }),
    ]);

    const groups = await service.getInboxGroups();
    expect(groups.map((g) => g.journalEntryId)).toEqual(['journal_new', 'journal_old']);

    entries.set('journal_multi', { text: 'Multi-question entry.', createdAt: '2026-07-23T09:00:00.000Z' });
    await eventStore.saveMany([makeEvent({ id: 'event_multi', journalEntryId: 'journal_multi' })]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q_b', journalEntryId: 'journal_multi', eventId: 'event_multi', createdAt: '2026-07-23T10:00:00.000Z' }),
      makeQuestion({ id: 'q_a', journalEntryId: 'journal_multi', eventId: 'event_multi', createdAt: '2026-07-23T09:00:00.000Z' }),
    ]);

    const group = await service.getReviewGroup('journal_multi');
    expect(group?.questions.map((q) => q.question.id)).toEqual(['q_a', 'q_b']);
  });
});

describe('Participant correction', () => {
  it('updates event participants, creates one correction, preserves original text, marks question answered', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'I told her I was done after what happened.', createdAt: '2026-07-23T09:00:00.000Z' });

    const event = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([event]);
    const question = makeQuestion({ id: 'q1', eventId: 'event_1' });
    await clarificationStore.saveMany([question]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: '  My mother  ' });

    expect(result.updatedEvent.participants).toEqual(['My mother']);
    expect(result.correction.changes).toEqual([
      { eventId: 'event_1', field: 'participants', previousValue: [], correctedValue: ['My mother'] },
    ]);
    expect(result.answeredQuestion.status).toBe('answered');
    expect(result.answeredQuestion.answeredAt).not.toBeNull();

    const corrections = await correctionStore.getByEventId('event_1');
    expect(corrections).toHaveLength(1);

    const entry = entries.get('journal_1')!;
    expect(entry.text).toBe('I told her I was done after what happened.');

    const pending = await clarificationStore.getPendingQuestionsForEntry('journal_1');
    expect(pending).toHaveLength(0);
  });
});

describe('Action correction', () => {
  it('updates the event summary factually, preserves the answer, does not touch the source passage', async () => {
    const { eventStore, clarificationStore, service } = buildReviewHarness();

    const event = makeEvent({
      id: 'event_1',
      summary: 'The user missed the appointment.',
      source: { text: 'I missed the appointment.', startIndex: 0, endIndex: 26 },
    });
    await eventStore.saveMany([event]);
    const question = makeQuestion({
      id: 'q1',
      eventId: 'event_1',
      category: 'action',
      targetField: 'summary',
      question: 'What did you do instead?',
    });
    await clarificationStore.saveMany([question]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'I canceled it that morning.' });

    expect(result.updatedEvent.summary).toBe('The user canceled it that morning.');
    expect(result.answeredQuestion.answer).toBe('I canceled it that morning.');
    expect(result.updatedEvent.source).toEqual({ text: 'I missed the appointment.', startIndex: 0, endIndex: 26 });
  });
});

describe('Time correction', () => {
  it('updates stated time without inventing precision for a vague answer', async () => {
    const { eventStore, clarificationStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: '2026-07-23T09:00:00.000Z' });

    const event = makeEvent({ id: 'event_1', statedTime: null, resolvedTime: null, timePrecision: 'unknown' });
    await eventStore.saveMany([event]);
    const question = makeQuestion({ id: 'q1', eventId: 'event_1', category: 'time', targetField: 'statedTime', question: 'When did this happen?' });
    await clarificationStore.saveMany([question]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'Tuesday morning' });

    expect(result.updatedEvent.statedTime).toBe('Tuesday morning');
    expect(result.updatedEvent.resolvedTime).toBeNull();
    expect(result.updatedEvent.timePrecision).not.toBe('exact');
  });

  it('may resolve an exact resolvable time', async () => {
    const { eventStore, clarificationStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: '2026-07-23T09:00:00.000Z' });

    const event = makeEvent({ id: 'event_1' });
    await eventStore.saveMany([event]);
    const question = makeQuestion({ id: 'q1', eventId: 'event_1', category: 'time', targetField: 'statedTime' });
    await clarificationStore.saveMany([question]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'at 3:00 pm' });

    expect(result.updatedEvent.timePrecision).toBe('exact');
    expect(result.updatedEvent.resolvedTime).not.toBeNull();
  });
});

describe('Sequence correction', () => {
  it('updates event order via options, keeps sequence indexes unique, loses no events', async () => {
    const { eventStore, clarificationStore, service } = buildReviewHarness();

    const eventFirst = makeEvent({ id: 'event_first', sequenceIndex: 0, summary: 'The user missed the appointment.' });
    const eventSecond = makeEvent({ id: 'event_second', sequenceIndex: 1, summary: 'Mom called.' });
    await eventStore.saveMany([eventFirst, eventSecond]);

    const question = makeQuestion({
      id: 'q1',
      eventId: 'event_first',
      category: 'sequence',
      targetField: 'sequenceIndex',
      question: 'Which happened first?',
      options: [
        { id: 'opt_mom_first', label: 'Mom called first', value: 1 },
        { id: 'opt_missed_first', label: 'I missed the appointment first', value: 0 },
      ],
    });
    await clarificationStore.saveMany([question]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: '', selectedOptionId: 'opt_mom_first' });

    expect(result.updatedEvent.sequenceIndex).toBe(1);

    const allEvents = await eventStore.getForEntry('journal_1');
    expect(allEvents).toHaveLength(2);
    const indexes = allEvents.map((e) => e.sequenceIndex).sort();
    expect(indexes).toEqual([0, 1]);
    const swapped = allEvents.find((e) => e.id === 'event_second')!;
    expect(swapped.sequenceIndex).toBe(0);
  });
});

describe('Dismissal', () => {
  it('dismisses a pending question without creating a correction or touching the event, and a second dismissal is rejected', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness();
    const event = makeEvent({ id: 'event_1' });
    await eventStore.saveMany([event]);
    const question = makeQuestion({ id: 'q1', eventId: 'event_1' });
    await clarificationStore.saveMany([question]);

    const result = await service.dismissQuestion('q1');

    expect(result.dismissedQuestion.status).toBe('dismissed');
    expect(result.dismissedQuestion.dismissedAt).not.toBeNull();

    const corrections = await correctionStore.getByEventId('event_1');
    expect(corrections).toHaveLength(0);

    const storedEvent = await eventStore.getById('event_1');
    expect(storedEvent).toEqual(event);

    const pending = await clarificationStore.getPendingQuestionsForEntry('journal_1');
    expect(pending).toHaveLength(0);

    await expect(service.dismissQuestion('q1')).rejects.toThrow(ContextReviewError);
  });
});

describe('Duplicate answer protection', () => {
  it('answering the same question twice creates only one correction and does not double-apply the event change', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness();
    const event = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([event]);
    const question = makeQuestion({ id: 'q1', eventId: 'event_1' });
    await clarificationStore.saveMany([question]);

    await service.answerQuestion({ questionId: 'q1', answer: 'My mother' });
    await expect(service.answerQuestion({ questionId: 'q1', answer: 'Someone else' })).rejects.toThrow(ContextReviewError);

    const corrections = await correctionStore.getByEventId('event_1');
    expect(corrections).toHaveLength(1);

    const storedEvent = await eventStore.getById('event_1');
    expect(storedEvent?.participants).toEqual(['My mother']);
  });
});

describe('Save failure', () => {
  // This injects the failure at the very first write (eventStore.updateMany),
  // i.e. the atomicity boundary "Event update fails" — see
  // contextCorrectionAtomicity.test.ts for the stage-2 (correction creation)
  // and stage-3 (question marked answered) boundaries, which this test does
  // not cover on its own.
  it('leaves the question pending, the event unchanged, and no correction record when the event write fails', async () => {
    class ThrowingEventStore extends ReconstructedEventStore {
      async updateMany(): Promise<void> {
        throw new Error('disk full');
      }
    }

    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness({ makeEventStore: (s) => new ThrowingEventStore(s) });
    const event = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([event]);
    const question = makeQuestion({ id: 'q1', eventId: 'event_1' });
    await clarificationStore.saveMany([question]);

    await expect(service.answerQuestion({ questionId: 'q1', answer: 'My mother' })).rejects.toThrow('disk full');

    const storedQuestion = await clarificationStore.getById('q1');
    expect(storedQuestion?.status).toBe('pending');

    const storedEvent = await eventStore.getById('event_1');
    expect(storedEvent?.participants).toEqual([]);

    const corrections = await correctionStore.getByEventId('event_1');
    expect(corrections).toHaveLength(0);
  });
});

describe('Group completion', () => {
  it('produces the completed state once the final question resolves, with accurate counts', async () => {
    const { eventStore, clarificationStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'I told her I was done. Mom called too.', createdAt: '2026-07-23T09:00:00.000Z' });

    await eventStore.saveMany([makeEvent({ id: 'event_1' })]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', eventId: 'event_1' }),
      makeQuestion({ id: 'q2', eventId: 'event_1', question: 'Second question?' }),
    ]);

    let group = await service.getReviewGroup('journal_1');
    expect(group?.pendingCount).toBe(2);

    await service.answerQuestion({ questionId: 'q1', answer: 'My mother' });
    await service.dismissQuestion('q2');

    group = await service.getReviewGroup('journal_1');
    expect(group).toBeNull();

    const groups = await service.getInboxGroups();
    expect(groups.find((g) => g.journalEntryId === 'journal_1')).toBeUndefined();
  });

  it('next-group action is only warranted when another group exists', async () => {
    const { eventStore, clarificationStore, entries, service } = buildReviewHarness();
    entries.set('journal_only', { text: 'Only entry.', createdAt: '2026-07-23T09:00:00.000Z' });
    await eventStore.saveMany([makeEvent({ id: 'event_only', journalEntryId: 'journal_only' })]);
    await clarificationStore.saveMany([makeQuestion({ id: 'q_only', journalEntryId: 'journal_only', eventId: 'event_only' })]);

    await service.dismissQuestion('q_only');

    const groups = await service.getInboxGroups();
    expect(groups.filter((g) => g.journalEntryId !== 'journal_only')).toHaveLength(0);
  });
});

describe('Original-entry access', () => {
  it('links the review item to the correct journal entry and shows the unchanged original text', async () => {
    const { eventStore, clarificationStore, entries, service } = buildReviewHarness();
    const originalText = 'I told her I was done after what happened.';
    entries.set('journal_1', { text: originalText, createdAt: '2026-07-23T09:00:00.000Z' });
    await eventStore.saveMany([makeEvent({ id: 'event_1' })]);
    await clarificationStore.saveMany([makeQuestion({ id: 'q1', eventId: 'event_1' })]);

    const group = await service.getReviewGroup('journal_1');
    expect(group?.journalEntryId).toBe('journal_1');
    expect(group?.questions[0].originalEntryText).toBe(originalText);
  });
});
