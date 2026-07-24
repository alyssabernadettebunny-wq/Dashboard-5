import type { JournalEntry as AppJournalEntry } from '@/models';
import type { JournalEntry as ContextJournalEntry } from './types';

/**
 * Bridges the app's real, UI-facing JournalEntry (src/models/JournalEntry.ts —
 * title, tags, importance, connected patterns) to the Context Engine's own,
 * narrower JournalEntry shape. This is intentionally the *only* place that
 * translation happens — there is one canonical saved entry (the app's), and
 * the Context Engine's records (events, clarifications, extraction ledger)
 * are keyed by that same entry's ID. No second journal-entry record is ever
 * created for a real entry.
 */
export interface ContextJournalAdapter {
  toContextEntry(existingEntry: AppJournalEntry): ContextJournalEntry;
}

export const contextJournalAdapter: ContextJournalAdapter = {
  toContextEntry(existingEntry: AppJournalEntry): ContextJournalEntry {
    return {
      id: existingEntry.id,
      originalText: existingEntry.text,
      createdAt: existingEntry.createdAt,
      updatedAt: existingEntry.updatedAt,
    };
  },
};
