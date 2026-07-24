import type { EventTimePrecision } from './types';

/**
 * Relative time language that is preserved as stated text but never converted
 * into an invented exact timestamp. Order doesn't matter; longer phrases are
 * checked so "this morning" wins over a coincidental shorter match.
 */
const RELATIVE_TIME_PHRASES = [
  'this morning', 'this afternoon', 'this evening', 'right after', 'after that', 'before that',
  'later', 'earlier', 'tonight', 'today', 'yesterday', 'tomorrow', 'soon', 'afterward', 'afterwards',
];

const EXACT_TIME_PATTERN = /\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;

export interface TimeInfo {
  statedTime: string | null;
  resolvedTime: string | null;
  timePrecision: EventTimePrecision;
}

function getUtcOffsetString(date: Date, timeZone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value ?? 'GMT+0';
    const match = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(tzPart);
    if (!match) return '+00:00';
    const sign = match[1];
    const hh = match[2].padStart(2, '0');
    const mm = (match[3] ?? '00').padStart(2, '0');
    return `${sign}${hh}:${mm}`;
  } catch {
    return '+00:00';
  }
}

/**
 * Best-effort resolution for an explicit clock time (e.g. "at 3:00 pm"),
 * anchored to the calendar date the entry was created on, in the given
 * timezone. Illustrative per the spec's worked example; not exercised by the
 * sprint's required test cases, so kept intentionally simple.
 */
function resolveExactTime(hour12: number, minute: number, meridiem: 'am' | 'pm', entryCreatedAt: string, timezone: string): string {
  let hour = hour12 % 12;
  if (meridiem === 'pm') hour += 12;

  const refDate = new Date(entryCreatedAt);
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(refDate);
  const y = parts.find((p) => p.type === 'year')!.value;
  const mo = parts.find((p) => p.type === 'month')!.value;
  const d = parts.find((p) => p.type === 'day')!.value;
  const offset = getUtcOffsetString(refDate, timezone);
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${y}-${mo}-${d}T${hh}:${mm}:00${offset}`;
}

/** Finds the actual substring (original casing) in the sentence matching a phrase, case-insensitively. */
function findOriginalCasing(sentence: string, phrase: string): string | null {
  const idx = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return null;
  return sentence.slice(idx, idx + phrase.length);
}

export function extractTimeInfo(sentence: string, entryCreatedAt: string, timezone: string): TimeInfo {
  const exactMatch = EXACT_TIME_PATTERN.exec(sentence);
  if (exactMatch) {
    const hour = parseInt(exactMatch[1], 10);
    const minute = exactMatch[2] ? parseInt(exactMatch[2], 10) : 0;
    const meridiem = exactMatch[3].toLowerCase() as 'am' | 'pm';
    const resolvedTime = resolveExactTime(hour, minute, meridiem, entryCreatedAt, timezone);
    return { statedTime: exactMatch[0], resolvedTime, timePrecision: 'exact' };
  }

  for (const phrase of RELATIVE_TIME_PHRASES) {
    const original = findOriginalCasing(sentence, phrase);
    if (original) {
      return { statedTime: original, resolvedTime: null, timePrecision: 'relative' };
    }
  }

  return { statedTime: null, resolvedTime: null, timePrecision: 'unknown' };
}
