import type { AppSettings, JournalEntry, PatternObservation } from '@/models';

export interface PatternEngineInput {
  entries: JournalEntry[];
  existingPatterns: PatternObservation[];
  settings: AppSettings;
}

export interface PatternEngineResult {
  /** All patterns after this analysis pass: existing ones with merged evidence plus any newly created ones. */
  patterns: PatternObservation[];
}

/**
 * Behind this interface today is a transparent, local, rule-based engine.
 * A real AI model can implement this same interface later (e.g. sending entry
 * text to an API and mapping the response into PatternObservation candidates)
 * without any repository, state, or screen code needing to change.
 */
export interface PatternEngine {
  analyze(input: PatternEngineInput): PatternEngineResult;
}
