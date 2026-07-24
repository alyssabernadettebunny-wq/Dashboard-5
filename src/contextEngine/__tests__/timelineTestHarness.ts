import { generateId } from '@/models/ids';
import { DefaultEventTimelineService } from '../DefaultEventTimelineService';
import { EventTimelineVisibilityStore, FactCorrectionRecordStore, ReconstructedEventStore } from '../storage';
import type { EventTimelineService, JournalEntry, OriginalEntryLookup, ReconstructedEvent } from '../types';
import { InMemoryDataStore } from './inMemoryDataStore';

export interface JournalEntryFixture {
  id: string;
  originalText: string;
  createdAt: string;
  updatedAt: string;
}

export function buildTimelineHarness() {
  const store = new InMemoryDataStore();
  const eventStore = new ReconstructedEventStore(store);
  const visibilityStore = new EventTimelineVisibilityStore(store);
  const correctionStore = new FactCorrectionRecordStore(store);

  const entries = new Map<string, JournalEntryFixture>();
  const entryLookup: OriginalEntryLookup = {
    async getOriginalEntry(journalEntryId: string): Promise<JournalEntry | null> {
      return entries.get(journalEntryId) ?? null;
    },
  };

  const service: EventTimelineService = new DefaultEventTimelineService(eventStore, visibilityStore, correctionStore, entryLookup);

  return { eventStore, visibilityStore, correctionStore, entries, service };
}

export function makeJournalEntry(overrides: Partial<JournalEntryFixture> = {}): JournalEntryFixture {
  return {
    id: generateId('entry'),
    originalText: 'Something happened.',
    createdAt: '2026-07-23T08:00:00.000Z',
    updatedAt: '2026-07-23T08:00:00.000Z',
    ...overrides,
  };
}

export function makeTimelineEvent(overrides: Partial<ReconstructedEvent> = {}): ReconstructedEvent {
  const now = '2026-07-23T08:00:00.000Z';
  return {
    id: generateId('event'),
    journalEntryId: 'journal_1',
    summary: 'The user did something.',
    statedTime: null,
    resolvedTime: null,
    timePrecision: 'unknown',
    participants: [],
    sequenceIndex: 0,
    source: { text: 'Something happened.', startIndex: 0, endIndex: 20 },
    needsClarification: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
