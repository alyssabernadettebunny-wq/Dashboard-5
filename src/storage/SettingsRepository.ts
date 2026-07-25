import { createDefaultSettings, type AppSettings } from '@/models';
import type { DataStore } from './DataStore';
import { STORAGE_KEYS } from './keys';
import { readStoredObject } from './StorageIntegrity';

export interface SettingsRepository {
  get(): Promise<AppSettings>;
  save(settings: AppSettings): Promise<void>;
}

export class LocalSettingsRepository implements SettingsRepository {
  constructor(private store: DataStore) {}

  async get(): Promise<AppSettings> {
    const settings = await readStoredObject<AppSettings>(this.store, STORAGE_KEYS.settings);
    return settings ?? createDefaultSettings();
  }

  async save(settings: AppSettings): Promise<void> {
    await this.store.setJSON(STORAGE_KEYS.settings, settings);
  }
}
