/**
 * Extracts only participants explicitly present in the text — a known
 * relationship word (optionally with a possessive, e.g. "my mother"), or a
 * capitalized word that isn't the first word of the sentence (a plain name
 * like "Amy"). Never infers an identity that wasn't stated.
 */

const RELATIONSHIP_WORDS = [
  'mom', 'mother', 'dad', 'father', 'sister', 'brother', 'mum', 'grandma', 'grandmother',
  'grandpa', 'grandfather', 'wife', 'husband', 'partner', 'boyfriend', 'girlfriend', 'friend',
  'boss', 'coworker', 'son', 'daughter',
];

const SENTENCE_INITIAL_STOPWORDS = new Set([
  'i', 'the', 'a', 'an', 'this', 'that', 'later', 'then', 'after', 'before', 'today', 'tonight',
  'yesterday', 'tomorrow', 'and', 'but', 'so', 'it', 'everything', 'nothing',
]);

export function extractParticipants(sentence: string): string[] {
  const found: string[] = [];
  const seenLower = new Set<string>();

  const addIfNew = (phrase: string) => {
    const key = phrase.toLowerCase();
    if (seenLower.has(key)) return;
    seenLower.add(key);
    found.push(phrase);
  };

  for (const rel of RELATIONSHIP_WORDS) {
    const re = new RegExp(`\\b((?:my|our|his|her|their)\\s+)?(${rel})\\b`, 'i');
    const match = re.exec(sentence);
    if (match) {
      const phrase = `${match[1] ?? ''}${match[2]}`.trim();
      addIfNew(phrase);
    }
  }

  const words = sentence.split(/\s+/);
  for (let i = 0; i < words.length; i += 1) {
    const raw = words[i].replace(/[^A-Za-z]/g, '');
    if (!raw) continue;
    if (i === 0) continue;
    if (!/^[A-Z][a-z]+$/.test(raw)) continue;
    if (SENTENCE_INITIAL_STOPWORDS.has(raw.toLowerCase())) continue;

    const alreadyCovered = found.some((f) => f.toLowerCase().includes(raw.toLowerCase()));
    if (alreadyCovered) continue;
    addIfNew(raw);
  }

  return found;
}
