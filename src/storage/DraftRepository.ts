import type { DataStore } from './DataStore';
import { STORAGE_KEYS } from './keys';
import { readStoredObject } from './StorageIntegrity';

export interface EntryDraft {
  title: string;
  text: string;
  isImportant: boolean;
  savedAt: string;
}

export interface DraftRepository {
  get(): Promise<EntryDraft | null>;
  save(draft: EntryDraft): Promise<void>;
  clear(): Promise<void>;
}

export class LocalDraftRepository implements DraftRepository {
  constructor(private store: DataStore) {}

  async get(): Promise<EntryDraft | null> {
    return readStoredObject<EntryDraft>(this.store, STORAGE_KEYS.draft);
  }

  async save(draft: EntryDraft): Promise<void> {
    await this.store.setJSON(STORAGE_KEYS.draft, draft);
  }

  async clear(): Promise<void> {
    await this.store.removeItem(STORAGE_KEYS.draft);
  }
}
