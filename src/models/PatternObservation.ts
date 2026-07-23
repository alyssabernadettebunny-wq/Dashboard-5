import type { AnalysisCategory } from './AnalysisCategory';

/** How sure Cherry Brain is, expressed gently rather than as a percentage. */
export type ConfidenceLevel = 'emerging' | 'recurring' | 'strong_signal';

/** The fuller lifecycle status shown in the Pattern Garden. */
export type PatternStatus = ConfidenceLevel | 'uncertain' | 'sleeping';

/** A single piece of evidence supporting a pattern, captured at the time it was linked. */
export interface PatternEvidence {
  id: string;
  entryId: string;
  entrySnippet: string;
  entryCreatedAt: string;
  addedAt: string;
}

export type PatternFeedbackType =
  | 'confirmed'
  | 'maybe'
  | 'rejected'
  | 'tell_me_more'
  | 'suppressed_subject';

/** A record of what the user told Cherry Brain about an observation. Never deleted or overwritten. */
export interface PatternFeedback {
  id: string;
  type: PatternFeedbackType;
  createdAt: string;
  note?: string;
}

export interface PatternObservation {
  id: string;
  /** Stable key identifying the underlying rule + subject combination, used to merge new evidence into the same pattern rather than creating duplicates. */
  ruleKey: string;
  title: string;
  description: string;
  category: AnalysisCategory;
  status: PatternStatus;
  relatedSubjects: string[];
  firstObservedAt: string;
  lastSupportingAt: string;
  evidence: PatternEvidence[];
  feedbackHistory: PatternFeedback[];
  isPaused: boolean;
  mergedIntoId?: string;
  mergedFromIds: string[];
  createdAt: string;
  updatedAt: string;
}
