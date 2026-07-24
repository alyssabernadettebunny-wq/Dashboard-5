import { generateId } from '@/models/ids';
import { DefaultContextReviewService } from '../DefaultContextReviewService';
import { ClarificationQuestionStore, FactCorrectionRecordStore, ReconstructedEventStore } from '../storage';
import type { ClarificationQuestion, ContextReviewService, OriginalEntryLookup, ReconstructedEvent } from '../types';
import { InMemoryDataStore } from './inMemoryDataStore';

export function buildReviewHarness(makeEventStore: (store: InMemoryDataStore) => ReconstructedEventStore = (s) => new ReconstructedEventStore(s)) {
  const store = new InMemoryDataStore();
  const eventStore = makeEventStore(store);
  const clarificationStore = new ClarificationQuestionStore(store);
  const correctionStore = new FactCorrectionRecordStore(store);

  const entries = new Map<string, { text: string; createdAt: string }>();
  const entryLookup: OriginalEntryLookup = {
    async getOriginalEntry(journalEntryId: string) {
      return entries.get(journalEntryId) ?? null;
    },
  };

  const service: ContextReviewService = new DefaultContextReviewService(clarificationStore, eventStore, correctionStore, entryLookup);

  return { eventStore, clarificationStore, correctionStore, entries, service };
}

export function makeEvent(overrides: Partial<ReconstructedEvent> = {}): ReconstructedEvent {
  const now = '2026-07-23T12:00:00.000Z';
  return {
    id: generateId('event'),
    journalEntryId: 'journal_1',
    summary: 'The user missed the appointment.',
    statedTime: null,
    resolvedTime: null,
    timePrecision: 'unknown',
    participants: [],
    sequenceIndex: 0,
    source: { text: 'The user missed the appointment.', startIndex: 0, endIndex: 33 },
    needsClarification: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function makeQuestion(overrides: Partial<ClarificationQuestion> = {}): ClarificationQuestion {
  const now = '2026-07-23T12:00:00.000Z';
  return {
    id: generateId('clarification'),
    journalEntryId: 'journal_1',
    eventId: 'event_1',
    question: 'Who did "her" refer to?',
    reason: 'Unnamed participant.',
    category: 'participant',
    targetField: 'participants',
    options: null,
    status: 'pending',
    answer: null,
    createdAt: now,
    answeredAt: null,
    dismissedAt: null,
    ...overrides,
  };
}
