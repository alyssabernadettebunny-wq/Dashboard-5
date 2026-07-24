import { extractTimeInfo } from '../timeResolution';

const TIMEZONE = 'UTC';
// A verified real calendar anchor: 2026-07-24 is a Friday, and 2026-07-21 is
// the Tuesday three days before it. Tests below rely on these being the
// actual real-calendar relationship, not an assumption.
const ENTRY_CREATED_AT = '2026-07-24T08:00:00.000Z';

describe('extractTimeInfo — date certainty independent of time-of-day precision', () => {
  test('an explicit date with no time-of-day language resolves the day, leaving time precision unknown', () => {
    const info = extractTimeInfo('On July 21, Mom called.', ENTRY_CREATED_AT, TIMEZONE);
    expect(info.resolvedDate).toBe('2026-07-21');
    expect(info.timePrecision).toBe('unknown');
    expect(info.resolvedTime).toBeNull();
  });

  test('a bare weekday name with no clock time resolves to the most recent matching day, without inventing a clock time', () => {
    const info = extractTimeInfo('On Tuesday, Mom called.', ENTRY_CREATED_AT, TIMEZONE);
    expect(info.resolvedDate).toBe('2026-07-21');
    expect(info.timePrecision).toBe('unknown');
    expect(info.resolvedTime).toBeNull();
    expect(info.statedTime).toBe('Tuesday');
  });

  test('no date reference at all leaves resolvedDate null (the timeline layer anchors to the journal date in this case)', () => {
    const info = extractTimeInfo('Mom called.', ENTRY_CREATED_AT, TIMEZONE);
    expect(info.resolvedDate).toBeNull();
    expect(info.timePrecision).toBe('unknown');
    expect(info.resolvedTime).toBeNull();
  });

  test('a known day with a vague time of day resolves the date but keeps the time vague, without inventing an exact timestamp', () => {
    const info = extractTimeInfo('Tuesday afternoon, Mom called.', ENTRY_CREATED_AT, TIMEZONE);
    expect(info.resolvedDate).toBe('2026-07-21');
    expect(info.timePrecision).toBe('relative');
    expect(info.resolvedTime).toBeNull();
    expect(info.statedTime).toBe('Tuesday afternoon');
  });

  test('an exact clock time still resolves both a date and a precise time', () => {
    const info = extractTimeInfo('We met at 3:00 pm.', ENTRY_CREATED_AT, TIMEZONE);
    expect(info.timePrecision).toBe('exact');
    expect(info.resolvedTime).not.toBeNull();
    expect(info.resolvedDate).toBe(info.resolvedTime!.slice(0, 10));
  });
});
