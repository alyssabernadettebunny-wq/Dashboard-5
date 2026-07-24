import type { EventTimePrecision, JournalEntry, ReconstructedEvent, TimelineDatePrecision, TimelineDayGroup, TimelineEventItem } from './types';

/** exact sorts before approximate/relative, which sorts before unknown. */
const PRECISION_TIER: Record<EventTimePrecision, number> = {
  exact: 0,
  approximate: 1,
  relative: 1,
  unknown: 2,
};

/**
 * Strict chronological ordering contract: precision tier, then actual
 * resolved time (only meaningful within the exact tier), then narrative
 * sequenceIndex, then createdAt, then id as a final deterministic tiebreak.
 */
export function compareTimelineEvents(a: ReconstructedEvent, b: ReconstructedEvent): number {
  const tierDiff = PRECISION_TIER[a.timePrecision] - PRECISION_TIER[b.timePrecision];
  if (tierDiff !== 0) return tierDiff;

  if (a.timePrecision === 'exact' && b.timePrecision === 'exact' && a.resolvedTime && b.resolvedTime) {
    const timeDiff = new Date(a.resolvedTime).getTime() - new Date(b.resolvedTime).getTime();
    if (timeDiff !== 0) return timeDiff;
  }

  if (a.sequenceIndex !== b.sequenceIndex) return a.sequenceIndex - b.sequenceIndex;

  const createdDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  if (createdDiff !== 0) return createdDiff;

  return a.id.localeCompare(b.id);
}

/**
 * The date an event's card is grouped under. Uses the event's own resolved
 * time when it carries exact precision (so a stated date genuinely different
 * from the journal entry's own date is respected); otherwise anchors to the
 * date the journal entry was created on, since the current provider can't
 * safely infer a different day without guessing.
 */
export function resolveEventDate(
  event: ReconstructedEvent,
  journalEntry: JournalEntry,
): { dateKey: string; datePrecision: TimelineDatePrecision } {
  if (event.timePrecision === 'exact' && event.resolvedTime) {
    return { dateKey: event.resolvedTime.slice(0, 10), datePrecision: 'exact' };
  }
  return { dateKey: journalEntry.createdAt.slice(0, 10), datePrecision: 'anchored' };
}

/** "Thursday, July 23, 2026" — parsed from a "YYYY-MM-DD" dateKey, not a full timestamp, to avoid timezone re-shifting. */
export function formatDisplayDate(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map((n) => parseInt(n, 10));
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function capitalize(text: string): string {
  if (text.length === 0) return text;
  return text[0].toUpperCase() + text.slice(1);
}

/** Renders only what is actually known — never invents a clock time for approximate/relative/unknown events. */
export function formatDisplayTime(event: ReconstructedEvent): string {
  if (event.timePrecision === 'exact' && event.resolvedTime) {
    return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(new Date(event.resolvedTime));
  }
  if ((event.timePrecision === 'approximate' || event.timePrecision === 'relative') && event.statedTime) {
    return capitalize(event.statedTime);
  }
  return 'Time not recorded';
}

/** Groups already-built TimelineEventItems (each paired with its resolved dateKey) into day groups: most-recent day first, chronological within each day. */
export function buildDayGroups(items: { item: TimelineEventItem; dateKey: string }[]): TimelineDayGroup[] {
  const byDate = new Map<string, TimelineEventItem[]>();
  for (const { item, dateKey } of items) {
    const list = byDate.get(dateKey) ?? [];
    list.push(item);
    byDate.set(dateKey, list);
  }

  const groups: TimelineDayGroup[] = [];
  for (const [dateKey, groupItems] of byDate) {
    groupItems.sort((a, b) => compareTimelineEvents(a.event, b.event));
    groups.push({ dateKey, displayDate: formatDisplayDate(dateKey), events: groupItems });
  }

  groups.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  return groups;
}
