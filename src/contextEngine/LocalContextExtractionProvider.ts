import { extractParticipants } from './participantExtraction';
import { looksLikeConcreteEvent } from './eventClassification';
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

/**
 * Transparent, local, rule-based extraction provider — no external AI service.
 * Kept behind the `ContextExtractionProvider` interface so a real model-backed
 * provider can replace this later without the ContextEngine, storage, or UI
 * changing at all.
 *
 * Deliberately conservative: sentence-level segmentation, a small action-verb
 * vocabulary to filter out vague mood statements, and a single clarification
 * heuristic (an unnamed pronoun referring to a person). This is enough to
 * satisfy the sprint's required behavior without inventing precision the
 * source text doesn't support.
 */
export class LocalContextExtractionProvider implements ContextExtractionProvider {
  async extract(input: ContextExtractionProviderInput): Promise<ContextExtractionProviderResultRaw> {
    const spans = splitIntoSentenceSpans(input.originalText);

    const events: ExtractedEventRaw[] = [];
    const clarificationQuestions: ExtractedClarificationRaw[] = [];

    for (const span of spans) {
      const participants = extractParticipants(span.text);
      if (!looksLikeConcreteEvent(span.text, participants)) continue;

      const timeInfo = extractTimeInfo(span.text, input.entryCreatedAt, input.timezone);
      const sequenceIndex = events.length;

      const pronounMatch = participants.length === 0 ? UNRESOLVED_PRONOUN_PATTERN.exec(span.text) : null;
      const needsClarification = pronounMatch !== null;

      events.push({
        summary: buildFactualSummary(span.text),
        statedTime: timeInfo.statedTime,
        resolvedTime: timeInfo.resolvedTime,
        timePrecision: timeInfo.timePrecision,
        participants,
        sequenceIndex,
        source: { text: span.text, startIndex: span.startIndex, endIndex: span.endIndex },
        needsClarification,
      });

      if (pronounMatch) {
        const pronoun = pronounMatch[1].toLowerCase();
        clarificationQuestions.push({
          eventSequenceIndex: sequenceIndex,
          question: `Which person does "${pronoun}" refer to?`,
          reason: `The participant referred to as "${pronoun}" is not named in the entry, and identifying them matters for understanding who this event involves.`,
        });
      }
    }

    return { events, clarificationQuestions };
  }
}

/**
 * The local provider's "summary" is the sentence itself, lightly trimmed —
 * it never rewrites wording or infers meaning, so there is no interpretive
 * content to accidentally introduce.
 */
function buildFactualSummary(sentenceText: string): string {
  return sentenceText;
}
