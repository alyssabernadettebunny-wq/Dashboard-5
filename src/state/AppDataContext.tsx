import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import {
  createDefaultSettings,
  generateId,
  type AnalysisCategory,
  type AppSettings,
  type JournalEntry,
  type PatternFeedbackType,
  type PatternObservation,
} from '@/models';
import { contextEngine, triggerContextExtraction } from '@/contextEngine';
import { patternEngine, tagEntrySubjects } from '@/patternEngine';
import { buildSeedEntries, isSeedEntryId } from '@/seed';
import { entryRepository, patternRepository, settingsRepository, storageIntegrityRegistry, type CorruptStorageRecord } from '@/storage';
import { StorageRecoveryScreen } from '@/components/StorageRecoveryScreen';
import { syncConnectedPatternIds } from './deriveConnections';

export interface CreateEntryInput {
  title?: string;
  text: string;
  isImportant: boolean;
}

export interface UpdateEntryInput {
  title?: string;
  text: string;
  isImportant: boolean;
}

interface AppDataContextValue {
  loading: boolean;
  entries: JournalEntry[];
  patterns: PatternObservation[];
  settings: AppSettings;
  createEntry: (input: CreateEntryInput) => Promise<JournalEntry>;
  updateEntry: (id: string, input: UpdateEntryInput) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addUserTag: (entryId: string, tag: string) => Promise<void>;
  addPatternFeedback: (patternId: string, type: PatternFeedbackType, note?: string) => Promise<void>;
  setPatternPaused: (patternId: string, isPaused: boolean) => Promise<void>;
  mergePatterns: (sourceId: string, targetId: string) => Promise<void>;
  suppressSubject: (subjectKey: string) => Promise<void>;
  unsuppressSubject: (subjectKey: string) => Promise<void>;
  setBoundary: (category: AnalysisCategory, enabled: boolean) => Promise<void>;
  loadSeedData: () => Promise<void>;
  removeSeedData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

async function recompute(entries: JournalEntry[], existingPatterns: PatternObservation[], settings: AppSettings) {
  const { patterns } = patternEngine.analyze({ entries, existingPatterns, settings });
  const syncedEntries = syncConnectedPatternIds(entries, patterns);
  await Promise.all([entryRepository.replaceAll(syncedEntries), patternRepository.replaceAll(patterns)]);
  return { entries: syncedEntries, patterns };
}

export function AppDataProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [patterns, setPatterns] = useState<PatternObservation[]>([]);
  const [settings, setSettings] = useState<AppSettings>(createDefaultSettings());
  const [storageProblems, setStorageProblems] = useState<CorruptStorageRecord[]>([]);
  const [loadVersion, setLoadVersion] = useState(0);
  const createEntryInFlight = useRef<Promise<JournalEntry> | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [loadedEntries, loadedPatterns, loadedSettings] = await Promise.all([
          entryRepository.getAll(),
          patternRepository.getAll(),
          settingsRepository.get(),
        ]);
        if (!active) return;
        setEntries(loadedEntries);
        setPatterns(loadedPatterns);
        setSettings(loadedSettings);
        setStorageProblems([]);
      } catch {
        if (!active) return;
        setStorageProblems(storageIntegrityRegistry.getAll());
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadVersion]);

  const createEntry = useCallback(
    (input: CreateEntryInput): Promise<JournalEntry> => {
      if (createEntryInFlight.current) return createEntryInFlight.current;

      const operation = (async () => {
        const now = new Date().toISOString();
        const entry: JournalEntry = {
          id: generateId('entry'),
          createdAt: now,
          updatedAt: now,
          title: input.title?.trim() || undefined,
          text: input.text.trim(),
          isImportant: input.isImportant,
          entryType: 'text',
          suggestedSubjects: tagEntrySubjects({ text: input.text }),
          userTags: [],
          connectedPatternIds: [],
        };
        const nextEntries = [...entries, entry];
        const result = await recompute(nextEntries, patterns, settings);
        setEntries(result.entries);
        setPatterns(result.patterns);
        const createdEntry = result.entries.find((e) => e.id === entry.id)!;

        triggerContextExtraction(createdEntry, contextEngine);
        return createdEntry;
      })();

      createEntryInFlight.current = operation;
      void operation.finally(() => {
        if (createEntryInFlight.current === operation) createEntryInFlight.current = null;
      });
      return operation;
    },
    [entries, patterns, settings],
  );

  const updateEntry = useCallback(
    async (id: string, input: UpdateEntryInput) => {
      const now = new Date().toISOString();
      const nextEntries = entries.map((e) =>
        e.id === id
          ? {
              ...e,
              title: input.title?.trim() || undefined,
              text: input.text.trim(),
              isImportant: input.isImportant,
              suggestedSubjects: tagEntrySubjects({ text: input.text }),
              updatedAt: now,
            }
          : e,
      );
      const result = await recompute(nextEntries, patterns, settings);
      setEntries(result.entries);
      setPatterns(result.patterns);
    },
    [entries, patterns, settings],
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      const nextEntries = entries.filter((e) => e.id !== id);
      const prunedPatterns = patterns
        .map((p) => ({ ...p, evidence: p.evidence.filter((ev) => ev.entryId !== id) }))
        .filter((p) => p.evidence.length >= 2 || p.feedbackHistory.length > 0);
      const syncedEntries = syncConnectedPatternIds(nextEntries, prunedPatterns);
      await Promise.all([entryRepository.replaceAll(syncedEntries), patternRepository.replaceAll(prunedPatterns)]);
      setEntries(syncedEntries);
      setPatterns(prunedPatterns);
    },
    [entries, patterns],
  );

  const addUserTag = useCallback(
    async (entryId: string, tag: string) => {
      const trimmed = tag.trim();
      if (!trimmed) return;
      const nextEntries = entries.map((e) =>
        e.id === entryId && !e.userTags.includes(trimmed) ? { ...e, userTags: [...e.userTags, trimmed] } : e,
      );
      setEntries(nextEntries);
      await entryRepository.replaceAll(nextEntries);
    },
    [entries],
  );

  const addPatternFeedback = useCallback(
    async (patternId: string, type: PatternFeedbackType, note?: string) => {
      const now = new Date().toISOString();
      const nextPatterns = patterns.map((p) =>
        p.id === patternId
          ? {
              ...p,
              feedbackHistory: [...p.feedbackHistory, { id: generateId('feedback'), type, createdAt: now, note }],
              updatedAt: now,
            }
          : p,
      );

      let nextSettings = settings;
      if (type === 'suppressed_subject') {
        const pattern = patterns.find((p) => p.id === patternId);
        if (pattern) {
          const newSubjects = pattern.relatedSubjects.filter((s) => !settings.suppressedSubjects.includes(s));
          if (newSubjects.length > 0) {
            nextSettings = {
              ...settings,
              suppressedSubjects: [...settings.suppressedSubjects, ...newSubjects],
              updatedAt: now,
            };
          }
        }
      }

      setPatterns(nextPatterns);
      await patternRepository.replaceAll(nextPatterns);
      if (nextSettings !== settings) {
        setSettings(nextSettings);
        await settingsRepository.save(nextSettings);
      }
    },
    [patterns, settings],
  );

  const setPatternPaused = useCallback(
    async (patternId: string, isPaused: boolean) => {
      const nextPatterns = patterns.map((p) => (p.id === patternId ? { ...p, isPaused, updatedAt: new Date().toISOString() } : p));
      setPatterns(nextPatterns);
      await patternRepository.replaceAll(nextPatterns);
    },
    [patterns],
  );

  const mergePatterns = useCallback(
    async (sourceId: string, targetId: string) => {
      const source = patterns.find((p) => p.id === sourceId);
      const target = patterns.find((p) => p.id === targetId);
      if (!source || !target || source.id === target.id) return;
      const now = new Date().toISOString();

      const existingEntryIds = new Set(target.evidence.map((e) => e.entryId));
      const mergedEvidence = [...target.evidence, ...source.evidence.filter((e) => !existingEntryIds.has(e.entryId))];

      const nextPatterns = patterns.map((p) => {
        if (p.id === targetId) {
          return {
            ...p,
            evidence: mergedEvidence,
            relatedSubjects: Array.from(new Set([...p.relatedSubjects, ...source.relatedSubjects])),
            mergedFromIds: [...p.mergedFromIds, source.id],
            updatedAt: now,
          };
        }
        if (p.id === sourceId) {
          return { ...p, mergedIntoId: targetId, updatedAt: now };
        }
        return p;
      });

      setPatterns(nextPatterns);
      await patternRepository.replaceAll(nextPatterns);
    },
    [patterns],
  );

  const suppressSubject = useCallback(
    async (subjectKey: string) => {
      if (settings.suppressedSubjects.includes(subjectKey)) return;
      const nextSettings = { ...settings, suppressedSubjects: [...settings.suppressedSubjects, subjectKey], updatedAt: new Date().toISOString() };
      setSettings(nextSettings);
      await settingsRepository.save(nextSettings);
    },
    [settings],
  );

  const unsuppressSubject = useCallback(
    async (subjectKey: string) => {
      const nextSettings = {
        ...settings,
        suppressedSubjects: settings.suppressedSubjects.filter((s) => s !== subjectKey),
        updatedAt: new Date().toISOString(),
      };
      setSettings(nextSettings);
      await settingsRepository.save(nextSettings);
    },
    [settings],
  );

  const setBoundary = useCallback(
    async (category: AnalysisCategory, enabled: boolean) => {
      const nextSettings: AppSettings = {
        ...settings,
        boundaries: { ...settings.boundaries, [category]: enabled },
        updatedAt: new Date().toISOString(),
      };
      setSettings(nextSettings);
      await settingsRepository.save(nextSettings);
    },
    [settings],
  );

  const loadSeedData = useCallback(async () => {
    const seedEntries = buildSeedEntries();
    const existingIds = new Set(entries.map((e) => e.id));
    const nextEntries = [...entries, ...seedEntries.filter((e) => !existingIds.has(e.id))];
    const result = await recompute(nextEntries, patterns, settings);
    setEntries(result.entries);
    setPatterns(result.patterns);
    const nextSettings = { ...settings, seedDataLoaded: true, updatedAt: new Date().toISOString() };
    setSettings(nextSettings);
    await settingsRepository.save(nextSettings);
  }, [entries, patterns, settings]);

  const removeSeedData = useCallback(async () => {
    const nextEntries = entries.filter((e) => !isSeedEntryId(e.id));
    const remainingIds = new Set(nextEntries.map((e) => e.id));
    const prunedPatterns = patterns
      .map((p) => ({ ...p, evidence: p.evidence.filter((ev) => remainingIds.has(ev.entryId)) }))
      .filter((p) => p.evidence.length >= 2 || p.feedbackHistory.length > 0);
    const syncedEntries = syncConnectedPatternIds(nextEntries, prunedPatterns);
    await Promise.all([entryRepository.replaceAll(syncedEntries), patternRepository.replaceAll(prunedPatterns)]);
    setEntries(syncedEntries);
    setPatterns(prunedPatterns);
    const nextSettings = { ...settings, seedDataLoaded: false, updatedAt: new Date().toISOString() };
    setSettings(nextSettings);
    await settingsRepository.save(nextSettings);
  }, [entries, patterns, settings]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      loading,
      entries,
      patterns,
      settings,
      createEntry,
      updateEntry,
      deleteEntry,
      addUserTag,
      addPatternFeedback,
      setPatternPaused,
      mergePatterns,
      suppressSubject,
      unsuppressSubject,
      setBoundary,
      loadSeedData,
      removeSeedData,
    }),
    [
      loading,
      entries,
      patterns,
      settings,
      createEntry,
      updateEntry,
      deleteEntry,
      addUserTag,
      addPatternFeedback,
      setPatternPaused,
      mergePatterns,
      suppressSubject,
      unsuppressSubject,
      setBoundary,
      loadSeedData,
      removeSeedData,
    ],
  );

  if (storageProblems.length > 0) {
    return <StorageRecoveryScreen records={storageProblems} onRecovered={() => setLoadVersion((value) => value + 1)} />;
  }

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within AppDataProvider');
  return ctx;
}
