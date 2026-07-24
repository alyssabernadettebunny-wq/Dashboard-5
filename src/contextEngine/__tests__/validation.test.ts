import { validateProviderResult } from '../validation';
import { saveJournalEntry } from '../saveJournalEntry';
import { JournalEntryStore } from '../storage';
import { InMemoryDataStore } from './inMemoryDataStore';
import type { ContextExtractionProviderResultRaw } from '../types';

const original = 'I called my sister. She was upset about the schedule.';

function baseEvent(overrides: Partial<ContextExtractionProviderResultRaw['events'][number]> = {}) {
  return {
    summary: 'I called my sister.',
    statedTime: null,
    resolvedTime: null,
    timePrecision: 'unknown' as const,
    participants: ['my sister'],
    sequenceIndex: 0,
    source: { text: 'I called my sister.', startIndex: 0, endIndex: 19 },
    needsClarification: false,
    ...overrides,
  };
}

describe('validateProviderResult', () => {
  it('rejects an event summary containing disguised interpretation', () => {
    const raw: ContextExtractionProviderResultRaw = {
      events: [baseEvent({ summary: 'My sister was trying to control the conversation.' })],
      clarificationQuestions: [],
    };

    const result = validateProviderResult(raw, original);

    expect(result.events).toHaveLength(0);
    expect(result.issues[0]).toContain('interpretive language');
  });

  it('rejects events with duplicate sequence indexes, keeping the first', () => {
    const raw: ContextExtractionProviderResultRaw = {
      events: [
        baseEvent({ sequenceIndex: 0 }),
        baseEvent({
          sequenceIndex: 0,
          summary: 'She was upset about the schedule.',
          source: { text: 'She was upset about the schedule.', startIndex: 20, endIndex: 53 },
        }),
      ],
      clarificationQuestions: [],
    };

    const result = validateProviderResult(raw, original);

    expect(result.events).toHaveLength(1);
    expect(result.issues.some((i) => i.includes('duplicate sequenceIndex'))).toBe(true);
  });

  it('rejects events with out-of-order sequence indexes', () => {
    const raw: ContextExtractionProviderResultRaw = {
      events: [
        baseEvent({ sequenceIndex: 1 }),
        baseEvent({
          sequenceIndex: 0,
          summary: 'She was upset about the schedule.',
          source: { text: 'She was upset about the schedule.', startIndex: 20, endIndex: 53 },
        }),
      ],
      clarificationQuestions: [],
    };

    const result = validateProviderResult(raw, original);

    expect(result.events).toHaveLength(1);
    expect(result.issues.some((i) => i.includes('out-of-order'))).toBe(true);
  });

  it('rejects a clarification question that references a nonexistent event', () => {
    const raw: ContextExtractionProviderResultRaw = {
      events: [baseEvent()],
      clarificationQuestions: [
        {
          eventSequenceIndex: 7,
          question: 'Who is "she"?',
          reason: 'Unnamed participant.',
          category: 'participant',
          targetField: 'participants',
          options: null,
        },
      ],
    };

    const result = validateProviderResult(raw, original);

    expect(result.clarificationQuestions).toHaveLength(0);
    expect(result.issues.some((i) => i.includes('nonexistent event'))).toBe(true);
  });

  it('rejects endIndex <= startIndex', () => {
    const raw: ContextExtractionProviderResultRaw = {
      events: [baseEvent({ source: { text: 'I called my sister.', startIndex: 5, endIndex: 5 } })],
      clarificationQuestions: [],
    };

    const result = validateProviderResult(raw, original);
    expect(result.events).toHaveLength(0);
  });

  it('rejects a resolved timestamp paired with "unknown" precision', () => {
    const raw: ContextExtractionProviderResultRaw = {
      events: [baseEvent({ resolvedTime: '2026-07-23T15:00:00-07:00', timePrecision: 'unknown' })],
      clarificationQuestions: [],
    };

    const result = validateProviderResult(raw, original);
    expect(result.events).toHaveLength(0);
  });
});

describe('saveJournalEntry', () => {
  it('saves the journal entry even when extraction fails', async () => {
    const journalStore = new JournalEntryStore(new InMemoryDataStore());

    const throwingEngine = {
      async extractFromJournalEntry(): Promise<never> {
        throw new Error('provider is down');
      },
      async answerClarification(): Promise<never> {
        throw new Error('unused');
      },
      async dismissClarification(): Promise<never> {
        throw new Error('unused');
      },
    };

    const entry = await saveJournalEntry('This should still save.', throwingEngine, journalStore);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(entry.originalText).toBe('This should still save.');
    const stored = await journalStore.getById(entry.id);
    expect(stored).not.toBeNull();
    expect(stored?.originalText).toBe('This should still save.');
  });
});
