import { describe, expect, it } from 'vitest';
import type { Can } from '../types/can';
import type { UserData } from '../types/tasting';
import { computeStats } from './stats';

const cans: Can[] = [
  { id: 'a', name: 'A', line: 'Juice', flavorColor: '#000000', regions: ['EU'] },
  { id: 'b', name: 'B', line: 'Juice', flavorColor: '#000000', regions: ['EU'] },
  { id: 'c', name: 'C', line: 'Ultra', flavorColor: '#000000', regions: ['US'] },
  { id: 'd', name: 'D', line: 'Ultra', flavorColor: '#000000', regions: ['US'] },
];

describe('computeStats', () => {
  it('handles an empty collection', () => {
    const stats = computeStats(cans, {});
    expect(stats).toMatchObject({ total: 4, tried: 0, rated: 0, averageRating: null, topRated: [] });
    expect(stats.byLine).toEqual([
      { line: 'Juice', total: 2, tried: 0 },
      { line: 'Ultra', total: 2, tried: 0 },
    ]);
  });

  it('counts tried, ratings, and lines', () => {
    const data: UserData = {
      a: { tried: true, rating: 4, note: '', updatedAt: '2026-10-01T00:00:00.000Z' },
      b: { tried: true, rating: null, note: '', updatedAt: '2026-10-02T00:00:00.000Z' },
      c: { tried: true, rating: 5, note: '', updatedAt: '2026-10-03T00:00:00.000Z' },
      gone: { tried: true, rating: 1, note: '', updatedAt: '2026-10-04T00:00:00.000Z' },
    };
    const stats = computeStats(cans, data);

    expect(stats.tried).toBe(3);
    expect(stats.rated).toBe(2);
    expect(stats.averageRating).toBe(4.5);
    expect(stats.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 });
    expect(stats.topRated.map((item) => item.can.id)).toEqual(['c', 'a']);
    expect(stats.byLine).toEqual([
      { line: 'Juice', total: 2, tried: 2 },
      { line: 'Ultra', total: 2, tried: 1 },
    ]);
  });

  it('breaks rating ties by the most recent update', () => {
    const data: UserData = {
      a: { tried: true, rating: 5, note: '', updatedAt: '2026-10-01T00:00:00.000Z' },
      b: { tried: true, rating: 5, note: '', updatedAt: '2026-10-05T00:00:00.000Z' },
    };
    expect(computeStats(cans, data).topRated.map((item) => item.can.id)).toEqual(['b', 'a']);
  });
});
