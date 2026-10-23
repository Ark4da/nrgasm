import { describe, expect, it } from 'vitest';
import type { UserData } from '../types/tasting';
import { updateEntry } from './entries';

const now = new Date('2026-10-23T12:00:00.000Z');

describe('updateEntry', () => {
  it('creates an entry for a new can', () => {
    expect(updateEntry({}, 'khaotic', { tried: true }, now)).toEqual({
      khaotic: { tried: true, rating: null, note: '', updatedAt: now.toISOString() },
    });
  });

  it('does not mutate the input', () => {
    const data: UserData = {};
    updateEntry(data, 'khaotic', { tried: true }, now);
    expect(data).toEqual({});
  });

  it('marks a can as tried when it is rated', () => {
    const result = updateEntry({}, 'khaotic', { rating: 5 }, now);
    expect(result.khaotic).toMatchObject({ tried: true, rating: 5 });
  });

  it('clears the rating when a can is marked as not tried', () => {
    const data = updateEntry({}, 'khaotic', { rating: 3, note: 'Citrus' }, now);
    const result = updateEntry(data, 'khaotic', { tried: false }, now);
    expect(result.khaotic).toMatchObject({ tried: false, rating: null, note: 'Citrus' });
  });

  it('removes an entry that is blank again', () => {
    const data = updateEntry({}, 'khaotic', { tried: true }, now);
    expect(updateEntry(data, 'khaotic', { tried: false }, now)).toEqual({});
  });

  it('treats a whitespace-only note as blank', () => {
    expect(updateEntry({}, 'khaotic', { note: '   ' }, now)).toEqual({});
  });

  it('updates the timestamp', () => {
    const earlier = updateEntry({}, 'khaotic', { tried: true }, new Date('2026-01-01T00:00:00.000Z'));
    const result = updateEntry(earlier, 'khaotic', { note: 'Again' }, now);
    expect(result.khaotic.updatedAt).toBe(now.toISOString());
  });
});
