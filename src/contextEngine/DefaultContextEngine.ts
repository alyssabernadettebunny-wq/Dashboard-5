import { generateId } from '@/models/ids';
import { logger } from '@/utils/logger';
import type { ClarificationQuestionStore, ReconstructedEventStore } from './storage';
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
  constructor(
    private provider: ContextExtractionProvider,
    private eventStore: ReconstructedEventStore,
    private clarificationStore: ClarificationQuestionStore,
  ) {}

  async extractFromJournalEntry(entry: JournalEntry): Promise<ContextExtractionResult> {
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
