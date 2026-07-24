export * from './types';
export * from './schema';
export {
  JournalEntryStore,
  ReconstructedEventStore,
  ClarificationQuestionStore,
  ExtractionRecordStore,
  FactCorrectionRecordStore,
} from './storage';
export { LocalContextExtractionProvider } from './LocalContextExtractionProvider';
export { DefaultContextEngine } from './DefaultContextEngine';
export { DefaultContextReviewService } from './DefaultContextReviewService';
export { ContextReviewError } from './ContextReviewError';
export type { ContextReviewErrorCode } from './ContextReviewError';
export { buildCorrectedSummary, resolveCorrectedTime, buildJournalExcerpt } from './correctionHelpers';
export { validateProviderResult } from './validation';
export { BANNED_INTERPRETIVE_PHRASES, containsBannedPhrase } from './bannedPhrases';
export {
  journalEntryStore,
  reconstructedEventStore,
  clarificationQuestionStore,
  extractionRecordStore,
  factCorrectionStore,
  originalEntryLookup,
} from './defaultStores';
export { saveJournalEntry } from './saveJournalEntry';
export { contextJournalAdapter } from './adapter';
export type { ContextJournalAdapter } from './adapter';
export { triggerContextExtraction } from './integration';
export { CONTEXT_ENGINE_VERSION } from './engineVersion';

import { LocalContextExtractionProvider } from './LocalContextExtractionProvider';
import { DefaultContextEngine } from './DefaultContextEngine';
import { DefaultContextReviewService } from './DefaultContextReviewService';
import {
  reconstructedEventStore,
  clarificationQuestionStore,
  extractionRecordStore,
  factCorrectionStore,
  originalEntryLookup,
} from './defaultStores';
import type { ContextEngine, ContextReviewService } from './types';

/** Default wiring: local rule-based provider today, swappable later without call-site changes. */
export const contextEngine: ContextEngine = new DefaultContextEngine(
  new LocalContextExtractionProvider(),
  reconstructedEventStore,
  clarificationQuestionStore,
  extractionRecordStore,
);

/** Sprint 002 — Context Review service, wired against the same real stores as contextEngine. */
export const contextReviewService: ContextReviewService = new DefaultContextReviewService(
  clarificationQuestionStore,
  reconstructedEventStore,
  factCorrectionStore,
  originalEntryLookup,
);
