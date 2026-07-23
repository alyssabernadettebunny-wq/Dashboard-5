import type { JournalEntry, SuggestedSubject } from '@/models';
import { EMOTION_DEFINITIONS, SUBJECT_DEFINITIONS, matchKeywords, type EmotionValence } from './lexicon';

export function normalizeText(text: string): string {
  return text.toLowerCase().trim();
}

/** Tags an entry with the subjects Cherry Brain can plainly recognize from its text. Pure and side-effect free. */
export function detectSubjects(text: string): SuggestedSubject[] {
  const normalized = normalizeText(text);
  const subjects: SuggestedSubject[] = [];
  for (const def of SUBJECT_DEFINITIONS) {
    if (matchKeywords(normalized, def.keywords)) {
      subjects.push({ key: def.key, label: def.label, source: 'system' });
    }
  }
  return subjects;
}

export function detectEmotions(text: string): EmotionValence[] {
  const normalized = normalizeText(text);
  const found: EmotionValence[] = [];
  for (const def of EMOTION_DEFINITIONS) {
    if (matchKeywords(normalized, def.keywords)) {
      found.push(def.valence);
    }
  }
  return found;
}

export interface DosageChange {
  medication: string;
  from: string;
  to: string;
}

const DOSAGE_PATTERN = /\b([a-z]+)\b[^.]{0,40}?(\d+(?:\.\d+)?)\s*mg[^.]{0,20}?(?:to|->|→)\s*(\d+(?:\.\d+)?)\s*mg/i;

export function detectDosageChange(text: string): DosageChange | null {
  const match = DOSAGE_PATTERN.exec(text);
  if (!match) return null;
  const [, medication, from, to] = match;
  return { medication: medication.toLowerCase(), from, to };
}

export function tagEntrySubjects(entry: Pick<JournalEntry, 'text'>): SuggestedSubject[] {
  return detectSubjects(entry.text);
}
