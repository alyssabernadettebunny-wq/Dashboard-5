/**
 * Conservative, transparent rules for deciding whether a sentence describes a
 * concrete, reconstructable occurrence versus a vague internal-state statement
 * with nothing factual to extract. Keyword-based and intentionally narrow —
 * the safe default is to treat a sentence as an event candidate.
 */

const ACTION_VERBS = [
  'missed', 'call', 'called', 'argued', 'told', 'said', 'went', 'saw', 'met', 'left', 'arrived',
  'woke', 'forgot', 'cried', 'yelled', 'hit', 'drove', 'texted', 'visited', 'cooked', 'bought',
  'walked', 'ran', 'slept', 'fell', 'waited', 'cancelled', 'canceled', 'rescheduled', 'apologized',
  'fought', 'hugged', 'kissed', 'helped', 'ignored', 'cleaned', 'finished', 'started', 'stopped',
  'skipped', 'messaged', 'emailed', 'asked', 'answered', 'laughed', 'screamed', 'slammed', 'stayed',
  'worked', 'wrote', 'read', 'ate', 'drank', 'took', 'gave', 'dropped', 'picked', 'showed',
  'explained', 'listened', 'watched', 'attended', 'scheduled', 'paid', 'signed', 'submitted',
];

const STATIVE_MOOD_PATTERN =
  /^(everything|nothing|things?|it|i)\s+(feels?|felt|seems?|seemed|was|is)\b.*\b(strange|weird|off|fine|okay|ok|tired|numb|heavy|foggy|blank|empty|different)\b/i;

function containsWord(normalizedText: string, word: string): boolean {
  const pattern = new RegExp(`\\b${word}\\b`, 'i');
  return pattern.test(normalizedText);
}

/**
 * True when the sentence looks like a concrete, factual occurrence worth
 * reconstructing as an event, rather than a vague mood/state statement.
 * A named participant is always a strong signal of a real event.
 */
export function looksLikeConcreteEvent(sentence: string, participants: string[]): boolean {
  if (participants.length > 0) return true;

  const trimmed = sentence.trim();
  if (STATIVE_MOOD_PATTERN.test(trimmed)) return false;

  return ACTION_VERBS.some((verb) => containsWord(trimmed, verb));
}
