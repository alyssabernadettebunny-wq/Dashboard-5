import { extractTimeInfo, type TimeInfo } from './timeResolution';

/**
 * Deterministic, minimal summary correction for action/outcome answers.
 *
 * Documented deviation: this only substitutes the first-person subject
 * ("I" / "I'm" / "I've" / "I'll" → "The user" / "The user is" / ...). It does
 * NOT attempt to resolve pronouns like "it" back to an object mentioned in
 * the original summary (e.g. "the appointment") — doing so would require
 * guessing at coreference, which is exactly the kind of inference this
 * system is built to avoid making silently. A future safe summary-regenerating
 * provider can do better; this keeps the answer's own wording intact.
 */
export function buildCorrectedSummary(answer: string): string {
  let text = answer.trim();
  text = text
    .replace(/^I'm\b/, 'The user is')
    .replace(/^I've\b/, 'The user has')
    .replace(/^I'll\b/, 'The user will')
    .replace(/^I\b/, 'The user');
  if (!/[.!?]$/.test(text)) text += '.';
  return text;
}

/**
 * Conservative time resolution for a correction answer, reusing the same
 * exact-time/relative-phrase/date rules the extraction provider uses so
 * answers are handled with the same caution as original entries. When
 * nothing recognizable was found at all — no clock time, no relative phrase,
 * and no resolvable date — the answer is preserved as stated time with
 * "relative" precision (per the spec's own "Tuesday morning" example) rather
 * than invented as exact or dropped as unknown — the user did answer a time
 * question, so their words are kept, just not converted into a timestamp.
 */
export function resolveCorrectedTime(answer: string, entryCreatedAt: string, timezone: string): TimeInfo {
  const trimmed = answer.trim();
  const info = extractTimeInfo(trimmed, entryCreatedAt, timezone);
  if (info.timePrecision !== 'unknown' || info.resolvedDate !== null) return info;
  return { statedTime: trimmed, resolvedTime: null, timePrecision: 'relative', resolvedDate: null };
}

/** Short, calm preview text for an inbox card — no ellipsis-heavy truncation drama. */
export function buildJournalExcerpt(text: string, maxLength = 90): string {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}
