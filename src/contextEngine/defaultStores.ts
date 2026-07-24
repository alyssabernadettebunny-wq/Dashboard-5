import { dataStore } from '@/storage/AsyncStorageDataStore';
import { ClarificationQuestionStore, JournalEntryStore, ReconstructedEventStore } from './storage';

/**
 * The app's real, AsyncStorage-backed store instances. Kept in their own file
 * (separate from storage.ts's pure repository classes) so unit tests can
 * import the classes directly with an in-memory DataStore without ever
 * loading the native AsyncStorage module.
 */
export const journalEntryStore = new JournalEntryStore(dataStore);
export const reconstructedEventStore = new ReconstructedEventStore(dataStore);
export const clarificationQuestionStore = new ClarificationQuestionStore(dataStore);
