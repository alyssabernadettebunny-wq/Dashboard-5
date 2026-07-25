/** Extracts only explicit, useful participant labels. */

const RELATIONSHIP_WORDS = [
  'mom', 'mother', 'dad', 'father', 'sister', 'brother', 'mum', 'grandma', 'grandmother',
  'grandpa', 'grandfather', 'wife', 'husband', 'partner', 'boyfriend', 'girlfriend', 'friend',
  'boss', 'coworker', 'son', 'daughter',
];

const STOPWORDS = new Set([
  'i', 'ill', 'im', 'ive', 'id', 'the', 'a', 'an', 'this', 'that', 'later', 'then', 'after', 'before',
  'today', 'tonight', 'yesterday', 'tomorrow', 'and', 'but', 'so', 'it', 'everything', 'nothing',
  'oh', 'ok', 'okay', 'she', 'he', 'him', 'her', 'they', 'them', 'we', 'us', 'because', 'another', 'one',
]);

export function extractParticipants(sentence: string): string[] {
  const found: string[] = [];
  const seenLower = new Set<string>();
  const textWithoutQuotes = sentence.replace(/[“"][^”"]*[”"]/g, ' ');

  const addIfNew = (phrase: string) => {
    const cleaned = phrase.trim();
    const key = cleaned.toLowerCase();
    if (!cleaned || STOPWORDS.has(key) || seenLower.has(key)) return;
    if (/^(son|daughter|sister|brother|friend)$/i.test(cleaned)) return;
    seenLower.add(key);
    found.push(cleaned);
  };

  for (const rel of RELATIONSHIP_WORDS) {
    const re = new RegExp(`\\b((?:my|our|his|her|their)\\s+)?(${rel})\\b`, 'i');
    const match = re.exec(textWithoutQuotes);
    if (match) {
      const possessive = match[1] ?? '';
      if (possessive || !/^(son|daughter|sister|brother|friend)$/i.test(match[2])) {
        addIfNew(`${possessive}${match[2]}`);
      }
    }
  }

  const words = textWithoutQuotes.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    const rawToken = words[i];
    if (/[’']/.test(rawToken)) continue;
    const raw = rawToken.replace(/[^A-Za-z]/g, '');
    if (!raw || !/^[A-Z][a-z]+$/.test(raw) || STOPWORDS.has(raw.toLowerCase())) continue;

    const alreadyCovered = found.some((f) => f.toLowerCase().split(/\s+/).includes(raw.toLowerCase()));
    if (!alreadyCovered) addIfNew(raw);
  }

  return found;
}

export function filterDisplayParticipants(participants: string[]): string[] {
  return participants.filter((participant) => {
    const value = participant.trim().toLowerCase();
    if (!value || STOPWORDS.has(value)) return false;
    if (/^(son|daughter|sister|brother|friend|person|someone)$/.test(value)) return false;
    return value.length > 1;
  });
}
