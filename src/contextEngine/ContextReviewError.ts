export type ContextReviewErrorCode =
  | 'QUESTION_NOT_FOUND'
  | 'EVENT_NOT_FOUND'
  | 'ALREADY_ANSWERED'
  | 'ALREADY_DISMISSED'
  | 'EMPTY_ANSWER'
  | 'OPTION_REQUIRED'
  | 'OPTION_NOT_FOUND';

/**
 * A controlled domain error for repeated or invalid review actions —
 * e.g. answering an already-answered question. Callers (tests, UI) can
 * branch on `.code` rather than parsing a message string.
 */
export class ContextReviewError extends Error {
  readonly code: ContextReviewErrorCode;

  constructor(code: ContextReviewErrorCode, message: string) {
    super(message);
    this.name = 'ContextReviewError';
    this.code = code;
  }
}
