import type { DataStore } from '@/storage/DataStore';
import type {
  ClarificationQuestion,
  ClarificationReviewRepository,
  ExtractionRecord,
  JournalEntry,
  ReconstructedEvent,
} from './types';

/**
 * Independent persistence for the Context Engine's own records — separate
 * storage keys from the app's existing entry/pattern stores, so a journal
 * entry always remains readable even if event/clarification extraction
 * never runs or fails outright.
 */
const CONTEXT_ENGINE_KEYS = {
  journalEntries: '@cherry-brain/context-engine/journal-entries',
  events: '@cherry-brain/context-engine/events',
  clarifications: '@cherry-brain/context-engine/clarifications',
  extractionRecords: '@cherry-brain/context-engine/extraction-records',
} as const;

export class JournalEntryStore {
  constructor(private store: DataStore) {}

  async getAll(): Promise<JournalEntry[]> {
    return (await this.store.getJSON<JournalEntry[]>(CONTEXT_ENGINE_KEYS.journalEntries)) ?? [];
  }

  async getById(id: string): Promise<JournalEntry | null> {
    const all = await this.getAll();
    return all.find((e) => e.id === id) ?? null;
  }

  async save(entry: JournalEntry): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      all[index] = entry;
    } else {
      all.push(entry);
    }
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.journalEntries, all);
  }
}

export class ReconstructedEventStore {
  constructor(private store: DataStore) {}

  async getAll(): Promise<ReconstructedEvent[]> {
    return (await this.store.getJSON<ReconstructedEvent[]>(CONTEXT_ENGINE_KEYS.events)) ?? [];
  }

  async getForEntry(journalEntryId: string): Promise<ReconstructedEvent[]> {
    const all = await this.getAll();
    return all.filter((e) => e.journalEntryId === journalEntryId);
  }

  async saveMany(events: ReconstructedEvent[]): Promise<void> {
    if (events.length === 0) return;
    const all = await this.getAll();
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.events, [...all, ...events]);
  }
}

export class ClarificationQuestionStore implements ClarificationReviewRepository {
  constructor(private store: DataStore) {}

  async getAll(): Promise<ClarificationQuestion[]> {
    return (await this.store.getJSON<ClarificationQuestion[]>(CONTEXT_ENGINE_KEYS.clarifications)) ?? [];
  }

  async getById(id: string): Promise<ClarificationQuestion | null> {
    const all = await this.getAll();
    return all.find((q) => q.id === id) ?? null;
  }

  async getForEvent(eventId: string): Promise<ClarificationQuestion[]> {
    const all = await this.getAll();
    return all.filter((q) => q.eventId === eventId);
  }

  async getForEntry(journalEntryId: string): Promise<ClarificationQuestion[]> {
    const all = await this.getAll();
    return all.filter((q) => q.journalEntryId === journalEntryId);
  }

  async getPendingQuestions(): Promise<ClarificationQuestion[]> {
    const all = await this.getAll();
    return all.filter((q) => q.status === 'pending').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getPendingQuestionsForEntry(journalEntryId: string): Promise<ClarificationQuestion[]> {
    const pending = await this.getPendingQuestions();
    return pending.filter((q) => q.journalEntryId === journalEntryId);
  }

  async saveMany(questions: ClarificationQuestion[]): Promise<void> {
    if (questions.length === 0) return;
    const all = await this.getAll();
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.clarifications, [...all, ...questions]);
  }

  async update(id: string, updater: (question: ClarificationQuestion) => ClarificationQuestion): Promise<ClarificationQuestion> {
    const all = await this.getAll();
    const index = all.findIndex((q) => q.id === id);
    if (index === -1) throw new Error(`Clarification question ${id} not found`);
    const updated = updater(all[index]);
    all[index] = updated;
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.clarifications, all);
    return updated;
  }
}

/** Persisted idempotency ledger — one record per (journalEntryId, engineVersion). */
export class ExtractionRecordStore {
  constructor(private store: DataStore) {}

  async getAll(): Promise<ExtractionRecord[]> {
    return (await this.store.getJSON<ExtractionRecord[]>(CONTEXT_ENGINE_KEYS.extractionRecords)) ?? [];
  }

  async getForEntry(journalEntryId: string, engineVersion: string): Promise<ExtractionRecord | null> {
    const all = await this.getAll();
    return all.find((r) => r.journalEntryId === journalEntryId && r.engineVersion === engineVersion) ?? null;
  }

  private async upsert(record: ExtractionRecord): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((r) => r.journalEntryId === record.journalEntryId && r.engineVersion === record.engineVersion);
    if (index >= 0) {
      all[index] = record;
    } else {
      all.push(record);
    }
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.extractionRecords, all);
  }

  async markPending(journalEntryId: string, engineVersion: string): Promise<void> {
    await this.upsert({
      journalEntryId,
      engineVersion,
      status: 'pending',
      attemptedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
    });
  }

  async markCompleted(journalEntryId: string, engineVersion: string): Promise<void> {
    const existing = await this.getForEntry(journalEntryId, engineVersion);
    await this.upsert({
      journalEntryId,
      engineVersion,
      status: 'completed',
      attemptedAt: existing?.attemptedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
      error: null,
    });
  }

  async markFailed(journalEntryId: string, engineVersion: string, error: string): Promise<void> {
    const existing = await this.getForEntry(journalEntryId, engineVersion);
    await this.upsert({
      journalEntryId,
      engineVersion,
      status: 'failed',
      attemptedAt: existing?.attemptedAt ?? new Date().toISOString(),
      completedAt: null,
      error,
    });
  }
}
