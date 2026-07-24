export * from './types';
export * from './schema';
export { JournalEntryStore, ReconstructedEventStore, ClarificationQuestionStore, ExtractionRecordStore } from './storage';
export { LocalContextExtractionProvider } from './LocalContextExtractionProvider';
export { DefaultContextEngine } from './DefaultContextEngine';
export { validateProviderResult } from './validation';
export { BANNED_INTERPRETIVE_PHRASES, containsBannedPhrase } from './bannedPhrases';
export { journalEntryStore, reconstructedEventStore, clarificationQuestionStore, extractionRecordStore } from './defaultStores';
export { saveJournalEntry } from './saveJournalEntry';
export { contextJournalAdapter } from './adapter';
export type { ContextJournalAdapter } from './adapter';
export { triggerContextExtraction } from './integration';
export { CONTEXT_ENGINE_VERSION } from './engineVersion';

import { LocalContextExtractionProvider } from './LocalContextExtractionProvider';
import { DefaultContextEngine } from './DefaultContextEngine';
import { reconstructedEventStore, clarificationQuestionStore, extractionRecordStore } from './defaultStores';
import type { ContextEngine } from './types';

/** Default wiring: local rule-based provider today, swappable later without call-site changes. */
export const contextEngine: ContextEngine = new DefaultContextEngine(
  new LocalContextExtractionProvider(),
  reconstructedEventStore,
  clarificationQuestionStore,
  extractionRecordStore,
);
