import { generateId } from '@/models/ids';
import { LocalContextCorrectionRepository } from './ContextCorrectionRepository';
import { ContextReviewError } from './ContextReviewError';
import { buildCorrectedSummary, buildJournalExcerpt, resolveCorrectedTime } from './correctionHelpers';
import type { ClarificationQuestionStore, FactCorrectionRecordStore, ReconstructedEventStore } from './storage';
import type {
  AnswerQuestionInput,
  AnswerQuestionResult,
  ClarificationQuestion,
  ContextReviewGroup,
  ContextReviewItem,
  ContextReviewService,
  DismissQuestionResult,
  FactCorrection,
  FactCorrectionChange,
  OriginalEntryLookup,
  ReconstructedEvent,
} from './types';

export class DefaultContextReviewService implements ContextReviewService {
  private correctionRepository: LocalContextCorrectionRepository;

  constructor(
    private clarificationStore: ClarificationQuestionStore,
    private eventStore: ReconstructedEventStore,
    private correctionStore: FactCorrectionRecordStore,
    private entryLookup: OriginalEntryLookup,
  ) {
    this.correctionRepository = new LocalContextCorrectionRepository(eventStore, clarificationStore, correctionStore);
  }

  async getInboxGroups(): Promise<ContextReviewGroup[]> {
    const pending = await this.clarificationStore.getPendingQuestions();

    const byEntry = new Map<string, ClarificationQuestion[]>();
    for (const question of pending) {
      const list = byEntry.get(question.journalEntryId) ?? [];
      list.push(question);
      byEntry.set(question.journalEntryId, list);
    }

    const groups: ContextReviewGroup[] = [];
    for (const [journalEntryId, questions] of byEntry) {
      const group = await this.buildGroup(journalEntryId, questions);
      if (group) groups.push(group);
    }

    groups.sort((a, b) => new Date(b.journalCreatedAt).getTime() - new Date(a.journalCreatedAt).getTime());
    return groups;
  }

  async getReviewGroup(journalEntryId: string): Promise<ContextReviewGroup | null> {
    const questions = await this.clarificationStore.getPendingQuestionsForEntry(journalEntryId);
    if (questions.length === 0) return null;
    return this.buildGroup(journalEntryId, questions);
  }

  private async buildGroup(journalEntryId: string, questions: ClarificationQuestion[]): Promise<ContextReviewGroup | null> {
    const originalEntry = await this.entryLookup.getOriginalEntry(journalEntryId);
    if (!originalEntry) return null;

    const sortedQuestions = [...questions].sort((a, b) => {
      const byDate = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
    });

    const items: ContextReviewItem[] = [];
    for (const question of sortedQuestions) {
      const event = await this.eventStore.getById(question.eventId);
      if (!event) continue;
      items.push({
        question,
        event,
        sourcePassage: event.source,
        originalEntryText: originalEntry.text,
      });
    }

    return {
      journalEntryId,
      journalCreatedAt: originalEntry.createdAt,
      journalExcerpt: buildJournalExcerpt(originalEntry.text),
      pendingCount: items.length,
      questions: items,
    };
  }

  async answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionResult> {
    const question = await this.clarificationStore.getById(input.questionId);
    if (!question) {
      throw new ContextReviewError('QUESTION_NOT_FOUND', `No clarification question with id ${input.questionId}`);
    }
    if (question.status !== 'pending') {
      throw new ContextReviewError(
        question.status === 'answered' ? 'ALREADY_ANSWERED' : 'ALREADY_DISMISSED',
        `Clarification question ${input.questionId} is already ${question.status}`,
      );
    }

    const event = await this.eventStore.getById(question.eventId);
    if (!event) {
      throw new ContextReviewError('EVENT_NOT_FOUND', `No reconstructed event for question ${input.questionId}`);
    }

    // Defense in depth: the pending-status check above is the primary guard,
    // but a correction already existing for this question (e.g. a race) must
    // also block a second one from ever being created.
    const existingCorrection = await this.correctionStore.getByQuestionId(question.id);
    if (existingCorrection) {
      throw new ContextReviewError('ALREADY_ANSWERED', `A correction already exists for question ${input.questionId}`);
    }

    const originalEntry = await this.entryLookup.getOriginalEntry(question.journalEntryId);
    const entryCreatedAt = originalEntry?.createdAt ?? event.createdAt;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    let changes: FactCorrectionChange[];
    let submittedAnswerText: string;
    let siblingOriginal: ReconstructedEvent | null = null;
    let siblingUpdated: ReconstructedEvent | null = null;
    let updatedFieldsForEvent: Partial<ReconstructedEvent>;

    if (question.targetField === 'sequenceIndex') {
      if (!question.options || question.options.length === 0) {
        throw new ContextReviewError('OPTION_REQUIRED', 'This question requires selecting an option.');
      }
      if (!input.selectedOptionId) {
        throw new ContextReviewError('OPTION_REQUIRED', 'A selectedOptionId is required for sequence corrections.');
      }
      const option = question.options.find((o) => o.id === input.selectedOptionId);
      if (!option) {
        throw new ContextReviewError('OPTION_NOT_FOUND', `Option ${input.selectedOptionId} not found`);
      }

      submittedAnswerText = option.label;
      const desiredIndex = option.value as number;
      updatedFieldsForEvent = { sequenceIndex: desiredIndex };
      changes = [{ eventId: event.id, field: 'sequenceIndex', previousValue: event.sequenceIndex, correctedValue: desiredIndex }];

      if (desiredIndex !== event.sequenceIndex) {
        const siblings = await this.eventStore.getForEntry(question.journalEntryId);
        const swapPartner = siblings.find((e) => e.id !== event.id && e.sequenceIndex === desiredIndex);
        if (swapPartner) {
          siblingOriginal = swapPartner;
          siblingUpdated = { ...swapPartner, sequenceIndex: event.sequenceIndex, updatedAt: new Date().toISOString() };
          changes.push({
            eventId: swapPartner.id,
            field: 'sequenceIndex',
            previousValue: swapPartner.sequenceIndex,
            correctedValue: event.sequenceIndex,
          });
        }
      }
    } else {
      const trimmed = input.answer.trim();
      if (trimmed.length === 0) {
        throw new ContextReviewError('EMPTY_ANSWER', 'Answer cannot be empty.');
      }
      submittedAnswerText = trimmed;

      if (question.targetField === 'participants') {
        updatedFieldsForEvent = { participants: [trimmed] };
        changes = [{ eventId: event.id, field: 'participants', previousValue: event.participants, correctedValue: [trimmed] }];
      } else if (question.targetField === 'summary') {
        const corrected = buildCorrectedSummary(trimmed);
        updatedFieldsForEvent = { summary: corrected };
        changes = [{ eventId: event.id, field: 'summary', previousValue: event.summary, correctedValue: corrected }];
      } else if (question.targetField === 'statedTime' || question.targetField === 'resolvedTime') {
        const timeInfo = resolveCorrectedTime(trimmed, entryCreatedAt, timezone);
        updatedFieldsForEvent = {
          statedTime: timeInfo.statedTime,
          resolvedTime: timeInfo.resolvedTime,
          timePrecision: timeInfo.timePrecision,
        };
        changes = [];
        if (timeInfo.statedTime !== event.statedTime) {
          changes.push({ eventId: event.id, field: 'statedTime', previousValue: event.statedTime, correctedValue: timeInfo.statedTime });
        }
        if (timeInfo.resolvedTime !== event.resolvedTime) {
          changes.push({
            eventId: event.id,
            field: 'resolvedTime',
            previousValue: event.resolvedTime,
            correctedValue: timeInfo.resolvedTime,
          });
        }
        if (timeInfo.timePrecision !== event.timePrecision) {
          changes.push({
            eventId: event.id,
            field: 'timePrecision',
            previousValue: event.timePrecision,
            correctedValue: timeInfo.timePrecision,
          });
        }
        if (changes.length === 0) {
          throw new ContextReviewError('NO_CHANGE', 'That answer matches what is already recorded — nothing to correct.');
        }
      } else {
        throw new ContextReviewError('EVENT_NOT_FOUND', `Unsupported target field: ${question.targetField}`);
      }
    }

    assertNoDuplicateChanges(changes);

    const now = new Date().toISOString();
    const correction: FactCorrection = {
      id: generateId('correction'),
      journalEntryId: question.journalEntryId,
      eventId: event.id,
      clarificationQuestionId: question.id,
      category: question.category,
      changes,
      source: 'user',
      createdAt: now,
    };

    const updatedEvent: ReconstructedEvent = { ...event, ...updatedFieldsForEvent, updatedAt: now };
    const answeredQuestion: ClarificationQuestion = {
      ...question,
      status: 'answered',
      answer: submittedAnswerText,
      answeredAt: now,
    };

    const originalEvents = siblingOriginal ? [event, siblingOriginal] : [event];
    const updatedEvents = siblingUpdated ? [updatedEvent, siblingUpdated] : [updatedEvent];

    // The repository owns the atomic write (event(s) -> correction -> answered
    // question), including rollback of everything written so far if any later
    // stage fails. Nothing above this line has touched storage.
    return this.correctionRepository.commitAnswer({
      originalEvents,
      updatedEvents,
      originalQuestion: question,
      answeredQuestion,
      correction,
    });
  }

  async dismissQuestion(questionId: string): Promise<DismissQuestionResult> {
    const question = await this.clarificationStore.getById(questionId);
    if (!question) {
      throw new ContextReviewError('QUESTION_NOT_FOUND', `No clarification question with id ${questionId}`);
    }
    if (question.status !== 'pending') {
      throw new ContextReviewError(
        question.status === 'answered' ? 'ALREADY_ANSWERED' : 'ALREADY_DISMISSED',
        `Clarification question ${questionId} is already ${question.status}`,
      );
    }

    const now = new Date().toISOString();
    const dismissedQuestion = await this.clarificationStore.update(questionId, (q) => ({
      ...q,
      status: 'dismissed',
      dismissedAt: now,
    }));

    return { dismissedQuestion };
  }
}

function assertNoDuplicateChanges(changes: FactCorrectionChange[]): void {
  const seen = new Set<string>();
  for (const change of changes) {
    const key = `${change.eventId}:${change.field}`;
    if (seen.has(key)) {
      throw new ContextReviewError('DUPLICATE_FIELD', `Duplicate change for event ${change.eventId} field "${change.field}"`);
    }
    seen.add(key);
  }
}
