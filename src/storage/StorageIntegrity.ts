export interface CorruptStorageRecord {
  key: string;
  rawValue: string;
  message: string;
  detectedAt: string;
}

export class StorageIntegrityError extends Error {
  readonly key: string;
  readonly rawValue: string;

  constructor(key: string, rawValue: string, cause: unknown) {
    super(`Cherry Brain could not safely read stored data for ${key}.`);
    this.name = 'StorageIntegrityError';
    this.key = key;
    this.rawValue = rawValue;
    if (cause instanceof Error) (this as Error & { cause?: unknown }).cause = cause;
  }
}

class StorageIntegrityRegistry {
  private corrupt = new Map<string, CorruptStorageRecord>();

  record(key: string, rawValue: string, error: unknown): CorruptStorageRecord {
    const existing = this.corrupt.get(key);
    if (existing) return existing;
    const record: CorruptStorageRecord = {
      key,
      rawValue,
      message: error instanceof Error ? error.message : String(error),
      detectedAt: new Date().toISOString(),
    };
    this.corrupt.set(key, record);
    return record;
  }

  get(key: string): CorruptStorageRecord | null {
    return this.corrupt.get(key) ?? null;
  }

  getAll(): CorruptStorageRecord[] {
    return [...this.corrupt.values()];
  }

  has(key: string): boolean {
    return this.corrupt.has(key);
  }

  clear(key: string): void {
    this.corrupt.delete(key);
  }
}

export const storageIntegrityRegistry = new StorageIntegrityRegistry();

export async function createStorageSchemaError(
  store: { getRaw?: (key: string) => Promise<string | null> },
  key: string,
  message: string,
): Promise<StorageIntegrityError> {
  const rawValue = (await store.getRaw?.(key)) ?? '[unavailable raw value]';
  const cause = new Error(message);
  storageIntegrityRegistry.record(key, rawValue, cause);
  return new StorageIntegrityError(key, rawValue, cause);
}

export async function readStoredArray<T>(
  store: { getJSON<U>(key: string): Promise<U | null>; getRaw?: (key: string) => Promise<string | null> },
  key: string,
): Promise<T[]> {
  const value = await store.getJSON<unknown>(key);
  if (value == null) return [];
  if (!Array.isArray(value)) throw await createStorageSchemaError(store, key, 'Expected an array of records.');
  return value as T[];
}

export async function readStoredObject<T>(
  store: { getJSON<U>(key: string): Promise<U | null>; getRaw?: (key: string) => Promise<string | null> },
  key: string,
): Promise<T | null> {
  const value = await store.getJSON<unknown>(key);
  if (value == null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw await createStorageSchemaError(store, key, 'Expected a stored object.');
  }
  return value as T;
}
