import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DataStore } from './DataStore';

export class AsyncStorageDataStore implements DataStore {
  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  }

  async setJSON<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}

export const dataStore: DataStore = new AsyncStorageDataStore();
