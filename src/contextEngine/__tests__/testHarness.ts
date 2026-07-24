import { generateId } from '@/models/ids';
import { DefaultContextEngine } from '../DefaultContextEngine';
import { LocalContextExtractionProvider } from '../LocalContextExtractionProvider';
import { ClarificationQuestionStore, ExtractionRecordStore, JournalEntryStore, ReconstructedEventStore } from '../storage';
import type { ContextEngine, ContextExtractionProvider, JournalEntry } from '../types';
import { InMemoryDataStore } from './inMemoryDataStore';

export function buildEngine(provider: ContextExtractionProvider = new LocalContextExtractionProvider()) {
  const store = new InMemoryDataStore();
  const journalEntryStore = new JournalEntryStore(store);
  const eventStore = new ReconstructedEventStore(store);
  const clarificationStore = new ClarificationQuestionStore(store);
  const extractionRecordStore = new ExtractionRecordStore(store);
  const engine: ContextEngine = new DefaultContextEngine(provider, eventStore, clarificationStore, extractionRecordStore);
  return { journalEntryStore, eventStore, clarificationStore, extractionRecordStore, engine };
}

export function makeEntry(text: string, createdAt = '2026-07-23T12:00:00.000Z'): JournalEntry {
  return {
    id: generateId('journal'),
    originalText: text,
    createdAt,
    updatedAt: createdAt,
  };
}
