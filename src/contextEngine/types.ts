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

export interface ClarificationQuestion {
  id: string;
  journalEntryId: string;
  eventId: string;

  /** One concise question about missing factual context. Stored for later review; never interrupts journaling. */
  question: string;

  /** Brief internal explanation of why the missing answer matters. May be dev-visible only. */
  reason: string;

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
}

export interface ContextExtractionProviderResultRaw {
  events: ExtractedEventRaw[];
  clarificationQuestions: ExtractedClarificationRaw[];
}

export interface ClarificationReviewRepository {
  getPendingQuestions(): Promise<ClarificationQuestion[]>;
  getPendingQuestionsForEntry(journalEntryId: string): Promise<ClarificationQuestion[]>;
}
