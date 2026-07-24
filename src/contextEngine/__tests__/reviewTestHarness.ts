import { generateId } from '@/models/ids';
import { DefaultContextReviewService } from '../DefaultContextReviewService';
import { ClarificationQuestionStore, FactCorrectionRecordStore, ReconstructedEventStore } from '../storage';
import type { ClarificationQuestion, ContextReviewService, OriginalEntryLookup, ReconstructedEvent } from '../types';

export interface JournalEntryFixture {
  text: string;
  createdAt: string;
}
import { InMemoryDataStore } from './inMemoryDataStore';

export interface ReviewHarnessFactories {
  makeEventStore?: (store: InMemoryDataStore) => ReconstructedEventStore;
  makeClarificationStore?: (store: InMemoryDataStore) => ClarificationQuestionStore;
  makeCorrectionStore?: (store: InMemoryDataStore) => FactCorrectionRecordStore;
}

export function buildReviewHarness(factories: ReviewHarnessFactories = {}) {
  const store = new InMemoryDataStore();
  const eventStore = (factories.makeEventStore ?? ((s) => new ReconstructedEventStore(s)))(store);
  const clarificationStore = (factories.makeClarificationStore ?? ((s) => new ClarificationQuestionStore(s)))(store);
  const correctionStore = (factories.makeCorrectionStore ?? ((s) => new FactCorrectionRecordStore(s)))(store);

  const entries = new Map<string, JournalEntryFixture>();
  const entryLookup: OriginalEntryLookup = {
    async getOriginalEntry(journalEntryId: string) {
      const fixture = entries.get(journalEntryId);
      if (!fixture) return null;
      return { id: journalEntryId, originalText: fixture.text, createdAt: fixture.createdAt, updatedAt: fixture.createdAt };
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
