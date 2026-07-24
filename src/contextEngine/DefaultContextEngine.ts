import { generateId } from '@/models/ids';
import { logger } from '@/utils/logger';
import { CONTEXT_ENGINE_VERSION } from './engineVersion';
import type { ClarificationQuestionStore, ExtractionRecordStore, ReconstructedEventStore } from './storage';
import type {
  ClarificationQuestion,
  ContextEngine,
  ContextExtractionProvider,
  ContextExtractionResult,
  JournalEntry,
  ReconstructedEvent,
} from './types';
import { validateProviderResult } from './validation';

export class DefaultContextEngine implements ContextEngine {
  /**
   * Single-flight guard: concurrent calls for the same entry (double save
   * taps, React re-renders, strict-mode double invocation) share the same
   * in-progress promise instead of each starting a separate extraction run.
   */
  private inFlight = new Map<string, Promise<ContextExtractionResult>>();

  constructor(
    private provider: ContextExtractionProvider,
    private eventStore: ReconstructedEventStore,
    private clarificationStore: ClarificationQuestionStore,
    private extractionRecordStore: ExtractionRecordStore,
  ) {}

  async extractFromJournalEntry(entry: JournalEntry): Promise<ContextExtractionResult> {
    const existing = this.inFlight.get(entry.id);
    if (existing) return existing;

    const run = this.runExtraction(entry);
    this.inFlight.set(entry.id, run);
    try {
      return await run;
    } finally {
      this.inFlight.delete(entry.id);
    }
  }

  private async runExtraction(entry: JournalEntry): Promise<ContextExtractionResult> {
    const existingRecord = await this.extractionRecordStore.getForEntry(entry.id, CONTEXT_ENGINE_VERSION);
    if (existingRecord?.status === 'completed') {
      // Already processed by this exact engine version — idempotent no-op.
      // Return what's already persisted rather than creating anything new.
      const [events, clarificationQuestions] = await Promise.all([
        this.eventStore.getForEntry(entry.id),
        this.clarificationStore.getForEntry(entry.id),
      ]);
      return { journalEntry: entry, events, clarificationQuestions };
    }

    await this.extractionRecordStore.markPending(entry.id, CONTEXT_ENGINE_VERSION);

    try {
      const result = await this.performExtraction(entry);
      await this.extractionRecordStore.markCompleted(entry.id, CONTEXT_ENGINE_VERSION);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.extractionRecordStore.markFailed(entry.id, CONTEXT_ENGINE_VERSION, message);
      throw error;
    }
  }

  private async performExtraction(entry: JournalEntry): Promise<ContextExtractionResult> {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const raw = await this.provider.extract({
      journalEntryId: entry.id,
      originalText: entry.originalText,
      entryCreatedAt: entry.createdAt,
      timezone,
    });

    const { events: validEvents, clarificationQuestions: validClarifications, issues } = validateProviderResult(
      raw,
      entry.originalText,
    );

    for (const issue of issues) {
      logger.error('Context extraction validation failed', { journalEntryId: entry.id, issue });
    }

    const now = new Date().toISOString();
    const events: ReconstructedEvent[] = validEvents.map((e) => ({
      id: generateId('event'),
      journalEntryId: entry.id,
      summary: e.summary,
      statedTime: e.statedTime,
      resolvedTime: e.resolvedTime,
      timePrecision: e.timePrecision,
      participants: e.participants,
      sequenceIndex: e.sequenceIndex,
      source: e.source,
      needsClarification: e.needsClarification,
      createdAt: now,
      updatedAt: now,
    }));

    if (events.length > 0) {
      await this.eventStore.saveMany(events);
    }

    const eventBySequenceIndex = new Map(events.map((ev) => [ev.sequenceIndex, ev]));
    const clarifications: ClarificationQuestion[] = [];

    for (const cq of validClarifications) {
      const event = eventBySequenceIndex.get(cq.eventSequenceIndex);
      if (!event) continue;

      const existingForEvent = await this.clarificationStore.getForEvent(event.id);
      const isDuplicate = existingForEvent.some((existing) => existing.question === cq.question);
      if (isDuplicate) continue;

      clarifications.push({
        id: generateId('clarification'),
        journalEntryId: entry.id,
        eventId: event.id,
        question: cq.question,
        reason: cq.reason,
        status: 'pending',
        answer: null,
        createdAt: now,
        answeredAt: null,
        dismissedAt: null,
      });
    }

    if (clarifications.length > 0) {
      await this.clarificationStore.saveMany(clarifications);
    }

    return { journalEntry: entry, events, clarificationQuestions: clarifications };
  }

  async answerClarification(questionId: string, answer: string): Promise<ClarificationQuestion> {
    const now = new Date().toISOString();
    return this.clarificationStore.update(questionId, (question) => ({
      ...question,
      status: 'answered',
      answer,
      answeredAt: now,
    }));
  }

  async dismissClarification(questionId: string): Promise<ClarificationQuestion> {
    const now = new Date().toISOString();
    return this.clarificationStore.update(questionId, (question) => ({
      ...question,
      status: 'dismissed',
      dismissedAt: now,
    }));
  }
}
