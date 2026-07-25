import { ContextIntegrityError } from '../ContextIntegrityError';
import { ClarificationQuestionStore, FactCorrectionRecordStore, ReconstructedEventStore } from '../storage';
import { buildReviewHarness, makeEvent, makeQuestion } from './reviewTestHarness';

/**
 * Sprint 002 corrective pass: answerQuestion() must be atomic. After it
 * returns or throws, storage is in exactly one of two states — fully
 * answered, or fully as it was before — never a partial mix. Every test
 * here reloads records from the store (never trusting in-memory objects)
 * to prove that.
 */

class ThrowingEventStore extends ReconstructedEventStore {
  async updateMany(events: Parameters<ReconstructedEventStore['updateMany']>[0]): Promise<void> {
    if (this.shouldThrow) throw new Error('event store write failed');
    return super.updateMany(events);
  }
  shouldThrow = true;
}

class ThrowingCorrectionStore extends FactCorrectionRecordStore {
  async create(correction: Parameters<FactCorrectionRecordStore['create']>[0]) {
    if (this.shouldThrow) throw new Error('correction store write failed');
    return super.create(correction);
  }
  shouldThrow = true;
}

class ThrowingClarificationStore extends ClarificationQuestionStore {
  async update(id: string, updater: Parameters<ClarificationQuestionStore['update']>[1]) {
    if (this.shouldThrow) throw new Error('clarification store write failed');
    return super.update(id, updater);
  }
  shouldThrow = true;
}

describe('Boundary: event update fails', () => {
  it('leaves the event, correction ledger, and question exactly as before', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness({
      makeEventStore: (s) => new ThrowingEventStore(s),
    });
    const originalEvent = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([originalEvent]);
    const originalQuestion = makeQuestion({ id: 'q1', eventId: 'event_1' });
    await clarificationStore.saveMany([originalQuestion]);

    await expect(service.answerQuestion({ questionId: 'q1', answer: 'My mother' })).rejects.toThrow(
      'event store write failed',
    );

    const reloadedEvent = await eventStore.getById('event_1');
    const reloadedQuestion = await clarificationStore.getById('q1');
    const reloadedCorrections = await correctionStore.getByEventId('event_1');

    expect(reloadedEvent).toEqual(originalEvent);
    expect(reloadedQuestion).toEqual(originalQuestion);
    expect(reloadedCorrections).toHaveLength(0);
  });
});

describe('Boundary: correction creation fails after the event write', () => {
  it('rolls the event back to its original value and leaves the question pending', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness({
      makeCorrectionStore: (s) => new ThrowingCorrectionStore(s),
    });
    const originalEvent = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([originalEvent]);
    const originalQuestion = makeQuestion({ id: 'q1', eventId: 'event_1' });
    await clarificationStore.saveMany([originalQuestion]);

    await expect(service.answerQuestion({ questionId: 'q1', answer: 'My mother' })).rejects.toThrow(
      'correction store write failed',
    );

    const reloadedEvent = await eventStore.getById('event_1');
    const reloadedQuestion = await clarificationStore.getById('q1');
    const reloadedCorrections = await correctionStore.getByEventId('event_1');

    // Deep equality against the true original — not just "participants is []"
    // but every field, including updatedAt, exactly as it was.
    expect(reloadedEvent).toEqual(originalEvent);
    expect(reloadedQuestion).toEqual(originalQuestion);
    expect(reloadedQuestion?.status).toBe('pending');
    expect(reloadedQuestion?.answer).toBeNull();
    expect(reloadedQuestion?.answeredAt).toBeNull();
    expect(reloadedCorrections).toHaveLength(0);
  });
});

describe('Boundary: question update fails after event and correction writes', () => {
  it('rolls back both the event and the correction record, leaving the question pending', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness({
      makeClarificationStore: (s) => new ThrowingClarificationStore(s),
    });
    const originalEvent = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([originalEvent]);
    const originalQuestion = makeQuestion({ id: 'q1', eventId: 'event_1' });
    await clarificationStore.saveMany([originalQuestion]);

    await expect(service.answerQuestion({ questionId: 'q1', answer: 'My mother' })).rejects.toThrow(
      'clarification store write failed',
    );

    const reloadedEvent = await eventStore.getById('event_1');
    const reloadedQuestion = await clarificationStore.getById('q1');
    const reloadedCorrections = await correctionStore.getByEventId('event_1');

    expect(reloadedEvent).toEqual(originalEvent);
    expect(reloadedQuestion).toEqual(originalQuestion);
    expect(reloadedCorrections).toHaveLength(0);
  });
});

describe('Retry after failure', () => {
  it('succeeds on a later attempt, with exactly one correction reflecting the true original event', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness({
      makeEventStore: (s) => new ThrowingEventStore(s),
    });
    const originalEvent = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([originalEvent]);
    await clarificationStore.saveMany([makeQuestion({ id: 'q1', eventId: 'event_1' })]);

    await expect(service.answerQuestion({ questionId: 'q1', answer: 'My mother' })).rejects.toThrow();

    // Stop injecting failures and retry.
    (eventStore as InstanceType<typeof ThrowingEventStore>).shouldThrow = false;
    const result = await service.answerQuestion({ questionId: 'q1', answer: 'My mother' });

    expect(result.answeredQuestion.status).toBe('answered');
    expect(result.correction.changes).toEqual([
      { eventId: 'event_1', field: 'participants', previousValue: [], correctedValue: ['My mother'] },
    ]);

    const allCorrections = await correctionStore.getByEventId('event_1');
    expect(allCorrections).toHaveLength(1);

    const reloadedQuestion = await clarificationStore.getById('q1');
    expect(reloadedQuestion?.status).toBe('answered');
  });
});

describe('Time correction audit completeness', () => {
  it('records every field that actually changed and nothing that did not', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: '2026-07-23T09:00:00.000Z' });

    const event = makeEvent({ id: 'event_1', statedTime: null, resolvedTime: null, timePrecision: 'unknown' });
    await eventStore.saveMany([event]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', eventId: 'event_1', category: 'time', targetField: 'statedTime' }),
    ]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'Tuesday morning' });

    const fields = result.correction.changes.map((c) => c.field).sort();
    // statedTime, timePrecision, and resolvedDate all actually changed (null ->
    // value, 'unknown' -> 'relative', null -> the resolved Tuesday); resolvedTime
    // did not change (stayed null), so it must be absent.
    expect(fields).toEqual(['resolvedDate', 'statedTime', 'timePrecision']);
    expect(result.correction.changes.find((c) => c.field === 'timePrecision')?.correctedValue).not.toBe('exact');

    const reloadedCorrections = await correctionStore.getByEventId('event_1');
    expect(reloadedCorrections).toHaveLength(1);
    expect(reloadedCorrections[0].changes.some((c) => c.field === 'resolvedTime')).toBe(false);
  });
});

describe('Sequence correction audit completeness', () => {
  it('records both affected events, keeps indexes unique, and rolls both back on failure', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness();

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

    const changesByEvent = new Map(result.correction.changes.map((c) => [c.eventId, c]));
    expect(changesByEvent.get('event_first')).toEqual({
      eventId: 'event_first',
      field: 'sequenceIndex',
      previousValue: 0,
      correctedValue: 1,
    });
    expect(changesByEvent.get('event_second')).toEqual({
      eventId: 'event_second',
      field: 'sequenceIndex',
      previousValue: 1,
      correctedValue: 0,
    });

    const allEvents = await eventStore.getForEntry('journal_1');
    const indexes = allEvents.map((e) => e.sequenceIndex).sort();
    expect(indexes).toEqual([0, 1]);

    // Now prove a failure at the question-update stage rolls BOTH events back.
    const { eventStore: es2, clarificationStore: cs2, correctionStore: cor2, service: svc2 } = buildReviewHarness({
      makeClarificationStore: (s) => new ThrowingClarificationStore(s),
    });
    const first2 = makeEvent({ id: 'e1', journalEntryId: 'journal_2', sequenceIndex: 0, summary: 'A' });
    const second2 = makeEvent({ id: 'e2', journalEntryId: 'journal_2', sequenceIndex: 1, summary: 'B' });
    await es2.saveMany([first2, second2]);
    const q2 = makeQuestion({
      id: 'q2',
      journalEntryId: 'journal_2',
      eventId: 'e1',
      category: 'sequence',
      targetField: 'sequenceIndex',
      options: [
        { id: 'opt_b_first', label: 'B first', value: 1 },
        { id: 'opt_a_first', label: 'A first', value: 0 },
      ],
    });
    await cs2.saveMany([q2]);

    await expect(svc2.answerQuestion({ questionId: 'q2', answer: '', selectedOptionId: 'opt_b_first' })).rejects.toThrow();

    const reloadedFirst2 = await es2.getById('e1');
    const reloadedSecond2 = await es2.getById('e2');
    expect(reloadedFirst2).toEqual(first2);
    expect(reloadedSecond2).toEqual(second2);
    const corrections2 = await cor2.getByEventId('e1');
    expect(corrections2).toHaveLength(0);
    const reloadedQ2 = await cs2.getById('q2');
    expect(reloadedQ2?.status).toBe('pending');
  });
});

describe('Duplicate protection after a successful correction', () => {
  it('creates no new mutation and leaves exactly one correction on a repeated submission', async () => {
    const { eventStore, clarificationStore, correctionStore, service } = buildReviewHarness();
    const event = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([event]);
    await clarificationStore.saveMany([makeQuestion({ id: 'q1', eventId: 'event_1' })]);

    await service.answerQuestion({ questionId: 'q1', answer: 'My mother' });
    await expect(service.answerQuestion({ questionId: 'q1', answer: 'Someone else' })).rejects.toThrow();

    const reloadedEvent = await eventStore.getById('event_1');
    const reloadedCorrections = await correctionStore.getByEventId('event_1');
    expect(reloadedEvent?.participants).toEqual(['My mother']);
    expect(reloadedCorrections).toHaveLength(1);
  });
});

describe('Rollback failure surfaces a ContextIntegrityError', () => {
  it('throws ContextIntegrityError with the affected record IDs when rollback itself fails', async () => {
    class DoublyThrowingEventStore extends ReconstructedEventStore {
      private callCount = 0;
      async updateMany(events: Parameters<ReconstructedEventStore['updateMany']>[0]): Promise<void> {
        this.callCount += 1;
        if (this.callCount === 1) {
          // Stage 1 succeeds so the correction stage can be reached...
          return super.updateMany(events);
        }
        // ...but the rollback attempt (a second call) fails too.
        throw new Error('rollback also failed');
      }
    }

    const { eventStore, clarificationStore, service } = buildReviewHarness({
      makeEventStore: (s) => new DoublyThrowingEventStore(s),
      makeCorrectionStore: (s) => new ThrowingCorrectionStore(s),
    });
    const event = makeEvent({ id: 'event_1', participants: [] });
    await eventStore.saveMany([event]);
    await clarificationStore.saveMany([makeQuestion({ id: 'q1', eventId: 'event_1' })]);

    await expect(service.answerQuestion({ questionId: 'q1', answer: 'My mother' })).rejects.toThrow(ContextIntegrityError);
  });
});
