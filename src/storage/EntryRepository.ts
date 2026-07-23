import type { JournalEntry } from '@/models';
import type { DataStore } from './DataStore';
import { STORAGE_KEYS } from './keys';

export interface EntryRepository {
  getAll(): Promise<JournalEntry[]>;
  save(entry: JournalEntry): Promise<void>;
  remove(id: string): Promise<void>;
  replaceAll(entries: JournalEntry[]): Promise<void>;
}

export class LocalEntryRepository implements EntryRepository {
  constructor(private store: DataStore) {}

  async getAll(): Promise<JournalEntry[]> {
    const entries = await this.store.getJSON<JournalEntry[]>(STORAGE_KEYS.entries);
    return entries ?? [];
  }

  async save(entry: JournalEntry): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      all[index] = entry;
    } else {
      all.push(entry);
    }
    await this.store.setJSON(STORAGE_KEYS.entries, all);
  }

  async remove(id: string): Promise<void> {
    const all = await this.getAll();
    await this.store.setJSON(
      STORAGE_KEYS.entries,
      all.filter((e) => e.id !== id),
    );
  }

  async replaceAll(entries: JournalEntry[]): Promise<void> {
    await this.store.setJSON(STORAGE_KEYS.entries, entries);
  }
}
