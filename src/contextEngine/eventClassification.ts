/** Conservative, transparent rules for deciding whether text describes a standalone occurrence. */

const ACTION_VERBS = [
  'missed', 'call', 'called', 'argued', 'told', 'said', 'went', 'saw', 'met', 'left', 'arrived',
  'woke', 'forgot', 'cried', 'yelled', 'hit', 'drove', 'texted', 'visited', 'cooked', 'bought',
  'walked', 'ran', 'slept', 'fell', 'waited', 'cancelled', 'canceled', 'rescheduled', 'apologized',
  'fought', 'hugged', 'kissed', 'helped', 'ignored', 'cleaned', 'finished', 'started', 'stopped',
  'skipped', 'messaged', 'emailed', 'asked', 'answered', 'laughed', 'screamed', 'slammed', 'stayed',
  'worked', 'wrote', 'read', 'ate', 'drank', 'took', 'gave', 'dropped', 'picked', 'showed',
  'explained', 'listened', 'watched', 'attended', 'scheduled', 'paid', 'signed', 'submitted',
  'complained', 'digging', 'discussed', 'talking', 'leaving', 'dogsitting', 'dogsit',
];

const STATIVE_MOOD_PATTERN =
  /^(everything|nothing|things?|it|i)\s+(feels?|felt|seems?|seemed|was|is)\b.*\b(strange|weird|off|fine|okay|ok|tired|numb|heavy|foggy|blank|empty|different)\b/i;

const NON_EVENT_START = /^(because|although|even though|not even|especially|instead|which|that|and that|but that)\b/i;
const REFLECTION_PATTERN = /\b(i (?:felt|feel|think|thought|believe|believed|realized|noticed)|this (?:irritated|bothered|upset|made me think)|there (?:were|are) more instances|i(?:'|’)ll talk about|another time\.?$|was funny|was ridiculous|not a big deal)\b/i;
const GENERAL_STATE_PATTERN = /\b(is|are|was|were|has been|have been)\s+(?:an?|the|extremely|very|not)\b/i;

function containsWord(normalizedText: string, word: string): boolean {
  const pattern = new RegExp(`\\b${word}\\b`, 'i');
  return pattern.test(normalizedText);
}

export function looksLikeConcreteEvent(sentence: string, participants: string[]): boolean {
  const trimmed = sentence.trim();
  if (!trimmed || trimmed.length < 12) return false;
  if (STATIVE_MOOD_PATTERN.test(trimmed)) return false;
  if (NON_EVENT_START.test(trimmed)) return false;
  if (REFLECTION_PATTERN.test(trimmed)) return false;

  const hasAction = ACTION_VERBS.some((verb) => containsWord(trimmed, verb));
  if (!hasAction) return false;

  // A participant helps, but no longer automatically promotes any sentence into an event.
  if (GENERAL_STATE_PATTERN.test(trimmed) && !/\b(told|said|left|dropped|picked|complained|asked|paid|gave|took)\b/i.test(trimmed)) {
    return false;
  }

  return participants.length > 0 || /\b(i|we|she|he|they|someone)\b/i.test(trimmed);
}

export function startsNewOccurrence(sentence: string): boolean {
  return /^(one of the times|another time|earlier|later|this morning|this afternoon|this evening|tonight|yesterday|today|before that|after that)\b/i.test(sentence.trim());
}
