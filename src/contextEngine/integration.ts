import type { JournalEntry as AppJournalEntry } from '@/models';
import { logger } from '@/utils/logger';
import { contextJournalAdapter } from './adapter';
import type { ContextEngine } from './types';

/**
 * The single integration point between the app's real journal-entry save
 * flow and the Context Engine. Called by AppDataContext.createEntry right
 * after the canonical entry is persisted — never before, never in a way
 * that blocks the caller.
 *
 * Fire-and-forget by design: this function returns immediately (it is not
 * async and returns nothing for the caller to await), so a slow or failing
 * extraction can never delay or fail the save the user just performed.
 * Failures are caught and logged here, not surfaced to the journaling UI.
 */
export function triggerContextExtraction(entry: AppJournalEntry, engine: ContextEngine): void {
  const contextEntry = contextJournalAdapter.toContextEntry(entry);
  void engine.extractFromJournalEntry(contextEntry).catch((error) => {
    logger.error('Context extraction failed for journal entry', { entryId: entry.id, error });
  });
}
