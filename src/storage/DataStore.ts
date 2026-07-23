/**
 * Storage port. Today this is backed by on-device AsyncStorage only ("local-first").
 * A future encrypted cloud-sync layer can implement this same interface (or wrap it,
 * e.g. write-through to AsyncStorage then push to a remote store) without any
 * repository or screen code needing to change.
 */
export interface DataStore {
  getJSON<T>(key: string): Promise<T | null>;
  setJSON<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}
