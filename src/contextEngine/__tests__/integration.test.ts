import { generateId } from '@/models/ids';
import type { JournalEntry as AppJournalEntry } from '@/models';
import { contextJournalAdapter } from '../adapter';
import { CONTEXT_ENGINE_VERSION } from '../engineVersion';
import { triggerContextExtraction } from '../integration';
import { buildEngine } from './testHarness';

function makeAppEntry(text: string, overrides: Partial<AppJournalEntry> = {}): AppJournalEntry {
  const now = '2026-07-24T09:00:00.000Z';
  return {
    id: generateId('entry'),
    createdAt: now,
    updatedAt: now,
    text,
    isImportant: false,
    entryType: 'text',
    suggestedSubjects: [],
    userTags: [],
    connectedPatternIds: [],
    ...overrides,
  };
}

function flushMicrotasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('Real journal-flow save', () => {
  it('adapts and extracts from the actual app JournalEntry shape, persisting reconstructed events', async () => {
    const { engine, eventStore } = buildEngine();
    const appEntry = makeAppEntry('I missed my appointment. Later Mom called and we argued about money.');

    triggerContextExtraction(appEntry, engine);
    await flushMicrotasks();

    const events = await eventStore.getForEntry(appEntry.id);
    expect(events).toHaveLength(2);
    expect(events.every((e) => e.journalEntryId === appEntry.id)).toBe(true);
  });
});

describe('Nonblocking extraction', () => {
  it('returns immediately without waiting for a slow or throwing engine, and the entry stays usable', async () => {
    let resolveExtraction!: () => void;
    const slowEngine = {
      async extractFromJournalEntry() {
        await new Promise<void>((resolve) => {
          resolveExtraction = resolve;
        });
        throw new Error('provider timed out');
      },
      async answerClarification(): Promise<never> {
        throw new Error('unused');
      },
      async dismissClarification(): Promise<never> {
        throw new Error('unused');
      },
    };

    const appEntry = makeAppEntry('Something happened today.');
    const before = Date.now();
    const returnValue = triggerContextExtraction(appEntry, slowEngine);
    const elapsed = Date.now() - before;

    expect(returnValue).toBeUndefined();
    expect(elapsed).toBeLessThan(20);

    // The saved entry itself is just a plain object the caller already has —
    // it was never mutated or wrapped by triggerContextExtraction.
    expect(appEntry.text).toBe('Something happened today.');

    resolveExtraction();
    await flushMicrotasks();
  });
});

describe('Duplicate-save protection', () => {
  it('does not duplicate events or the completed record when the same entry is processed sequentially twice', async () => {
    const { engine, eventStore, extractionRecordStore } = buildEngine();
    const appEntry = makeAppEntry('I missed my appointment. Later Mom called and we argued about money.');
    const contextEntry = contextJournalAdapter.toContextEntry(appEntry);

    await engine.extractFromJournalEntry(contextEntry);
    await engine.extractFromJournalEntry(contextEntry);

    const events = await eventStore.getForEntry(appEntry.id);
    expect(events).toHaveLength(2);

    const record = await extractionRecordStore.getForEntry(appEntry.id, CONTEXT_ENGINE_VERSION);
    expect(record?.status).toBe('completed');
  });

  it('does not duplicate events or clarifications when the same entry is processed concurrently (double save tap)', async () => {
    const { engine, eventStore, clarificationStore } = buildEngine();
    const appEntry = makeAppEntry('I told her I was done after what happened.');
    const contextEntry = contextJournalAdapter.toContextEntry(appEntry);

    const [first, second] = await Promise.all([
      engine.extractFromJournalEntry(contextEntry),
      engine.extractFromJournalEntry(contextEntry),
    ]);

    expect(first.events.map((e) => e.id)).toEqual(second.events.map((e) => e.id));

    const events = await eventStore.getForEntry(appEntry.id);
    expect(events).toHaveLength(1);

    const clarifications = await clarificationStore.getForEntry(appEntry.id);
    expect(clarifications).toHaveLength(1);
  });

  it('does not duplicate anything when triggerContextExtraction itself is called twice for the same entry (React re-render / double tap at the call site)', async () => {
    const { engine, eventStore } = buildEngine();
    const appEntry = makeAppEntry('I missed my appointment. Later Mom called and we argued about money.');

    triggerContextExtraction(appEntry, engine);
    triggerContextExtraction(appEntry, engine);
    await flushMicrotasks();
    await flushMicrotasks();

    const events = await eventStore.getForEntry(appEntry.id);
    expect(events).toHaveLength(2);
  });
});

describe('Existing-entry compatibility', () => {
  it('converts an existing journal entry through the adapter without changing id, text, or creation timestamp', () => {
    const appEntry = makeAppEntry('Some existing entry text.', {
      id: 'entry_existing_123',
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2021-01-01T00:00:00.000Z',
      title: 'A title the context engine does not need',
    });

    const contextEntry = contextJournalAdapter.toContextEntry(appEntry);

    expect(contextEntry.id).toBe(appEntry.id);
    expect(contextEntry.originalText).toBe(appEntry.text);
    expect(contextEntry.createdAt).toBe(appEntry.createdAt);
  });
});

describe('Clarification behavior for a real entry', () => {
  it('stores a pending clarification without any modal/interruption surface, reachable only via the store', async () => {
    const { engine, clarificationStore } = buildEngine();
    const appEntry = makeAppEntry('I told her I was done after what happened.');

    triggerContextExtraction(appEntry, engine);
    await flushMicrotasks();

    const pending = await clarificationStore.getPendingQuestionsForEntry(appEntry.id);
    expect(pending).toHaveLength(1);
    expect(pending[0].status).toBe('pending');
    // triggerContextExtraction's return value is void — nothing for a UI layer
    // to await, branch on, or use to open a modal.
  });
});
