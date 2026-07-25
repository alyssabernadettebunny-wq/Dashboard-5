/** Local persistence port used by repositories and test stores. */
export interface DataStore {
  getJSON<T>(key: string): Promise<T | null>;
  setJSON<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
  getRaw?(key: string): Promise<string | null>;
}
