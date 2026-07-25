import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DataStore } from './DataStore';
import { StorageIntegrityError, storageIntegrityRegistry } from './StorageIntegrity';

export class AsyncStorageDataStore implements DataStore {
  async getRaw(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      storageIntegrityRegistry.record(key, raw, error);
      throw new StorageIntegrityError(key, raw, error);
    }
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    if (storageIntegrityRegistry.has(key)) {
      const corrupt = storageIntegrityRegistry.get(key)!;
      throw new StorageIntegrityError(key, corrupt.rawValue, new Error('Write blocked until corrupted storage is explicitly reset.'));
    }
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    storageIntegrityRegistry.clear(key);
  }
}

export const dataStore: DataStore = new AsyncStorageDataStore();
