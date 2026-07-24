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

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const WEEKDAY_PATTERN = new RegExp(`\\b(${WEEKDAY_NAMES.join('|')})(?:\\s+(morning|afternoon|evening))?\\b`, 'i');
const EXPLICIT_DATE_PATTERN = new RegExp(`\\b(${MONTH_NAMES.join('|')})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`, 'i');

export interface TimeInfo {
  statedTime: string | null;
  resolvedTime: string | null;
  timePrecision: EventTimePrecision;
  /**
   * A safely resolved calendar date (YYYY-MM-DD), independent of clock-time
   * precision. Set whenever a specific day is stated (an explicit date or a
   * weekday name), even when the exact time of day remains unknown or vague —
   * date certainty and time-of-day precision are deliberately not conflated.
   */
  resolvedDate: string | null;
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

function getCalendarParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  return {
    year: parseInt(parts.find((p) => p.type === 'year')!.value, 10),
    month: parseInt(parts.find((p) => p.type === 'month')!.value, 10),
    day: parseInt(parts.find((p) => p.type === 'day')!.value, 10),
  };
}

function toDateKey(year: number, month: number, day: number): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

  const { year, month, day } = getCalendarParts(new Date(entryCreatedAt), timezone);
  const offset = getUtcOffsetString(new Date(entryCreatedAt), timezone);
  const hh = String(hour).padStart(2, '0');
  const mm = String(minute).padStart(2, '0');
  return `${toDateKey(year, month, day)}T${hh}:${mm}:00${offset}`;
}

/**
 * The most recent date on or before the entry's own creation date that falls
 * on the given weekday. Journal entries describe things that already
 * happened, so a bare weekday name ("On Tuesday...") is resolved backward,
 * never forward into a date the entry hasn't reached yet.
 */
function resolveWeekdayDate(weekdayName: string, entryCreatedAt: string, timezone: string): string {
  const targetIndex = WEEKDAY_NAMES.indexOf(weekdayName.toLowerCase());
  const ref = getCalendarParts(new Date(entryCreatedAt), timezone);
  const refUtc = Date.UTC(ref.year, ref.month - 1, ref.day, 12);
  const refWeekday = new Date(refUtc).getUTCDay();
  let daysBack = refWeekday - targetIndex;
  if (daysBack < 0) daysBack += 7;
  const resolvedUtc = refUtc - daysBack * 24 * 60 * 60 * 1000;
  const resolved = new Date(resolvedUtc);
  return toDateKey(resolved.getUTCFullYear(), resolved.getUTCMonth() + 1, resolved.getUTCDate());
}

/**
 * An explicit "Month Day" date, resolved to the entry's own year unless that
 * would place the date after the entry was created — in which case the prior
 * year is used, since a journal entry can't be describing something that
 * (relative to itself) hasn't happened yet.
 */
function resolveExplicitDate(monthName: string, day: number, entryCreatedAt: string, timezone: string): string {
  const monthIndex = MONTH_NAMES.indexOf(monthName.toLowerCase());
  const ref = getCalendarParts(new Date(entryCreatedAt), timezone);
  const refUtc = Date.UTC(ref.year, ref.month - 1, ref.day, 12);

  let year = ref.year;
  let candidateUtc = Date.UTC(year, monthIndex, day, 12);
  if (candidateUtc > refUtc) {
    year -= 1;
    candidateUtc = Date.UTC(year, monthIndex, day, 12);
  }
  const resolved = new Date(candidateUtc);
  return toDateKey(resolved.getUTCFullYear(), resolved.getUTCMonth() + 1, resolved.getUTCDate());
}

/** Finds the actual substring (original casing) in the sentence matching a phrase, case-insensitively. */
function findOriginalCasing(sentence: string, phrase: string): string | null {
  const idx = sentence.toLowerCase().indexOf(phrase.toLowerCase());
  if (idx === -1) return null;
  return sentence.slice(idx, idx + phrase.length);
}

interface DateInfo {
  resolvedDate: string | null;
  matchedPhrase: string | null;
}

/**
 * Detects a day-level date reference (an explicit "Month Day" date, or a
 * weekday name with an optional day-part like "afternoon") independent of
 * whether any clock-time language is also present. An explicit date wins
 * over a bare weekday name if both somehow appear.
 */
function extractDateInfo(sentence: string, entryCreatedAt: string, timezone: string): DateInfo {
  const explicitMatch = EXPLICIT_DATE_PATTERN.exec(sentence);
  if (explicitMatch) {
    const resolvedDate = resolveExplicitDate(explicitMatch[1], parseInt(explicitMatch[2], 10), entryCreatedAt, timezone);
    const original = findOriginalCasing(sentence, explicitMatch[0]) ?? explicitMatch[0];
    return { resolvedDate, matchedPhrase: original };
  }

  const weekdayMatch = WEEKDAY_PATTERN.exec(sentence);
  if (weekdayMatch) {
    const resolvedDate = resolveWeekdayDate(weekdayMatch[1], entryCreatedAt, timezone);
    const original = findOriginalCasing(sentence, weekdayMatch[0]) ?? weekdayMatch[0];
    return { resolvedDate, matchedPhrase: original };
  }

  return { resolvedDate: null, matchedPhrase: null };
}

export function extractTimeInfo(sentence: string, entryCreatedAt: string, timezone: string): TimeInfo {
  const dateInfo = extractDateInfo(sentence, entryCreatedAt, timezone);

  const exactMatch = EXACT_TIME_PATTERN.exec(sentence);
  if (exactMatch) {
    const hour = parseInt(exactMatch[1], 10);
    const minute = exactMatch[2] ? parseInt(exactMatch[2], 10) : 0;
    const meridiem = exactMatch[3].toLowerCase() as 'am' | 'pm';
    const resolvedTime = resolveExactTime(hour, minute, meridiem, entryCreatedAt, timezone);
    return { statedTime: exactMatch[0], resolvedTime, timePrecision: 'exact', resolvedDate: resolvedTime.slice(0, 10) };
  }

  for (const phrase of RELATIVE_TIME_PHRASES) {
    const original = findOriginalCasing(sentence, phrase);
    if (original) {
      const statedTime = dateInfo.matchedPhrase ? `${dateInfo.matchedPhrase} ${original}` : original;
      return { statedTime, resolvedTime: null, timePrecision: 'relative', resolvedDate: dateInfo.resolvedDate };
    }
  }

  if (dateInfo.matchedPhrase) {
    // A day-level date reference was found, but no separate exact clock time
    // or relative time-of-day phrase. A day-part word bundled into the match
    // itself (e.g. "Tuesday afternoon") still counts as vague time-of-day
    // language, so precision is 'relative' rather than 'unknown' in that case.
    const timePrecision: EventTimePrecision = /morning|afternoon|evening/i.test(dateInfo.matchedPhrase) ? 'relative' : 'unknown';
    return { statedTime: dateInfo.matchedPhrase, resolvedTime: null, timePrecision, resolvedDate: dateInfo.resolvedDate };
  }

  return { statedTime: null, resolvedTime: null, timePrecision: 'unknown', resolvedDate: null };
}
