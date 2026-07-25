import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { JournalEntry as AppJournalEntry, PatternObservation, AppSettings } from '@/models';
import type {
  ClarificationQuestion,
  EventTimelineVisibility,
  ExtractionRecord,
  FactCorrection,
  JournalEntry as ContextJournalEntry,
  ReconstructedEvent,
} from '@/contextEngine';
import { CONTEXT_ENGINE_KEYS } from '@/contextEngine/storage';
import { STORAGE_KEYS } from '@/storage/keys';

export interface CherryBrainBackup {
  format: 'cherry-brain-backup';
  version: 1;
  exportedAt: string;
  integrityWarnings: { key: string; rawValue: string; error: string }[];
  appData: {
    journalEntries: AppJournalEntry[];
    patterns: PatternObservation[];
    settings: AppSettings | null;
    contextJournalEntries: ContextJournalEntry[];
    reconstructedEvents: ReconstructedEvent[];
    clarificationQuestions: ClarificationQuestion[];
    factCorrections: FactCorrection[];
    extractionRecords: ExtractionRecord[];
    timelineVisibility: EventTimelineVisibility[];
  };
}

const ARRAY_KEYS = {
  journalEntries: STORAGE_KEYS.entries,
  patterns: STORAGE_KEYS.patterns,
  contextJournalEntries: CONTEXT_ENGINE_KEYS.journalEntries,
  reconstructedEvents: CONTEXT_ENGINE_KEYS.events,
  clarificationQuestions: CONTEXT_ENGINE_KEYS.clarifications,
  factCorrections: CONTEXT_ENGINE_KEYS.factCorrections,
  extractionRecords: CONTEXT_ENGINE_KEYS.extractionRecords,
  timelineVisibility: CONTEXT_ENGINE_KEYS.eventTimelineVisibility,
} as const;

async function readArray<T>(key: string, readableOnly: boolean, warnings: CherryBrainBackup['integrityWarnings']): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('Expected an array.');
    return parsed as T[];
  } catch (error) {
    const warning = { key, rawValue: raw, error: error instanceof Error ? error.message : String(error) };
    warnings.push(warning);
    if (!readableOnly) throw new Error(`Backup stopped because ${key} is unreadable.`);
    return [];
  }
}

async function readObject<T>(key: string, readableOnly: boolean, warnings: CherryBrainBackup['integrityWarnings']): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw == null) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Expected an object.');
    return parsed as T;
  } catch (error) {
    warnings.push({ key, rawValue: raw, error: error instanceof Error ? error.message : String(error) });
    if (!readableOnly) throw new Error(`Backup stopped because ${key} is unreadable.`);
    return null;
  }
}

export async function createCherryBrainBackup(options: { readableOnly?: boolean } = {}): Promise<CherryBrainBackup> {
  const readableOnly = options.readableOnly ?? false;
  const integrityWarnings: CherryBrainBackup['integrityWarnings'] = [];
  const [
    journalEntries,
    patterns,
    settings,
    contextJournalEntries,
    reconstructedEvents,
    clarificationQuestions,
    factCorrections,
    extractionRecords,
    timelineVisibility,
  ] = await Promise.all([
    readArray<AppJournalEntry>(ARRAY_KEYS.journalEntries, readableOnly, integrityWarnings),
    readArray<PatternObservation>(ARRAY_KEYS.patterns, readableOnly, integrityWarnings),
    readObject<AppSettings>(STORAGE_KEYS.settings, readableOnly, integrityWarnings),
    readArray<ContextJournalEntry>(ARRAY_KEYS.contextJournalEntries, readableOnly, integrityWarnings),
    readArray<ReconstructedEvent>(ARRAY_KEYS.reconstructedEvents, readableOnly, integrityWarnings),
    readArray<ClarificationQuestion>(ARRAY_KEYS.clarificationQuestions, readableOnly, integrityWarnings),
    readArray<FactCorrection>(ARRAY_KEYS.factCorrections, readableOnly, integrityWarnings),
    readArray<ExtractionRecord>(ARRAY_KEYS.extractionRecords, readableOnly, integrityWarnings),
    readArray<EventTimelineVisibility>(ARRAY_KEYS.timelineVisibility, readableOnly, integrityWarnings),
  ]);

  return {
    format: 'cherry-brain-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    integrityWarnings,
    appData: {
      journalEntries,
      patterns,
      settings,
      contextJournalEntries,
      reconstructedEvents,
      clarificationQuestions,
      factCorrections,
      extractionRecords,
      timelineVisibility,
    },
  };
}

export async function downloadCherryBrainBackup(options: { readableOnly?: boolean } = {}): Promise<string> {
  const backup = await createCherryBrainBackup(options);
  if (Platform.OS !== 'web') throw new Error('Backup download is currently available in the web build.');
  const date = backup.exportedAt.slice(0, 10);
  const filename = `cherry-brain-backup-${date}.json`;
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return filename;
}
