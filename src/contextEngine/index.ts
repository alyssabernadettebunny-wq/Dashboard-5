export * from './types';
export * from './schema';
export { JournalEntryStore, ReconstructedEventStore, ClarificationQuestionStore } from './storage';
export { LocalContextExtractionProvider } from './LocalContextExtractionProvider';
export { DefaultContextEngine } from './DefaultContextEngine';
export { validateProviderResult } from './validation';
export { BANNED_INTERPRETIVE_PHRASES, containsBannedPhrase } from './bannedPhrases';
export { journalEntryStore, reconstructedEventStore, clarificationQuestionStore } from './defaultStores';
export { saveJournalEntry } from './saveJournalEntry';

import { LocalContextExtractionProvider } from './LocalContextExtractionProvider';
import { DefaultContextEngine } from './DefaultContextEngine';
import { reconstructedEventStore, clarificationQuestionStore } from './defaultStores';
import type { ContextEngine } from './types';

/** Default wiring: local rule-based provider today, swappable later without call-site changes. */
export const contextEngine: ContextEngine = new DefaultContextEngine(
  new LocalContextExtractionProvider(),
  reconstructedEventStore,
  clarificationQuestionStore,
);
