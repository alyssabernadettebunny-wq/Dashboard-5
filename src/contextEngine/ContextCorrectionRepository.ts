import { logger } from '@/utils/logger';
import { ContextIntegrityError } from './ContextIntegrityError';
import type { ClarificationQuestionStore, FactCorrectionRecordStore, ReconstructedEventStore } from './storage';
import type { AnswerQuestionResult, ContextCorrectionCommit, ContextCorrectionRepository, ReconstructedEvent } from './types';

/**
 * Owns write consistency across the three stores one answer touches
 * (events, correction ledger, question status). The underlying storage
 * layer has no cross-key transactions, so this implements the "staged
 * commit with rollback" strategy: each stage's write is attempted in turn,
 * and if any stage after the first fails, every earlier write for this
 * operation is undone before the error is re-thrown. The service never
 * writes to these stores directly for an answer — this is the only place
 * that does.
 *
 * Stage order and why: events first, then the correction record, then the
 * question's answered status last. A failure at the *first* stage leaves
 * nothing written at all (nothing to roll back). A failure at any later
 * stage rolls back everything written by the earlier stages. The question
 * is only ever marked "answered" after both the event(s) and the correction
 * record are safely persisted — so a crash or thrown error can never leave
 * a question answered with no evidence behind it, and can never leave an
 * event corrected with no audit record explaining why.
 */
export class LocalContextCorrectionRepository implements ContextCorrectionRepository {
  constructor(
    private eventStore: ReconstructedEventStore,
    private clarificationStore: ClarificationQuestionStore,
    private correctionStore: FactCorrectionRecordStore,
  ) {}

  async commitAnswer(bundle: ContextCorrectionCommit): Promise<AnswerQuestionResult> {
    // Stage 1: event(s). Nothing has been written yet if this throws.
    await this.eventStore.updateMany(bundle.updatedEvents);

    // Stage 2: correction record. If this throws, the event write must be undone.
    try {
      await this.correctionStore.create(bundle.correction);
    } catch (error) {
      await this.rollback(bundle, { events: true, correction: false }, error);
      throw error;
    }

    // Stage 3: mark the question answered. If this throws, both the event
    // write and the correction record must be undone.
    try {
      const answeredQuestion = await this.clarificationStore.update(bundle.originalQuestion.id, () => bundle.answeredQuestion);
      const primaryEvent =
        bundle.updatedEvents.find((e) => e.id === bundle.correction.eventId) ?? bundle.updatedEvents[0];
      return { updatedEvent: primaryEvent as ReconstructedEvent, answeredQuestion, correction: bundle.correction };
    } catch (error) {
      await this.rollback(bundle, { events: true, correction: true }, error);
      throw error;
    }
  }

  private async rollback(
    bundle: ContextCorrectionCommit,
    what: { events: boolean; correction: boolean },
    originalError: unknown,
  ): Promise<void> {
    try {
      if (what.events) {
        await this.eventStore.updateMany(bundle.originalEvents);
      }
      if (what.correction) {
        await this.correctionStore.remove(bundle.correction.id);
      }
    } catch (rollbackError) {
      const integrityError = new ContextIntegrityError(
        'Rollback failed after a correction write error — storage may be inconsistent and needs manual review.',
        {
          journalEntryId: bundle.correction.journalEntryId,
          eventIds: bundle.updatedEvents.map((e) => e.id),
          questionId: bundle.originalQuestion.id,
          correctionId: bundle.correction.id,
        },
        originalError,
        rollbackError,
      );
      logger.error('Context correction rollback failed', {
        message: integrityError.message,
        affectedRecordIds: integrityError.affectedRecordIds,
      });
      throw integrityError;
    }
  }
}
