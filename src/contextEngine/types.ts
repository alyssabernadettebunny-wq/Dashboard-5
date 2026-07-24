/**
 * Cherry Brain Context Engine — Sprint 001.
 *
 * This module reconstructs *what happened* in a journal entry, deliberately
 * before any interpretation, pattern detection, or personality inference.
 * The original journal text is always the primary source of evidence and is
 * never rewritten, corrected, or replaced by the structured records below.
 *
 * This is intentionally a separate, self-contained subsystem — it does not
 * reuse the app's existing `JournalEntry` model (src/models/JournalEntry.ts),
 * which already carries UI-specific concerns (titles, tags, importance,
 * connected patterns) unrelated to event reconstruction.
 */

export type EventTimePrecision = 'exact' | 'approximate' | 'relative' | 'unknown';

export type ClarificationStatus = 'pending' | 'answered' | 'dismissed';

export interface SourcePassage {
  text: string;
  startIndex: number;
  endIndex: number;
}

export interface ReconstructedEvent {
  id: string;
  journalEntryId: string;

  /**
   * Brief factual description of what occurred.
   * Must not include interpretation, diagnosis, motive attribution,
   * advice, or inferred identity claims.
   */
  summary: string;

  /**
   * Original time language used by the user when available.
   * Examples: "this morning", "around 3", "after dinner".
   * null when no time information exists.
   */
  statedTime: string | null;

  /**
   * Normalized timestamp when it can be resolved safely.
   * Must remain null when the date or time cannot be determined without guessing.
   */
  resolvedTime: string | null;

  timePrecision: EventTimePrecision;

  /**
   * Names or relationship labels explicitly present in the source.
   * Examples: ["Amy"], ["my mother"], [].
   * Do not infer identities that were not stated.
   */
  participants: string[];

  /** Position of this event within the journal entry. Begins at 0 and preserves narrative sequence. */
  sequenceIndex: number;

  /** Exact passage from the original journal entry supporting this reconstructed event. */
  source: SourcePassage;

  /** True when unresolved ambiguity materially changes the factual reconstruction of the event. */
  needsClarification: boolean;

  createdAt: string;
  updatedAt: string;
}

/** The structured event field a correction targets. */
export type CorrectableEventField = 'participants' | 'summary' | 'statedTime' | 'resolvedTime' | 'sequenceIndex';

/**
 * The kind of fact a clarification question is narrowing — always a fact,
 * never meaning: no emotional interpretation, motive, personality, or
 * identity-claim categories exist here by design.
 */
export type CorrectionCategory = 'participant' | 'action' | 'outcome' | 'time' | 'sequence';

/** A single selectable alternative for a choice-style (e.g. sequence) clarification. */
export interface ClarificationOption {
  id: string;
  label: string;
  /** Value applied to the event's targetField when this option is selected. */
  value: unknown;
}

export interface ClarificationQuestion {
  id: string;
  journalEntryId: string;
  eventId: string;

  /** One concise question about missing factual context. Stored for later review; never interrupts journaling. */
  question: string;

  /** Brief internal explanation of why the missing answer matters. May be dev-visible only. */
  reason: string;

  category: CorrectionCategory;
  targetField: CorrectableEventField;

  /** Only set for choice-style corrections (e.g. sequence); null means guided free text. */
  options: ClarificationOption[] | null;

  status: ClarificationStatus;
  answer: string | null;

  createdAt: string;
  answeredAt: string | null;
  dismissedAt: string | null;
}

export interface JournalEntry {
  id: string;

  /** Immutable original text entered by the user. */
  originalText: string;

  createdAt: string;
  updatedAt: string;
}

export interface ContextExtractionResult {
  journalEntry: JournalEntry;
  events: ReconstructedEvent[];
  clarificationQuestions: ClarificationQuestion[];
}

export interface ContextEngine {
  extractFromJournalEntry(entry: JournalEntry): Promise<ContextExtractionResult>;
  answerClarification(questionId: string, answer: string): Promise<ClarificationQuestion>;
  dismissClarification(questionId: string): Promise<ClarificationQuestion>;
}

export interface ContextExtractionProviderInput {
  journalEntryId: string;
  originalText: string;
  entryCreatedAt: string;
  timezone: string;
}

export interface ContextExtractionProvider {
  extract(input: ContextExtractionProviderInput): Promise<ContextExtractionProviderResultRaw>;
}

/**
 * Raw provider output, matching contextExtractionProviderResultSchema in schema.ts.
 * Named "Raw" here to distinguish from the persisted, ID-bearing ReconstructedEvent /
 * ClarificationQuestion records the ContextEngine produces after validation.
 */
export interface ExtractedEventRaw {
  summary: string;
  statedTime: string | null;
  resolvedTime: string | null;
  timePrecision: EventTimePrecision;
  participants: string[];
  sequenceIndex: number;
  source: SourcePassage;
  needsClarification: boolean;
}

export interface ExtractedClarificationRaw {
  eventSequenceIndex: number;
  question: string;
  reason: string;
  category: CorrectionCategory;
  targetField: CorrectableEventField;
  options: ClarificationOption[] | null;
}

export interface ContextExtractionProviderResultRaw {
  events: ExtractedEventRaw[];
  clarificationQuestions: ExtractedClarificationRaw[];
}

export interface ClarificationReviewRepository {
  getPendingQuestions(): Promise<ClarificationQuestion[]>;
  getPendingQuestionsForEntry(journalEntryId: string): Promise<ClarificationQuestion[]>;
}

export type ExtractionStatus = 'pending' | 'completed' | 'failed';

/**
 * One record per (journalEntryId, engineVersion) pair. Makes extraction
 * idempotent: a "completed" record means the entry has already been
 * processed by this exact engine version and must not be reprocessed —
 * that's what prevents duplicate events/clarifications when a save callback
 * fires twice, React re-renders, or an already-processed entry is reopened.
 * A "failed" record does not block a deliberate retry.
 */
export interface ExtractionRecord {
  journalEntryId: string;
  engineVersion: string;
  status: ExtractionStatus;
  attemptedAt: string;
  completedAt: string | null;
  error: string | null;
}

/**
 * Sprint 002 — Context Review.
 *
 * A FactCorrection is an audit record of one accepted answer: what the
 * targeted event field held before, and what it holds after. It never
 * touches JournalEntry.originalText — only structured ReconstructedEvent
 * fields are ever corrected.
 */
export interface FactCorrection {
  id: string;
  journalEntryId: string;
  eventId: string;
  clarificationQuestionId: string;

  category: CorrectionCategory;
  field: CorrectableEventField;

  previousValue: unknown;
  correctedValue: unknown;

  source: 'user';
  createdAt: string;
}

export interface FactCorrectionRepository {
  create(correction: FactCorrection): Promise<FactCorrection>;
  getByEventId(eventId: string): Promise<FactCorrection[]>;
  getByQuestionId(clarificationQuestionId: string): Promise<FactCorrection | null>;
}

/** Narrow read-only bridge to the app's real journal entry text — the Context Engine never stores its own copy. */
export interface OriginalEntryLookup {
  getOriginalEntry(journalEntryId: string): Promise<{ text: string; createdAt: string } | null>;
}

export interface ContextReviewItem {
  question: ClarificationQuestion;
  event: ReconstructedEvent;
  sourcePassage: SourcePassage;
  originalEntryText: string;
}

export interface ContextReviewGroup {
  journalEntryId: string;
  journalCreatedAt: string;
  journalExcerpt: string;
  pendingCount: number;
  questions: ContextReviewItem[];
}

export interface AnswerQuestionResult {
  updatedEvent: ReconstructedEvent;
  answeredQuestion: ClarificationQuestion;
  correction: FactCorrection;
}

export interface DismissQuestionResult {
  dismissedQuestion: ClarificationQuestion;
}

export interface AnswerQuestionInput {
  questionId: string;
  answer: string;
  selectedOptionId?: string;
}

export interface ContextReviewService {
  getInboxGroups(): Promise<ContextReviewGroup[]>;
  getReviewGroup(journalEntryId: string): Promise<ContextReviewGroup | null>;
  answerQuestion(input: AnswerQuestionInput): Promise<AnswerQuestionResult>;
  dismissQuestion(questionId: string): Promise<DismissQuestionResult>;
}
