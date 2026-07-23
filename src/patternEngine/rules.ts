import type { AnalysisCategory, JournalEntry } from '@/models';
import { detectDosageChange, detectEmotions, detectSubjects, normalizeText } from './tagging';

export interface RuleCandidate {
  ruleKey: string;
  title: string;
  description: string;
  category: AnalysisCategory;
  relatedSubjects: string[];
  evidenceEntryIds: string[];
}

interface TaggedEntry {
  entry: JournalEntry;
  subjectKeys: Set<string>;
  emotionValences: Set<string>;
}

function tagEntries(entries: JournalEntry[]): TaggedEntry[] {
  return entries.map((entry) => ({
    entry,
    subjectKeys: new Set(detectSubjects(entry.text).map((s) => s.key)),
    emotionValences: new Set(detectEmotions(entry.text)),
  }));
}

function idsWith(tagged: TaggedEntry[], subjectKey?: string, emotion?: string): string[] {
  return tagged
    .filter((t) => (subjectKey ? t.subjectKeys.has(subjectKey) : true) && (emotion ? t.emotionValences.has(emotion) : true))
    .map((t) => t.entry.id);
}

function withinDays(aIso: string, bIso: string, days: number): boolean {
  const ms = Math.abs(new Date(aIso).getTime() - new Date(bIso).getTime());
  return ms <= days * 24 * 60 * 60 * 1000;
}

/** The flagship demonstration rule: irritation aimed at external demands, contrasted with warmth toward close ones, read alongside low alertness rather than as generalized hostility. */
function selectiveIrritabilityRule(tagged: TaggedEntry[]): RuleCandidate[] {
  const irritatedAtFamily = idsWith(tagged, 'family_demands', 'irritation');
  const warmTowardKidsPets = idsWith(tagged, 'children_pets', 'warmth');

  if (irritatedAtFamily.length < 1 || warmTowardKidsPets.length < 1) return [];
  if (irritatedAtFamily.length + warmTowardKidsPets.length < 2) return [];

  const contextEntries = tagged.filter(
    (t) => t.subjectKeys.has('energy_alertness') || t.emotionValences.has('low_alertness') || t.subjectKeys.has('medication'),
  );
  const contextIds = new Set<string>();
  for (const irritatedId of irritatedAtFamily) {
    const irritatedEntry = tagged.find((t) => t.entry.id === irritatedId)!.entry;
    for (const c of contextEntries) {
      if (withinDays(c.entry.createdAt, irritatedEntry.createdAt, 2)) contextIds.add(c.entry.id);
    }
  }

  const evidenceEntryIds = Array.from(new Set([...irritatedAtFamily, ...warmTowardKidsPets, ...contextIds]));

  const contextNote = contextIds.size > 0
    ? ' It shows up around times when your alertness was already low, which tends to shorten anyone’s patience.'
    : '';

  return [
    {
      ruleKey: 'selective_irritability',
      title: 'Your irritation may be selective, not global',
      description:
        'The irritation in your entries seems to point at external demands and obligations — not at the people closest to you. ' +
        'In the same stretch of time, you’ve written warmly about your kids and dogs.' +
        contextNote +
        ' This reads as selective frustration with what’s being asked of you, not generalized hostility.',
      category: 'mood_emotional',
      relatedSubjects: ['family_demands', 'children_pets', 'energy_alertness'],
      evidenceEntryIds,
    },
  ];
}

function creativeRestorativeRule(tagged: TaggedEntry[]): RuleCandidate[] {
  const ids = new Set<string>();
  for (const t of tagged) {
    if (t.subjectKeys.has('creative_work') && (t.emotionValences.has('animated') || t.emotionValences.has('warmth'))) {
      ids.add(t.entry.id);
    }
  }
  if (ids.size < 2) return [];
  return [
    {
      ruleKey: 'creative_work_restorative',
      title: 'Creative work appears restorative',
      description:
        'When you write about software or creative projects, your tone tends to lift — more animated, more energized. ' +
        'Creative work looks less like a task on your list and more like something that fills you back up.',
      category: 'creative_interests',
      relatedSubjects: ['creative_work'],
      evidenceEntryIds: Array.from(ids),
    },
  ];
}

function comfortPlaceFrictionRule(tagged: TaggedEntry[]): RuleCandidate[] {
  const ids = new Set<string>();
  for (const t of tagged) {
    const leavingSubject = t.subjectKeys.has('errands_pharmacy') || t.subjectKeys.has('comfort_place');
    if (leavingSubject && t.emotionValences.has('resistance')) {
      ids.add(t.entry.id);
    }
  }
  if (ids.size < 2) return [];
  return [
    {
      ruleKey: 'comfort_place_friction',
      title: 'Leaving your comfort place seems to cost you something',
      description:
        'More than once, you’ve noted resistance around leaving home or waiting somewhere unfamiliar, like the pharmacy. ' +
        'That friction looks less like laziness and more like a real cost to stepping outside a space that feels settled.',
      category: 'household_patterns',
      relatedSubjects: ['comfort_place', 'errands_pharmacy'],
      evidenceEntryIds: Array.from(ids),
    },
  ];
}

function medicationChangeRule(entries: JournalEntry[]): RuleCandidate[] {
  const changes = entries
    .map((entry) => ({ entry, change: detectDosageChange(entry.text) }))
    .filter((x): x is { entry: JournalEntry; change: NonNullable<ReturnType<typeof detectDosageChange>> } => x.change != null);

  if (changes.length === 0) return [];

  const grogginessEntries = entries.filter((e) => {
    const normalized = normalizeText(e.text);
    return /groggy|foggy|sluggish|out of it/.test(normalized);
  });

  const candidates: RuleCandidate[] = [];
  for (const { entry, change } of changes) {
    const relatedGroggy = grogginessEntries.filter((g) => withinDays(g.createdAt, entry.createdAt, 2) && g.id !== entry.id);
    const evidenceEntryIds = Array.from(new Set([entry.id, ...relatedGroggy.map((g) => g.id)]));
    if (evidenceEntryIds.length < 2) continue;

    candidates.push({
      ruleKey: `medication_change_${change.medication}`,
      title: `${capitalize(change.medication)} change noted alongside how you’ve felt`,
      description:
        `You noted ${change.medication} moving from ${change.from}mg to ${change.to}mg, and nearby entries mention feeling groggy or foggy. ` +
        'This is just a timing observation, not a medical judgment — worth mentioning to whoever manages this prescription.',
      category: 'medication',
      relatedSubjects: ['medication', 'energy_alertness'],
      evidenceEntryIds,
    });
  }
  return candidates;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** A modest generic fallback: any two subjects (not already covered above) that keep showing up in the same entries. */
function genericCooccurrenceRule(tagged: TaggedEntry[]): RuleCandidate[] {
  const handledPairs = new Set(['family_demands|children_pets', 'creative_work', 'errands_pharmacy|comfort_place']);
  const subjectKeys = Array.from(new Set(tagged.flatMap((t) => Array.from(t.subjectKeys))));
  const candidates: RuleCandidate[] = [];

  for (let i = 0; i < subjectKeys.length; i += 1) {
    for (let j = i + 1; j < subjectKeys.length; j += 1) {
      const a = subjectKeys[i];
      const b = subjectKeys[j];
      const pairKey = [a, b].sort().join('|');
      if (handledPairs.has(pairKey)) continue;

      const ids = tagged.filter((t) => t.subjectKeys.has(a) && t.subjectKeys.has(b)).map((t) => t.entry.id);
      if (ids.length < 2) continue;

      candidates.push({
        ruleKey: `cooccurrence_${pairKey}`,
        title: `${labelFor(a)} and ${labelFor(b)} keep showing up together`,
        description: `Entries that mention ${labelFor(a).toLowerCase()} and ${labelFor(b).toLowerCase()} keep landing close together. Worth noticing whether one tends to bring on the other.`,
        category: 'household_patterns',
        relatedSubjects: [a, b],
        evidenceEntryIds: ids,
      });
    }
  }
  return candidates;
}

function labelFor(subjectKey: string): string {
  return subjectKey
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function generateCandidates(entries: JournalEntry[]): RuleCandidate[] {
  const tagged = tagEntries(entries);
  return [
    ...selectiveIrritabilityRule(tagged),
    ...creativeRestorativeRule(tagged),
    ...comfortPlaceFrictionRule(tagged),
    ...medicationChangeRule(entries),
    ...genericCooccurrenceRule(tagged),
  ];
}
