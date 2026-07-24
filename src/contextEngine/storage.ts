import type { DataStore } from '@/storage/DataStore';
import type {
  ClarificationQuestion,
  ClarificationReviewRepository,
  EventTimelineVisibility,
  EventTimelineVisibilityRepository,
  ExtractionRecord,
  FactCorrection,
  FactCorrectionRepository,
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
  factCorrections: '@cherry-brain/context-engine/fact-corrections',
  eventTimelineVisibility: '@cherry-brain/context-engine/event-timeline-visibility',
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

  async getById(id: string): Promise<ReconstructedEvent | null> {
    const all = await this.getAll();
    return all.find((e) => e.id === id) ?? null;
  }

  async saveMany(events: ReconstructedEvent[]): Promise<void> {
    if (events.length === 0) return;
    const all = await this.getAll();
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.events, [...all, ...events]);
  }

  /** Persists a batch of already-updated events in one write (e.g. a sequence swap touching two events). */
  async updateMany(updated: ReconstructedEvent[]): Promise<void> {
    if (updated.length === 0) return;
    const all = await this.getAll();
    const byId = new Map(updated.map((e) => [e.id, e]));
    const next = all.map((e) => byId.get(e.id) ?? e);
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.events, next);
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

/**
 * A question may produce no more than one accepted correction — `create`
 * enforces that by clarificationQuestionId, so even if a caller forgets to
 * check first, storage itself won't silently double-apply.
 */
export class FactCorrectionRecordStore implements FactCorrectionRepository {
  constructor(private store: DataStore) {}

  async getAll(): Promise<FactCorrection[]> {
    return (await this.store.getJSON<FactCorrection[]>(CONTEXT_ENGINE_KEYS.factCorrections)) ?? [];
  }

  async create(correction: FactCorrection): Promise<FactCorrection> {
    const all = await this.getAll();
    const existing = all.find((c) => c.clarificationQuestionId === correction.clarificationQuestionId);
    if (existing) return existing;
    all.push(correction);
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.factCorrections, all);
    return correction;
  }

  async getByEventId(eventId: string): Promise<FactCorrection[]> {
    const all = await this.getAll();
    return all.filter((c) => c.eventId === eventId || c.changes.some((change) => change.eventId === eventId));
  }

  async getByQuestionId(clarificationQuestionId: string): Promise<FactCorrection | null> {
    const all = await this.getAll();
    return all.find((c) => c.clarificationQuestionId === clarificationQuestionId) ?? null;
  }

  async remove(id: string): Promise<void> {
    const all = await this.getAll();
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.factCorrections, all.filter((c) => c.id !== id));
  }
}

/**
 * One record per eventId, upserted in place. hide()/restore() are
 * idempotent: calling either while already in that state is a no-op that
 * returns the existing record unchanged, so a duplicate tap (or a re-fired
 * effect) never overwrites a real hiddenAt/restoredAt timestamp.
 */
export class EventTimelineVisibilityStore implements EventTimelineVisibilityRepository {
  constructor(private store: DataStore) {}

  async getAll(): Promise<EventTimelineVisibility[]> {
    return (await this.store.getJSON<EventTimelineVisibility[]>(CONTEXT_ENGINE_KEYS.eventTimelineVisibility)) ?? [];
  }

  async getByEventId(eventId: string): Promise<EventTimelineVisibility | null> {
    const all = await this.getAll();
    return all.find((v) => v.eventId === eventId) ?? null;
  }

  private async upsert(record: EventTimelineVisibility): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((v) => v.eventId === record.eventId);
    if (index >= 0) {
      all[index] = record;
    } else {
      all.push(record);
    }
    await this.store.setJSON(CONTEXT_ENGINE_KEYS.eventTimelineVisibility, all);
  }

  async hide(eventId: string, timestamp: string): Promise<EventTimelineVisibility> {
    const existing = await this.getByEventId(eventId);
    if (existing?.isHidden) return existing;
    const record: EventTimelineVisibility = {
      eventId,
      isHidden: true,
      hiddenBy: 'user',
      hiddenAt: timestamp,
      restoredAt: null,
      updatedAt: timestamp,
    };
    await this.upsert(record);
    return record;
  }

  async restore(eventId: string, timestamp: string): Promise<EventTimelineVisibility> {
    const existing = await this.getByEventId(eventId);
    if (!existing || !existing.isHidden) {
      return existing ?? { eventId, isHidden: false, hiddenBy: null, hiddenAt: null, restoredAt: null, updatedAt: timestamp };
    }
    const record: EventTimelineVisibility = {
      ...existing,
      isHidden: false,
      restoredAt: timestamp,
      updatedAt: timestamp,
    };
    await this.upsert(record);
    return record;
  }
}
