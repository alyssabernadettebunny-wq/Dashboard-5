import { EventTimelineVisibilityStore } from '../storage';
import { compareTimelineEvents } from '../timelineHelpers';
import type { FactCorrection } from '../types';
import { buildTimelineHarness, makeJournalEntry, makeTimelineEvent } from './timelineTestHarness';

describe('Event Timeline — chronological ordering', () => {
  test('exact-time events sort ascending by resolved time, before approximate/relative and unknown', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1' });
    entries.set(entry.id, entry);

    const later = makeTimelineEvent({
      journalEntryId: entry.id,
      summary: 'Later exact event.',
      resolvedTime: '2026-07-23T15:00:00.000Z',
      timePrecision: 'exact',
      sequenceIndex: 0,
    });
    const earlier = makeTimelineEvent({
      journalEntryId: entry.id,
      summary: 'Earlier exact event.',
      resolvedTime: '2026-07-23T09:00:00.000Z',
      timePrecision: 'exact',
      sequenceIndex: 1,
    });
    const relative = makeTimelineEvent({
      journalEntryId: entry.id,
      summary: 'Relative event.',
      statedTime: 'this morning',
      timePrecision: 'relative',
      sequenceIndex: 2,
    });
    const unknown = makeTimelineEvent({
      journalEntryId: entry.id,
      summary: 'Unknown-time event.',
      timePrecision: 'unknown',
      sequenceIndex: 3,
    });

    await eventStore.saveMany([later, relative, unknown, earlier]);

    const groups = await service.getVisibleTimeline();
    expect(groups).toHaveLength(1);
    expect(groups[0].events.map((e) => e.event.summary)).toEqual([
      'Earlier exact event.',
      'Later exact event.',
      'Relative event.',
      'Unknown-time event.',
    ]);
  });

  test('within a tier, ties break by sequenceIndex, then createdAt, then id', () => {
    const a = makeTimelineEvent({ id: 'a', timePrecision: 'unknown', sequenceIndex: 1, createdAt: '2026-07-23T08:00:00.000Z' });
    const b = makeTimelineEvent({ id: 'b', timePrecision: 'unknown', sequenceIndex: 0, createdAt: '2026-07-23T08:00:00.000Z' });
    expect(compareTimelineEvents(a, b)).toBeGreaterThan(0);

    const c = makeTimelineEvent({ id: 'c', timePrecision: 'unknown', sequenceIndex: 0, createdAt: '2026-07-23T09:00:00.000Z' });
    const d = makeTimelineEvent({ id: 'd', timePrecision: 'unknown', sequenceIndex: 0, createdAt: '2026-07-23T08:00:00.000Z' });
    expect(compareTimelineEvents(c, d)).toBeGreaterThan(0);

    const e = makeTimelineEvent({ id: 'e', timePrecision: 'unknown', sequenceIndex: 0, createdAt: '2026-07-23T08:00:00.000Z' });
    const f = makeTimelineEvent({ id: 'f', timePrecision: 'unknown', sequenceIndex: 0, createdAt: '2026-07-23T08:00:00.000Z' });
    expect(compareTimelineEvents(e, f)).toBeLessThan(0);
  });
});

describe('Event Timeline — day grouping', () => {
  test('an event with an exact resolved time groups under its own date, even when different from the journal entry date', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1', createdAt: '2026-07-23T08:00:00.000Z' });
    entries.set(entry.id, entry);

    const differentDayEvent = makeTimelineEvent({
      journalEntryId: entry.id,
      resolvedTime: '2026-07-20T09:00:00.000Z',
      timePrecision: 'exact',
      resolvedDate: '2026-07-20',
    });
    await eventStore.saveMany([differentDayEvent]);

    const groups = await service.getVisibleTimeline();
    expect(groups).toHaveLength(1);
    expect(groups[0].dateKey).toBe('2026-07-20');
    expect(groups[0].events[0].datePrecision).toBe('exact');
  });

  test('an event with no resolvable time anchors to the journal entry\'s own date', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1', createdAt: '2026-07-23T08:00:00.000Z' });
    entries.set(entry.id, entry);

    const unresolvedEvent = makeTimelineEvent({ journalEntryId: entry.id, timePrecision: 'unknown' });
    await eventStore.saveMany([unresolvedEvent]);

    const groups = await service.getVisibleTimeline();
    expect(groups).toHaveLength(1);
    expect(groups[0].dateKey).toBe('2026-07-23');
    expect(groups[0].events[0].datePrecision).toBe('anchored');
  });

  test('a known day with unknown time-of-day still groups under its own resolved date, not the journal entry\'s date — date certainty and time precision are independent', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1', createdAt: '2026-07-24T08:00:00.000Z' });
    entries.set(entry.id, entry);

    // "On Tuesday, Mom called." — a day is safely known (resolvedDate), but
    // the clock time is not (timePrecision stays 'unknown'). This must NOT
    // be conflated with "no date known at all".
    const knownDayUnknownTime = makeTimelineEvent({
      journalEntryId: entry.id,
      summary: "The user's mother called.",
      statedTime: 'Tuesday',
      resolvedTime: null,
      timePrecision: 'unknown',
      resolvedDate: '2026-07-21',
    });
    await eventStore.saveMany([knownDayUnknownTime]);

    const groups = await service.getVisibleTimeline();
    expect(groups).toHaveLength(1);
    expect(groups[0].dateKey).toBe('2026-07-21');
    expect(groups[0].events[0].datePrecision).toBe('exact');
    expect(groups[0].events[0].displayTime).toBe('Time not recorded');
  });

  test('a known day with a vague (relative) time-of-day groups under its resolved date and preserves the stated phrase, without inventing a clock time', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1', createdAt: '2026-07-24T08:00:00.000Z' });
    entries.set(entry.id, entry);

    const knownDayVagueTime = makeTimelineEvent({
      journalEntryId: entry.id,
      summary: "The user's mother called.",
      statedTime: 'Tuesday afternoon',
      resolvedTime: null,
      timePrecision: 'relative',
      resolvedDate: '2026-07-21',
    });
    await eventStore.saveMany([knownDayVagueTime]);

    const groups = await service.getVisibleTimeline();
    expect(groups).toHaveLength(1);
    expect(groups[0].dateKey).toBe('2026-07-21');
    expect(groups[0].events[0].datePrecision).toBe('exact');
    expect(groups[0].events[0].displayTime).toBe('Tuesday afternoon');
  });

  test('day groups list most-recent day first', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const olderEntry = makeJournalEntry({ id: 'journal_old', createdAt: '2026-07-20T08:00:00.000Z' });
    const newerEntry = makeJournalEntry({ id: 'journal_new', createdAt: '2026-07-23T08:00:00.000Z' });
    entries.set(olderEntry.id, olderEntry);
    entries.set(newerEntry.id, newerEntry);

    await eventStore.saveMany([
      makeTimelineEvent({ journalEntryId: olderEntry.id, timePrecision: 'unknown' }),
      makeTimelineEvent({ journalEntryId: newerEntry.id, timePrecision: 'unknown' }),
    ]);

    const groups = await service.getVisibleTimeline();
    expect(groups.map((g) => g.dateKey)).toEqual(['2026-07-23', '2026-07-20']);
  });
});

describe('Event Timeline — corrected marker', () => {
  test('an event touched by a FactCorrection (as top-level eventId or a change eventId) is marked isCorrectedByUser', async () => {
    const { eventStore, correctionStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1' });
    entries.set(entry.id, entry);

    const correctedEvent = makeTimelineEvent({ journalEntryId: entry.id, id: 'event_corrected' });
    const untouchedEvent = makeTimelineEvent({ journalEntryId: entry.id, id: 'event_untouched', sequenceIndex: 1 });
    await eventStore.saveMany([correctedEvent, untouchedEvent]);

    const correction: FactCorrection = {
      id: 'correction_1',
      journalEntryId: entry.id,
      eventId: 'event_corrected',
      clarificationQuestionId: 'question_1',
      category: 'participant',
      changes: [{ eventId: 'event_corrected', field: 'participants', previousValue: [], correctedValue: ['Amy'] }],
      source: 'user',
      createdAt: '2026-07-23T08:00:00.000Z',
    };
    await correctionStore.create(correction);

    const groups = await service.getVisibleTimeline();
    const byId = new Map(groups[0].events.map((e) => [e.event.id, e]));
    expect(byId.get('event_corrected')?.isCorrectedByUser).toBe(true);
    expect(byId.get('event_untouched')?.isCorrectedByUser).toBe(false);
  });
});

describe('Event Timeline — hide, restore, and visibility', () => {
  test('hiding an event removes it from the visible timeline and surfaces it in hidden events, without deleting it', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1' });
    entries.set(entry.id, entry);
    const event = makeTimelineEvent({ journalEntryId: entry.id, id: 'event_1' });
    await eventStore.saveMany([event]);

    await service.hideEvent('event_1');

    const visible = await service.getVisibleTimeline();
    expect(visible).toHaveLength(0);

    const hidden = await service.getHiddenEvents();
    expect(hidden).toHaveLength(1);
    expect(hidden[0].events[0].event.id).toBe('event_1');
    expect(hidden[0].events[0].isHidden).toBe(true);

    const stillStored = await eventStore.getById('event_1');
    expect(stillStored).not.toBeNull();
  });

  test('restoring a hidden event returns it to the visible timeline', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1' });
    entries.set(entry.id, entry);
    const event = makeTimelineEvent({ journalEntryId: entry.id, id: 'event_1' });
    await eventStore.saveMany([event]);

    await service.hideEvent('event_1');
    await service.restoreEvent('event_1');

    const visible = await service.getVisibleTimeline();
    expect(visible).toHaveLength(1);
    expect(visible[0].events[0].isHidden).toBe(false);

    const hidden = await service.getHiddenEvents();
    expect(hidden).toHaveLength(0);
  });

  test('hide() is idempotent at the storage layer: hiding an already-hidden event does not overwrite its original hiddenAt', async () => {
    const { visibilityStore } = buildTimelineHarness();
    const first = await visibilityStore.hide('event_1', '2026-07-23T08:00:00.000Z');
    const second = await visibilityStore.hide('event_1', '2026-07-23T09:00:00.000Z');

    expect(first.hiddenAt).toBe('2026-07-23T08:00:00.000Z');
    expect(second.hiddenAt).toBe('2026-07-23T08:00:00.000Z');
    expect(second).toEqual(first);
  });

  test('restore() is idempotent at the storage layer: restoring an already-visible (or never-hidden) event is a no-op', async () => {
    const { visibilityStore } = buildTimelineHarness();
    const neverHidden = await visibilityStore.restore('event_never_hidden', '2026-07-23T08:00:00.000Z');
    expect(neverHidden.isHidden).toBe(false);

    await visibilityStore.hide('event_2', '2026-07-23T08:00:00.000Z');
    const firstRestore = await visibilityStore.restore('event_2', '2026-07-23T09:00:00.000Z');
    const secondRestore = await visibilityStore.restore('event_2', '2026-07-23T10:00:00.000Z');

    expect(firstRestore.restoredAt).toBe('2026-07-23T09:00:00.000Z');
    expect(secondRestore).toEqual(firstRestore);
  });

  test('hideEvent throws for an unknown event id and does not create a visibility record', async () => {
    const { service, visibilityStore } = buildTimelineHarness();
    await expect(service.hideEvent('does-not-exist')).rejects.toThrow();
    expect(await visibilityStore.getByEventId('does-not-exist')).toBeNull();
  });

  test('a hidden state survives a freshly constructed EventTimelineVisibilityStore over the same underlying data (simulated reload)', async () => {
    const { store, visibilityStore } = buildTimelineHarness();
    await visibilityStore.hide('event_1', '2026-07-23T08:00:00.000Z');

    // A brand-new repository instance, not the same object — this is what a
    // real app restart looks like: a fresh store wrapping the same persisted
    // AsyncStorage-backed data.
    const reloaded = new EventTimelineVisibilityStore(store);
    const record = await reloaded.getByEventId('event_1');
    expect(record?.isHidden).toBe(true);
    expect(record?.hiddenAt).toBe('2026-07-23T08:00:00.000Z');
  });

  test('a restored state survives a freshly constructed EventTimelineVisibilityStore over the same underlying data (simulated reload)', async () => {
    const { store, visibilityStore } = buildTimelineHarness();
    await visibilityStore.hide('event_1', '2026-07-23T08:00:00.000Z');
    await visibilityStore.restore('event_1', '2026-07-23T09:00:00.000Z');

    const reloaded = new EventTimelineVisibilityStore(store);
    const record = await reloaded.getByEventId('event_1');
    expect(record?.isHidden).toBe(false);
    expect(record?.restoredAt).toBe('2026-07-23T09:00:00.000Z');
  });
});

describe('Event Timeline — source context', () => {
  test('getSourceContext returns the cited passage, full journal entry, and corrected flag', async () => {
    const { eventStore, correctionStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1', originalText: 'I met Amy for coffee. It was nice.' });
    entries.set(entry.id, entry);
    const event = makeTimelineEvent({
      journalEntryId: entry.id,
      id: 'event_1',
      source: { text: 'I met Amy for coffee.', startIndex: 0, endIndex: 21 },
    });
    await eventStore.saveMany([event]);

    const context = await service.getSourceContext('event_1');
    expect(context.sourcePassage.text).toBe('I met Amy for coffee.');
    expect(context.journalEntry.originalText).toBe('I met Amy for coffee. It was nice.');
    expect(context.isCorrectedByUser).toBe(false);

    await correctionStore.create({
      id: 'correction_1',
      journalEntryId: entry.id,
      eventId: 'event_1',
      clarificationQuestionId: 'question_1',
      category: 'participant',
      changes: [{ eventId: 'event_1', field: 'participants', previousValue: [], correctedValue: ['Amy'] }],
      source: 'user',
      createdAt: '2026-07-23T08:00:00.000Z',
    });

    const updatedContext = await service.getSourceContext('event_1');
    expect(updatedContext.isCorrectedByUser).toBe(true);
  });

  test('getSourceContext throws for an unknown event id', async () => {
    const { service } = buildTimelineHarness();
    await expect(service.getSourceContext('does-not-exist')).rejects.toThrow();
  });

  test('the reconstructed summary and the cited source passage are kept as distinct values, never merged into one label', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1', originalText: 'I met Amy for coffee. It was nice.' });
    entries.set(entry.id, entry);
    const event = makeTimelineEvent({
      journalEntryId: entry.id,
      id: 'event_1',
      summary: 'The user met Amy for coffee.',
      source: { text: 'I met Amy for coffee.', startIndex: 0, endIndex: 21 },
    });
    await eventStore.saveMany([event]);

    const context = await service.getSourceContext('event_1');
    expect(context.event.summary).toBe('The user met Amy for coffee.');
    expect(context.sourcePassage.text).toBe('I met Amy for coffee.');
    expect(context.event.summary).not.toBe(context.sourcePassage.text);
  });

  test('a hidden event still returns full source context — hiding never removes source access', async () => {
    const { eventStore, entries, service } = buildTimelineHarness();
    const entry = makeJournalEntry({ id: 'journal_1', originalText: 'I met Amy for coffee. It was nice.' });
    entries.set(entry.id, entry);
    const event = makeTimelineEvent({
      journalEntryId: entry.id,
      id: 'event_1',
      source: { text: 'I met Amy for coffee.', startIndex: 0, endIndex: 21 },
    });
    await eventStore.saveMany([event]);

    await service.hideEvent('event_1');

    const context = await service.getSourceContext('event_1');
    expect(context.sourcePassage.text).toBe('I met Amy for coffee.');
    expect(context.journalEntry.originalText).toBe('I met Amy for coffee. It was nice.');
  });
});

describe('Event Timeline — evidence integrity', () => {
  test('an event whose journal entry can no longer be found is excluded rather than shown without its evidence', async () => {
    const { eventStore, service } = buildTimelineHarness();
    // Deliberately not registered in `entries`, simulating a missing/deleted source entry.
    const orphanEvent = makeTimelineEvent({ journalEntryId: 'missing_journal' });
    await eventStore.saveMany([orphanEvent]);

    const groups = await service.getVisibleTimeline();
    expect(groups).toHaveLength(0);
  });

  test('empty state: no events at all produces an empty group list', async () => {
    const { service } = buildTimelineHarness();
    expect(await service.getVisibleTimeline()).toEqual([]);
    expect(await service.getHiddenEvents()).toEqual([]);
  });
});
