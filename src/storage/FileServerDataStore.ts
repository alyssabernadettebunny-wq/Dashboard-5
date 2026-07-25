import type { DataStore } from './DataStore';
import { AsyncStorageDataStore } from './AsyncStorageDataStore';
import { storageIntegrityRegistry } from './StorageIntegrity';

/** Sentinel key used to flag "the local data server can't be reached" through the same
 *  corrupted-storage mechanism the Settings/recovery screen already understands. */
export const SERVER_UNAVAILABLE_KEY = '__cherry_brain_server__';

/**
 * Talks to Cherry Brain's local file-storage server (scripts/serve-production.mjs),
 * which is the permanent source of truth, persisted outside the browser at
 * Cherry Brain/Data/cherry-brain-data.json — independent of browser profile,
 * origin, or port. AsyncStorage is used only as a temporary read cache so the
 * app still has something to show if the server is briefly unreachable; it is
 * never treated as authoritative, and every write goes through the server first.
 */
export class FileServerDataStore implements DataStore {
  constructor(private cache: AsyncStorageDataStore) {}

  private async request(path: string, init?: RequestInit): Promise<Response> {
    const response = await fetch(`/api/data${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    return response;
  }

  async getRaw(key: string): Promise<string | null> {
    try {
      const response = await this.request(`/${encodeURIComponent(key)}`);
      if (!response.ok) throw new Error(`Cherry Brain's local data server returned an error (${response.status}).`);
      const body = (await response.json()) as { value: unknown };
      storageIntegrityRegistry.clear(SERVER_UNAVAILABLE_KEY);
      return body.value == null ? null : JSON.stringify(body.value);
    } catch (error) {
      storageIntegrityRegistry.record(SERVER_UNAVAILABLE_KEY, '', error);
      return this.cache.getRaw(key);
    }
  }

  async getJSON<T>(key: string): Promise<T | null> {
    try {
      const response = await this.request(`/${encodeURIComponent(key)}`);
      if (!response.ok) throw new Error(`Cherry Brain's local data server returned an error (${response.status}).`);
      const body = (await response.json()) as { value: T | null };
      storageIntegrityRegistry.clear(SERVER_UNAVAILABLE_KEY);
      const value = body.value ?? null;
      if (value !== null) {
        await this.cache.setJSON(key, value);
        return value;
      }
      // The permanent file has nothing for this key yet. Before treating that as
      // "nothing was ever saved," check whether the browser has leftover data
      // from before this file-storage system existed (e.g. a previous build
      // that only used browser storage) — if so, migrate it into the permanent
      // file now instead of silently orphaning it. This is exactly the failure
      // this system was built to prevent.
      const cached = await this.cache.getJSON<T>(key).catch(() => null);
      if (cached !== null) {
        await this.setJSON(key, cached);
        return cached;
      }
      return null;
    } catch (error) {
      // The server is the source of truth; if it's unreachable, fall back to the
      // temporary cache rather than showing an empty app, but flag it clearly so
      // this is never mistaken for "nothing has been saved yet."
      storageIntegrityRegistry.record(SERVER_UNAVAILABLE_KEY, '', error);
      return this.cache.getJSON<T>(key);
    }
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    const response = await this.request(`/${encodeURIComponent(key)}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || `Cherry Brain could not save to its data file (${response.status}).`);
    }
    storageIntegrityRegistry.clear(SERVER_UNAVAILABLE_KEY);
    await this.cache.setJSON(key, value);
  }

  async removeItem(key: string): Promise<void> {
    const response = await this.request(`/${encodeURIComponent(key)}`, { method: 'DELETE' });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || `Cherry Brain could not update its data file (${response.status}).`);
    }
    await this.cache.removeItem(key);
  }
}

export const dataStore: DataStore = new FileServerDataStore(new AsyncStorageDataStore());
