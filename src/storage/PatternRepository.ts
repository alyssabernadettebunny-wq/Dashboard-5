import type { PatternObservation } from '@/models';
import type { DataStore } from './DataStore';
import { STORAGE_KEYS } from './keys';

export interface PatternRepository {
  getAll(): Promise<PatternObservation[]>;
  save(pattern: PatternObservation): Promise<void>;
  replaceAll(patterns: PatternObservation[]): Promise<void>;
}

export class LocalPatternRepository implements PatternRepository {
  constructor(private store: DataStore) {}

  async getAll(): Promise<PatternObservation[]> {
    const patterns = await this.store.getJSON<PatternObservation[]>(STORAGE_KEYS.patterns);
    return patterns ?? [];
  }

  async save(pattern: PatternObservation): Promise<void> {
    const all = await this.getAll();
    const index = all.findIndex((p) => p.id === pattern.id);
    if (index >= 0) {
      all[index] = pattern;
    } else {
      all.push(pattern);
    }
    await this.store.setJSON(STORAGE_KEYS.patterns, all);
  }

  async replaceAll(patterns: PatternObservation[]): Promise<void> {
    await this.store.setJSON(STORAGE_KEYS.patterns, patterns);
  }
}
