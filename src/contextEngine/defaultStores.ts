import { dataStore } from '@/storage/AsyncStorageDataStore';
import { entryRepository } from '@/storage';
import {
  ClarificationQuestionStore,
  EventTimelineVisibilityStore,
  ExtractionRecordStore,
  FactCorrectionRecordStore,
  JournalEntryStore,
  ReconstructedEventStore,
} from './storage';
import type { OriginalEntryLookup } from './types';

/**
 * The app's real, AsyncStorage-backed store instances. Kept in their own file
 * (separate from storage.ts's pure repository classes) so unit tests can
 * import the classes directly with an in-memory DataStore without ever
 * loading the native AsyncStorage module.
 */
export const journalEntryStore = new JournalEntryStore(dataStore);
export const reconstructedEventStore = new ReconstructedEventStore(dataStore);
export const clarificationQuestionStore = new ClarificationQuestionStore(dataStore);
export const extractionRecordStore = new ExtractionRecordStore(dataStore);
export const factCorrectionStore = new FactCorrectionRecordStore(dataStore);
export const eventTimelineVisibilityStore = new EventTimelineVisibilityStore(dataStore);

/**
 * Bridges to the app's real journal entries for display purposes only
 * (inbox excerpt, "View original entry"). The Context Engine never keeps
 * its own copy of a real entry's text — this just reads it.
 */
export const originalEntryLookup: OriginalEntryLookup = {
  async getOriginalEntry(journalEntryId: string) {
    const entries = await entryRepository.getAll();
    const entry = entries.find((e) => e.id === journalEntryId);
    if (!entry) return null;
    return { id: entry.id, originalText: entry.text, createdAt: entry.createdAt, updatedAt: entry.updatedAt };
  },
};
