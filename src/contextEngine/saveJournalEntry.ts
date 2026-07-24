import { generateId } from '@/models/ids';
import { logger } from '@/utils/logger';
import type { ContextEngine, JournalEntry } from './types';
import type { JournalEntryStore } from './storage';

/**
 * Saves the journal entry first, then fires context extraction in the
 * background. Extraction failure is caught and logged — it must never
 * prevent the journal entry from being saved or read back.
 *
 * `journalStore` defaults to the app's real (AsyncStorage-backed) store,
 * loaded lazily so importing this module never pulls in the native
 * AsyncStorage package — tests always pass an in-memory store explicitly.
 */
export async function saveJournalEntry(
  text: string,
  engine: ContextEngine,
  journalStore?: JournalEntryStore,
): Promise<JournalEntry> {
  const store = journalStore ?? (await import('./defaultStores')).journalEntryStore;

  const now = new Date().toISOString();
  const entry: JournalEntry = {
    id: generateId('journal'),
    originalText: text,
    createdAt: now,
    updatedAt: now,
  };

  await store.save(entry);

  void engine.extractFromJournalEntry(entry).catch((error) => {
    logger.error('Context extraction failed', { journalEntryId: entry.id, error });
  });

  return entry;
}
