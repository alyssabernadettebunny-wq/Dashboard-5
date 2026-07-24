import { generateId } from '@/models/ids';
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
  OriginalEntryLookup,
  ReconstructedEvent,
} from './types';

export class DefaultContextReviewService implements ContextReviewService {
  constructor(
    private clarificationStore: ClarificationQuestionStore,
    private eventStore: ReconstructedEventStore,
    private correctionStore: FactCorrectionRecordStore,
    private entryLookup: OriginalEntryLookup,
  ) {}

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

    let previousValue: unknown;
    let correctedValue: unknown;
    let updatedEventFields: Partial<ReconstructedEvent>;
    let submittedAnswerText: string;
    let siblingUpdate: ReconstructedEvent | null = null;

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

      previousValue = event.sequenceIndex;
      correctedValue = option.value;
      submittedAnswerText = option.label;

      const desiredIndex = option.value as number;
      updatedEventFields = { sequenceIndex: desiredIndex };

      if (desiredIndex !== event.sequenceIndex) {
        const siblings = await this.eventStore.getForEntry(question.journalEntryId);
        const swapPartner = siblings.find((e) => e.id !== event.id && e.sequenceIndex === desiredIndex);
        if (swapPartner) {
          siblingUpdate = { ...swapPartner, sequenceIndex: event.sequenceIndex, updatedAt: new Date().toISOString() };
        }
      }
    } else {
      const trimmed = input.answer.trim();
      if (trimmed.length === 0) {
        throw new ContextReviewError('EMPTY_ANSWER', 'Answer cannot be empty.');
      }
      submittedAnswerText = trimmed;

      if (question.targetField === 'participants') {
        previousValue = event.participants;
        correctedValue = [trimmed];
        updatedEventFields = { participants: [trimmed] };
      } else if (question.targetField === 'summary') {
        previousValue = event.summary;
        const corrected = buildCorrectedSummary(trimmed);
        correctedValue = corrected;
        updatedEventFields = { summary: corrected };
      } else if (question.targetField === 'statedTime' || question.targetField === 'resolvedTime') {
        previousValue = question.targetField === 'statedTime' ? event.statedTime : event.resolvedTime;
        const timeInfo = resolveCorrectedTime(trimmed, entryCreatedAt, timezone);
        correctedValue = question.targetField === 'statedTime' ? timeInfo.statedTime : timeInfo.resolvedTime;
        updatedEventFields = {
          statedTime: timeInfo.statedTime,
          resolvedTime: timeInfo.resolvedTime,
          timePrecision: timeInfo.timePrecision,
        };
      } else {
        throw new ContextReviewError('EVENT_NOT_FOUND', `Unsupported target field: ${question.targetField}`);
      }
    }

    const now = new Date().toISOString();
    const correction: FactCorrection = {
      id: generateId('correction'),
      journalEntryId: question.journalEntryId,
      eventId: event.id,
      clarificationQuestionId: question.id,
      category: question.category,
      field: question.targetField,
      previousValue,
      correctedValue,
      source: 'user',
      createdAt: now,
    };

    // Write ordering matters, in both directions: the event update happens
    // first, so if IT fails, nothing else is persisted (no orphaned
    // correction record); the correction record happens next, so if THAT
    // fails, the event is already correct but no answered-without-a-record
    // state exists; marking the question "answered" happens last of all, so
    // a crash mid-operation always leaves the question pending — safe to
    // retry — rather than answered with nothing (or only half of something)
    // behind it.
    const updatedEvent: ReconstructedEvent = { ...event, ...updatedEventFields, updatedAt: now };
    if (siblingUpdate) {
      await this.eventStore.updateMany([updatedEvent, siblingUpdate]);
    } else {
      await this.eventStore.updateMany([updatedEvent]);
    }

    await this.correctionStore.create(correction);

    const answeredQuestion = await this.clarificationStore.update(question.id, (q) => ({
      ...q,
      status: 'answered',
      answer: submittedAnswerText,
      answeredAt: now,
    }));

    return { updatedEvent, answeredQuestion, correction };
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

