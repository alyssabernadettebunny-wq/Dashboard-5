import { containsBannedPhrase } from './bannedPhrases';
import { contextExtractionProviderResultSchema } from './schema';
import type { ExtractedClarificationRaw, ExtractedEventRaw } from './types';

export interface ValidatedProviderResult {
  events: ExtractedEventRaw[];
  clarificationQuestions: ExtractedClarificationRaw[];
  issues: string[];
}

/**
 * Validates raw provider output against the schema, then against the
 * itemized rules that a schema alone can't express (source-passage integrity,
 * sequencing, dangling references, disguised interpretation). Never throws —
 * invalid items are dropped and recorded in `issues` for the caller to log.
 * Nothing here is silently stored: every drop has a reason string attached.
 */
export function validateProviderResult(raw: unknown, originalText: string): ValidatedProviderResult {
  const issues: string[] = [];
  const parsed = contextExtractionProviderResultSchema.safeParse(raw);
  if (!parsed.success) {
    issues.push(`Provider output failed schema validation: ${parsed.error.message}`);
    return { events: [], clarificationQuestions: [], issues };
  }

  const validEvents: ExtractedEventRaw[] = [];
  const seenSequenceIndexes = new Set<number>();
  let lastSequenceIndex = -1;

  for (const event of parsed.data.events) {
    if (event.source.endIndex <= event.source.startIndex) {
      issues.push(`Event "${event.summary}" rejected: endIndex <= startIndex`);
      continue;
    }
    if (event.source.startIndex < 0 || event.source.endIndex > originalText.length) {
      issues.push(`Event "${event.summary}" rejected: source indexes are outside the original text boundaries`);
      continue;
    }
    const actualText = originalText.slice(event.source.startIndex, event.source.endIndex);
    if (actualText !== event.source.text) {
      issues.push(`Event "${event.summary}" rejected: source passage does not match the original text at the given indexes`);
      continue;
    }
    if (event.summary.trim().length === 0) {
      issues.push('Event rejected: summary is empty');
      continue;
    }
    if (event.resolvedTime !== null && event.timePrecision === 'unknown') {
      issues.push(`Event "${event.summary}" rejected: resolvedTime present with "unknown" precision`);
      continue;
    }
    if (event.resolvedTime !== null && event.resolvedDate && event.resolvedDate !== event.resolvedTime.slice(0, 10)) {
      issues.push(`Event "${event.summary}" rejected: resolvedDate does not match resolvedTime's calendar date`);
      continue;
    }
    const banned = containsBannedPhrase(event.summary);
    if (banned) {
      issues.push(`Event "${event.summary}" rejected: summary contains interpretive language ("${banned}") disguised as fact`);
      continue;
    }
    if (seenSequenceIndexes.has(event.sequenceIndex)) {
      issues.push(`Event "${event.summary}" rejected: duplicate sequenceIndex (${event.sequenceIndex})`);
      continue;
    }
    if (event.sequenceIndex < lastSequenceIndex) {
      issues.push(`Event "${event.summary}" rejected: out-of-order sequenceIndex (${event.sequenceIndex})`);
      continue;
    }

    seenSequenceIndexes.add(event.sequenceIndex);
    lastSequenceIndex = event.sequenceIndex;
    validEvents.push(event);
  }

  const validSequenceIndexes = new Set(validEvents.map((e) => e.sequenceIndex));
  const validClarifications: ExtractedClarificationRaw[] = [];
  for (const cq of parsed.data.clarificationQuestions) {
    if (!validSequenceIndexes.has(cq.eventSequenceIndex)) {
      issues.push(`Clarification question "${cq.question}" rejected: references a nonexistent event (sequenceIndex ${cq.eventSequenceIndex})`);
      continue;
    }
    validClarifications.push(cq);
  }

  return { events: validEvents, clarificationQuestions: validClarifications, issues };
}
