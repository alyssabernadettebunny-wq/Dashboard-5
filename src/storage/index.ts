export * from './DataStore';
export * from './AsyncStorageDataStore';
export * from './EntryRepository';
export * from './PatternRepository';
export * from './SettingsRepository';
export * from './DraftRepository';

import { dataStore } from './AsyncStorageDataStore';
import { LocalEntryRepository } from './EntryRepository';
import { LocalPatternRepository } from './PatternRepository';
import { LocalSettingsRepository } from './SettingsRepository';
import { LocalDraftRepository } from './DraftRepository';

export const entryRepository = new LocalEntryRepository(dataStore);
export const patternRepository = new LocalPatternRepository(dataStore);
export const settingsRepository = new LocalSettingsRepository(dataStore);
export const draftRepository = new LocalDraftRepository(dataStore);
