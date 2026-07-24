/**
 * A best-effort lexical guard against interpretation disguised as a factual
 * summary. This cannot catch everything a generative provider might produce,
 * but it rejects the clearest cases: diagnostic language, motive attribution,
 * and character judgments a rule-based (or future AI) provider must never
 * state as fact.
 */
export const BANNED_INTERPRETIVE_PHRASES = [
  'diagnos',
  'disorder',
  'manipulat',
  'narcissist',
  'toxic',
  'abusive',
  'gaslight',
  'controlling',
  'trying to control',
  'attempted to control',
  'always does this',
  'never listens',
  'clearly wants to',
  'definitely trying to',
  'was trying to shame',
  'attempted to shame',
];

export function containsBannedPhrase(text: string): string | null {
  const normalized = text.toLowerCase();
  for (const phrase of BANNED_INTERPRETIVE_PHRASES) {
    if (normalized.includes(phrase)) return phrase;
  }
  return null;
}
