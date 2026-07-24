import type { ContextExtractionProviderInput, ContextExtractionProviderResultRaw } from '../types';
import { buildEngine, makeEntry } from './testHarness';

describe('Case 1: one event', () => {
  it('reconstructs a single event without inventing an exact time', async () => {
    const { engine } = buildEngine();
    const entry = makeEntry('I missed my appointment this morning.');

    const result = await engine.extractFromJournalEntry(entry);

    expect(result.journalEntry.originalText).toBe('I missed my appointment this morning.');
    expect(result.events).toHaveLength(1);
    expect(result.events[0].timePrecision).not.toBe('exact');
    expect(result.events[0].resolvedTime).toBeNull();
  });
});

describe('Case 2: multiple events', () => {
  it('splits distinct occurrences into separate events with correct sequence and source passages', async () => {
    const { engine } = buildEngine();
    const text = 'I missed my appointment. Later Mom called and we argued about money.';
    const entry = makeEntry(text);

    const result = await engine.extractFromJournalEntry(entry);

    expect(result.events).toHaveLength(2);
    expect(result.events.map((e) => e.sequenceIndex)).toEqual([0, 1]);

    const [first, second] = result.events;
    expect(first.source.text).not.toBe(second.source.text);
    expect(text.slice(first.source.startIndex, first.source.endIndex)).toBe(first.source.text);
    expect(text.slice(second.source.startIndex, second.source.endIndex)).toBe(second.source.text);
  });
});

describe('Case 3: no clear event', () => {
  it('permits zero events without blocking the save or fabricating an event', async () => {
    const { engine } = buildEngine();
    const entry = makeEntry('Everything feels strange today.');

    const result = await engine.extractFromJournalEntry(entry);

    expect(result.events).toHaveLength(0);
    expect(result.clarificationQuestions).toHaveLength(0);
    expect(result.journalEntry.originalText).toBe('Everything feels strange today.');
  });
});

describe('Case 4: material ambiguity', () => {
  it('reconstructs the event conservatively and saves a pending clarification question', async () => {
    const { engine } = buildEngine();
    const entry = makeEntry('I told her I was done after what happened.');

    const result = await engine.extractFromJournalEntry(entry);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].participants).toEqual([]);
    expect(result.events[0].needsClarification).toBe(true);

    expect(result.clarificationQuestions).toHaveLength(1);
    expect(result.clarificationQuestions[0].status).toBe('pending');
    expect(result.clarificationQuestions[0].question.toLowerCase()).toContain('her');
  });
});

describe('Case 5: unnecessary ambiguity', () => {
  it('does not ask for exact time and preserves vague stated time as-is', async () => {
    const { engine } = buildEngine();
    const entry = makeEntry('I cleaned the kitchen later.');

    const result = await engine.extractFromJournalEntry(entry);

    expect(result.events).toHaveLength(1);
    expect(result.events[0].statedTime?.toLowerCase()).toBe('later');
    expect(result.events[0].resolvedTime).toBeNull();
    expect(result.clarificationQuestions).toHaveLength(0);
  });
});

describe('Case 6: source mismatch', () => {
  it('rejects an event whose source passage is not found in the original text', async () => {
    const badProvider = {
      async extract(_input: ContextExtractionProviderInput): Promise<ContextExtractionProviderResultRaw> {
        return {
          events: [
            {
              summary: 'Something happened.',
              statedTime: null,
              resolvedTime: null,
              timePrecision: 'unknown',
              participants: [],
              sequenceIndex: 0,
              source: { text: 'this text is not in the entry', startIndex: 0, endIndex: 30 },
              needsClarification: false,
            },
          ],
          clarificationQuestions: [],
        };
      },
    };

    const { engine } = buildEngine(badProvider);
    const entry = makeEntry('I went for a walk.');

    const result = await engine.extractFromJournalEntry(entry);

    expect(result.events).toHaveLength(0);
    expect(result.journalEntry.originalText).toBe('I went for a walk.');
  });
});

describe('Case 7: dismissal', () => {
  it('marks a pending question dismissed, timestamps it, and removes it from the pending queue without deleting it', async () => {
    const { engine, clarificationStore } = buildEngine();
    const entry = makeEntry('I told her I was done after what happened.');
    const result = await engine.extractFromJournalEntry(entry);
    const questionId = result.clarificationQuestions[0].id;

    const pendingBefore = await clarificationStore.getPendingQuestionsForEntry(entry.id);
    expect(pendingBefore).toHaveLength(1);

    const dismissed = await engine.dismissClarification(questionId);

    expect(dismissed.status).toBe('dismissed');
    expect(dismissed.dismissedAt).not.toBeNull();

    const pendingAfter = await clarificationStore.getPendingQuestionsForEntry(entry.id);
    expect(pendingAfter).toHaveLength(0);

    const all = await clarificationStore.getAll();
    expect(all.find((q) => q.id === questionId)).toBeDefined();
  });
});

describe('Case 8: answering', () => {
  it('marks a pending question answered, preserves the answer, timestamps it, and removes it from the pending queue', async () => {
    const { engine, clarificationStore } = buildEngine();
    const entry = makeEntry('I told her I was done after what happened.');
    const result = await engine.extractFromJournalEntry(entry);
    const questionId = result.clarificationQuestions[0].id;

    const answered = await engine.answerClarification(questionId, 'My sister.');

    expect(answered.status).toBe('answered');
    expect(answered.answer).toBe('My sister.');
    expect(answered.answeredAt).not.toBeNull();

    const pendingAfter = await clarificationStore.getPendingQuestionsForEntry(entry.id);
    expect(pendingAfter).toHaveLength(0);
  });
});
