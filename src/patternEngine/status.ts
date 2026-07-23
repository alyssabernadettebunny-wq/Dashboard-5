import type { PatternObservation, PatternStatus } from '@/models';

const SLEEPING_AFTER_DAYS = 21;

function daysBetween(aIso: string, bIso: string): number {
  const ms = Math.abs(new Date(aIso).getTime() - new Date(bIso).getTime());
  return ms / (1000 * 60 * 60 * 24);
}

export function statusFromEvidenceCount(count: number): PatternStatus {
  if (count >= 5) return 'strong_signal';
  if (count >= 3) return 'recurring';
  return 'emerging';
}

/**
 * Derives the status to *display* right now, layering in feedback and staleness
 * on top of the evidence-count baseline stored on the pattern. Never mutates
 * the pattern or its history — "sleeping" and "uncertain" are read-time views,
 * not overwrites of what actually happened.
 */
export function derivePatternStatus(pattern: PatternObservation, nowIso: string = new Date().toISOString()): PatternStatus {
  const lastFeedback = pattern.feedbackHistory[pattern.feedbackHistory.length - 1];
  if (lastFeedback?.type === 'rejected') return 'uncertain';

  const base = statusFromEvidenceCount(pattern.evidence.length);
  if (pattern.isPaused) return base;

  const idleDays = daysBetween(nowIso, pattern.lastSupportingAt);
  if (idleDays > SLEEPING_AFTER_DAYS) return 'sleeping';
  return base;
}
