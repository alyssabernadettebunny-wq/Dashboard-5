import type { DataStore } from '@/storage/DataStore';

/** Plain in-memory DataStore for tests — no AsyncStorage/RN runtime required. */
export class InMemoryDataStore implements DataStore {
  private map = new Map<string, unknown>();

  async getJSON<T>(key: string): Promise<T | null> {
    return this.map.has(key) ? (JSON.parse(JSON.stringify(this.map.get(key))) as T) : null;
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    this.map.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.map.delete(key);
  }
}
