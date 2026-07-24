export interface ContextIntegrityErrorIds {
  journalEntryId: string;
  eventIds: string[];
  questionId: string;
  correctionId: string;
}

/**
 * Thrown only when a rollback itself fails after a write error — i.e. storage
 * may now be in a genuinely inconsistent state that automatic recovery
 * couldn't fix. This is deliberately distinct from an ordinary write failure
 * (which rolls back cleanly and is safe to retry): it carries every record ID
 * involved so a human can go look directly at the affected data.
 */
export class ContextIntegrityError extends Error {
  readonly affectedRecordIds: ContextIntegrityErrorIds;
  readonly originalError: unknown;
  readonly rollbackError: unknown;

  constructor(message: string, affectedRecordIds: ContextIntegrityErrorIds, originalError: unknown, rollbackError: unknown) {
    super(message);
    this.name = 'ContextIntegrityError';
    this.affectedRecordIds = affectedRecordIds;
    this.originalError = originalError;
    this.rollbackError = rollbackError;
  }
}
