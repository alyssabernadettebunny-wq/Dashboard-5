import { extractParticipants } from './participantExtraction';
import { looksLikeConcreteEvent, startsNewOccurrence } from './eventClassification';
import { splitIntoSentenceSpans } from './sentenceSpans';
import { extractTimeInfo } from './timeResolution';
import type {
  ContextExtractionProvider,
  ContextExtractionProviderInput,
  ContextExtractionProviderResultRaw,
  ExtractedClarificationRaw,
  ExtractedEventRaw,
} from './types';

const UNRESOLVED_PRONOUN_PATTERN = /\b(her|him|them)\b/i;

interface Candidate {
  text: string;
  startIndex: number;
  endIndex: number;
  participants: string[];
}

/** Local rule-based extraction. It deliberately prefers missing a weak event over manufacturing fragments. */
export class LocalContextExtractionProvider implements ContextExtractionProvider {
  async extract(input: ContextExtractionProviderInput): Promise<ContextExtractionProviderResultRaw> {
    const spans = splitIntoSentenceSpans(input.originalText);
    const groups: Candidate[][] = [];
    let current: Candidate[] = [];

    for (const span of spans) {
      const participants = extractParticipants(span.text);
      if (!looksLikeConcreteEvent(span.text, participants)) continue;

      const candidate = { ...span, participants };
      if (startsNewOccurrence(span.text) && current.length > 0) {
        groups.push(current);
        current = [];
      }
      current.push(candidate);
    }
    if (current.length > 0) groups.push(current);

    const events: ExtractedEventRaw[] = [];
    const clarificationQuestions: ExtractedClarificationRaw[] = [];

    for (const group of groups) {
      const first = group[0];
      const last = group[group.length - 1];
      const sourceText = input.originalText.slice(first.startIndex, last.endIndex);
      const participants = Array.from(new Set(group.flatMap((item) => item.participants)));
      const timeInfo = extractTimeInfo(sourceText, input.entryCreatedAt, input.timezone);
      const sequenceIndex = events.length;
      const pronounMatch = participants.length === 0 ? UNRESOLVED_PRONOUN_PATTERN.exec(sourceText) : null;

      events.push({
        summary: group.map((item) => item.text.trim()).join(' '),
        statedTime: timeInfo.statedTime,
        resolvedTime: timeInfo.resolvedTime,
        timePrecision: timeInfo.timePrecision,
        resolvedDate: timeInfo.resolvedDate,
        participants,
        sequenceIndex,
        source: { text: sourceText, startIndex: first.startIndex, endIndex: last.endIndex },
        needsClarification: pronounMatch !== null,
      });

      if (pronounMatch) {
        const pronoun = pronounMatch[1].toLowerCase();
        clarificationQuestions.push({
          eventSequenceIndex: sequenceIndex,
          question: `Who did "${pronoun}" refer to?`,
          reason: `The participant referred to as "${pronoun}" is not named in the entry, and identifying them matters for understanding who this event involves.`,
          category: 'participant',
          targetField: 'participants',
          options: null,
        });
      }
    }

    return { events, clarificationQuestions };
  }
}
