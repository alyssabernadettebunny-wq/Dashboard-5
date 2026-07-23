import type { JournalEntry, PatternObservation } from '@/models';

export function syncConnectedPatternIds(entries: JournalEntry[], patterns: PatternObservation[]): JournalEntry[] {
  const patternIdsByEntry = new Map<string, string[]>();
  for (const pattern of patterns) {
    if (pattern.mergedIntoId) continue;
    for (const evidence of pattern.evidence) {
      const list = patternIdsByEntry.get(evidence.entryId) ?? [];
      list.push(pattern.id);
      patternIdsByEntry.set(evidence.entryId, list);
    }
  }
  return entries.map((entry) => ({ ...entry, connectedPatternIds: patternIdsByEntry.get(entry.id) ?? [] }));
}
