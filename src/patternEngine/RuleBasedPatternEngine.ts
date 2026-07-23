import { generateId, type JournalEntry, type PatternObservation } from '@/models';
import type { PatternEngine, PatternEngineInput, PatternEngineResult } from './PatternEngine';
import { generateCandidates, type RuleCandidate } from './rules';
import { statusFromEvidenceCount } from './status';

const MIN_EVIDENCE_TO_CREATE = 2;

function snippetFor(entry: JournalEntry): string {
  const text = entry.text.trim().replace(/\s+/g, ' ');
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

function candidateIsAllowed(candidate: RuleCandidate, input: PatternEngineInput): boolean {
  if (!input.settings.boundaries[candidate.category]) return false;
  if (candidate.relatedSubjects.some((s) => input.settings.suppressedSubjects.includes(s))) return false;
  return true;
}

export class RuleBasedPatternEngine implements PatternEngine {
  analyze(input: PatternEngineInput): PatternEngineResult {
    const now = new Date().toISOString();
    const entryById = new Map(input.entries.map((e) => [e.id, e]));
    const candidates = generateCandidates(input.entries).filter((c) => candidateIsAllowed(c, input));

    const byRuleKey = new Map(input.existingPatterns.map((p) => [p.ruleKey, p]));
    const patterns: PatternObservation[] = [...input.existingPatterns];

    for (const candidate of candidates) {
      const existing = byRuleKey.get(candidate.ruleKey);

      if (!existing) {
        if (candidate.evidenceEntryIds.length < MIN_EVIDENCE_TO_CREATE) continue;
        const evidence = candidate.evidenceEntryIds.map((entryId) => {
          const entry = entryById.get(entryId)!;
          return {
            id: generateId('evidence'),
            entryId,
            entrySnippet: snippetFor(entry),
            entryCreatedAt: entry.createdAt,
            addedAt: now,
          };
        });
        const created: PatternObservation = {
          id: generateId('pattern'),
          ruleKey: candidate.ruleKey,
          title: candidate.title,
          description: candidate.description,
          category: candidate.category,
          status: statusFromEvidenceCount(evidence.length),
          relatedSubjects: candidate.relatedSubjects,
          firstObservedAt: now,
          lastSupportingAt: now,
          evidence,
          feedbackHistory: [],
          isPaused: false,
          mergedFromIds: [],
          createdAt: now,
          updatedAt: now,
        };
        patterns.push(created);
        byRuleKey.set(candidate.ruleKey, created);
        continue;
      }

      if (existing.isPaused || existing.mergedIntoId) continue;

      const existingEntryIds = new Set(existing.evidence.map((e) => e.entryId));
      const newEntryIds = candidate.evidenceEntryIds.filter((id) => !existingEntryIds.has(id));
      if (newEntryIds.length === 0) continue;

      const newEvidence = newEntryIds.map((entryId) => {
        const entry = entryById.get(entryId)!;
        return {
          id: generateId('evidence'),
          entryId,
          entrySnippet: snippetFor(entry),
          entryCreatedAt: entry.createdAt,
          addedAt: now,
        };
      });

      const index = patterns.findIndex((p) => p.id === existing.id);
      const merged: PatternObservation = {
        ...existing,
        evidence: [...existing.evidence, ...newEvidence],
        status: statusFromEvidenceCount(existing.evidence.length + newEvidence.length),
        lastSupportingAt: now,
        updatedAt: now,
      };
      patterns[index] = merged;
      byRuleKey.set(candidate.ruleKey, merged);
    }

    return { patterns };
  }
}

export const patternEngine: PatternEngine = new RuleBasedPatternEngine();
