import { DefaultEventTimelineService } from '../DefaultEventTimelineService';
import { EventTimelineVisibilityStore, FactCorrectionRecordStore, type ReconstructedEventStore } from '../storage';
import type { EventTimelineService, JournalEntry, OriginalEntryLookup } from '../types';
import { InMemoryDataStore } from './inMemoryDataStore';
import { buildReviewHarness, makeEvent, makeQuestion, type JournalEntryFixture } from './reviewTestHarness';

/**
 * Final Sprint 003 integration pass: a Context Review time correction must
 * update resolvedDate alongside the other time fields, and the Event
 * Timeline must reflect that immediately since it derives its groups from
 * the current event records. These tests wire a real ContextReviewService
 * and a real EventTimelineService against the *same* eventStore and
 * correctionStore instances (as the app does via defaultStores.ts) so a
 * correction made through one is visible through the other.
 */
function buildSharedTimelineService(
  eventStore: ReconstructedEventStore,
  correctionStore: FactCorrectionRecordStore,
  entries: Map<string, JournalEntryFixture>,
): EventTimelineService {
  const visibilityStore = new EventTimelineVisibilityStore(new InMemoryDataStore());
  const entryLookup: OriginalEntryLookup = {
    async getOriginalEntry(journalEntryId: string): Promise<JournalEntry | null> {
      const fixture = entries.get(journalEntryId);
      if (!fixture) return null;
      return { id: journalEntryId, originalText: fixture.text, createdAt: fixture.createdAt, updatedAt: fixture.createdAt };
    },
  };
  return new DefaultEventTimelineService(eventStore, visibilityStore, correctionStore, entryLookup);
}

// A verified real-calendar anchor, consistent with timeResolution.test.ts:
// 2026-07-24 is a Friday, and 2026-07-21 is the Tuesday three days before it.
const JOURNAL_CREATED_AT = '2026-07-24T09:00:00.000Z';

describe('Time correction → resolvedDate → timeline integration', () => {
  test('a date-only correction resolves the date without inventing a clock time, and the timeline regroups the event under the corrected day', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: JOURNAL_CREATED_AT });
    const timelineService = buildSharedTimelineService(eventStore, correctionStore, entries);

    const event = makeEvent({
      id: 'event_1',
      journalEntryId: 'journal_1',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
    });
    await eventStore.saveMany([event]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', journalEntryId: 'journal_1', eventId: 'event_1', category: 'time', targetField: 'statedTime' }),
    ]);

    const before = await timelineService.getVisibleTimeline();
    expect(before).toHaveLength(1);
    expect(before[0].dateKey).toBe('2026-07-24');
    expect(before[0].events[0].datePrecision).toBe('anchored');

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'Tuesday' });
    expect(result.updatedEvent.resolvedDate).toBe('2026-07-21');
    expect(result.updatedEvent.resolvedTime).toBeNull();

    // Only fields that actually changed: resolvedDate and statedTime.
    // timePrecision stays 'unknown' (a bare weekday carries no time-of-day),
    // so it must be absent from the change set.
    const fields = result.correction.changes.map((c) => c.field).sort();
    expect(fields).toEqual(['resolvedDate', 'statedTime']);

    const after = await timelineService.getVisibleTimeline();
    expect(after).toHaveLength(1);
    expect(after[0].dateKey).toBe('2026-07-21');
    expect(after[0].events).toHaveLength(1);
    expect(after[0].events[0].event.id).toBe('event_1');
    expect(after[0].events[0].datePrecision).toBe('exact');
    expect(after[0].events[0].isCorrectedByUser).toBe(true);
  });

  test('a date + vague time-of-day correction resolves the date and keeps a relative time label, without inventing a clock time', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: JOURNAL_CREATED_AT });
    const timelineService = buildSharedTimelineService(eventStore, correctionStore, entries);

    const event = makeEvent({
      id: 'event_1',
      journalEntryId: 'journal_1',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
    });
    await eventStore.saveMany([event]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', journalEntryId: 'journal_1', eventId: 'event_1', category: 'time', targetField: 'statedTime' }),
    ]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'Tuesday afternoon' });
    expect(result.updatedEvent.resolvedDate).toBe('2026-07-21');
    expect(result.updatedEvent.resolvedTime).toBeNull();
    expect(result.updatedEvent.timePrecision).toBe('relative');

    const groups = await timelineService.getVisibleTimeline();
    expect(groups[0].dateKey).toBe('2026-07-21');
    expect(groups[0].events[0].displayTime).toBe('Tuesday afternoon');
  });

  test('an exact date-and-time correction resolves both, and the timeline groups the event under the resolved date with exact precision', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: JOURNAL_CREATED_AT });
    const timelineService = buildSharedTimelineService(eventStore, correctionStore, entries);

    const event = makeEvent({
      id: 'event_1',
      journalEntryId: 'journal_1',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
    });
    await eventStore.saveMany([event]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', journalEntryId: 'journal_1', eventId: 'event_1', category: 'time', targetField: 'statedTime' }),
    ]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'July 21 at 3:00 PM' });
    expect(result.updatedEvent.resolvedDate).toBe('2026-07-21');
    expect(result.updatedEvent.resolvedTime).not.toBeNull();
    expect(result.updatedEvent.resolvedTime!.slice(0, 10)).toBe('2026-07-21');
    expect(result.updatedEvent.timePrecision).toBe('exact');

    const groups = await timelineService.getVisibleTimeline();
    expect(groups).toHaveLength(1);
    expect(groups[0].dateKey).toBe('2026-07-21');
    expect(groups[0].events[0].datePrecision).toBe('exact');
  });

  test('a time-only correction preserves an existing resolved date instead of erasing it', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: JOURNAL_CREATED_AT });
    const timelineService = buildSharedTimelineService(eventStore, correctionStore, entries);

    const event = makeEvent({
      id: 'event_1',
      journalEntryId: 'journal_1',
      statedTime: 'morning',
      resolvedTime: null,
      timePrecision: 'relative',
      resolvedDate: '2026-07-21',
    });
    await eventStore.saveMany([event]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', journalEntryId: 'journal_1', eventId: 'event_1', category: 'time', targetField: 'statedTime' }),
    ]);

    const result = await service.answerQuestion({ questionId: 'q1', answer: 'afternoon' });
    expect(result.updatedEvent.resolvedDate).toBe('2026-07-21');
    expect(result.updatedEvent.statedTime).toBe('afternoon');
    expect(result.updatedEvent.timePrecision).toBe('relative');

    // resolvedDate did not change, so it must be absent from the audit trail.
    const fields = result.correction.changes.map((c) => c.field);
    expect(fields).toContain('statedTime');
    expect(fields).not.toContain('resolvedDate');

    const groups = await timelineService.getVisibleTimeline();
    expect(groups[0].dateKey).toBe('2026-07-21');
  });

  test('timeline regrouping: the corrected event leaves its old day, appears exactly once under the corrected day, and visibility state stays attached to the same event id', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness();
    entries.set('journal_1', { text: 'Something happened.', createdAt: JOURNAL_CREATED_AT });
    entries.set('journal_2', { text: 'Something else happened.', createdAt: JOURNAL_CREATED_AT });
    const timelineService = buildSharedTimelineService(eventStore, correctionStore, entries);

    const eventToCorrect = makeEvent({
      id: 'event_1',
      journalEntryId: 'journal_1',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
      sequenceIndex: 0,
    });
    const otherEvent = makeEvent({
      id: 'event_2',
      journalEntryId: 'journal_2',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
      sequenceIndex: 0,
    });
    await eventStore.saveMany([eventToCorrect, otherEvent]);
    await clarificationStore.saveMany([
      makeQuestion({ id: 'q1', journalEntryId: 'journal_1', eventId: 'event_1', category: 'time', targetField: 'statedTime' }),
    ]);

    // Hide event_1 *before* correcting it, to prove visibility survives the regroup.
    await timelineService.hideEvent('event_1');

    const beforeVisible = await timelineService.getVisibleTimeline();
    expect(beforeVisible.flatMap((g) => g.events.map((e) => e.event.id))).toEqual(['event_2']);

    await service.answerQuestion({ questionId: 'q1', answer: 'Tuesday' });

    const afterVisible = await timelineService.getVisibleTimeline();
    const visibleIds = afterVisible.flatMap((g) => g.events.map((e) => e.event.id));
    expect(visibleIds).toEqual(['event_2']);
    expect(visibleIds).not.toContain('event_1');

    const afterHidden = await timelineService.getHiddenEvents();
    const hiddenIds = afterHidden.flatMap((g) => g.events.map((e) => e.event.id));
    expect(hiddenIds).toEqual(['event_1']);
    expect(afterHidden[0].dateKey).toBe('2026-07-21');
  });
});

class ThrowingCorrectionStore extends FactCorrectionRecordStore {
  async create(correction: Parameters<FactCorrectionRecordStore['create']>[0]) {
    if (this.shouldThrow) throw new Error('correction store write failed');
    return super.create(correction);
  }
  shouldThrow = true;
}

describe('Failed date correction rollback', () => {
  test('rolls back resolvedDate along with every other time field when the write fails after the event mutation', async () => {
    const { eventStore, clarificationStore, correctionStore, entries, service } = buildReviewHarness({
      makeCorrectionStore: (s) => new ThrowingCorrectionStore(s),
    });
    entries.set('journal_1', { text: 'Something happened.', createdAt: JOURNAL_CREATED_AT });

    const originalEvent = makeEvent({
      id: 'event_1',
      journalEntryId: 'journal_1',
      statedTime: null,
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: null,
    });
    await eventStore.saveMany([originalEvent]);
    const originalQuestion = makeQuestion({
      id: 'q1',
      journalEntryId: 'journal_1',
      eventId: 'event_1',
      category: 'time',
      targetField: 'statedTime',
    });
    await clarificationStore.saveMany([originalQuestion]);

    await expect(service.answerQuestion({ questionId: 'q1', answer: 'Tuesday' })).rejects.toThrow('correction store write failed');

    const reloadedEvent = await eventStore.getById('event_1');
    expect(reloadedEvent).toEqual(originalEvent);
    expect(reloadedEvent?.resolvedDate).toBeNull();

    const reloadedQuestion = await clarificationStore.getById('q1');
    expect(reloadedQuestion?.status).toBe('pending');

    const corrections = await correctionStore.getByEventId('event_1');
    expect(corrections).toHaveLength(0);
  });
});
