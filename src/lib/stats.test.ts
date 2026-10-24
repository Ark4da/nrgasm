import { describe, expect, it } from 'vitest';
import type { Can } from '../types/can';
import type { UserData } from '../types/tasting';
import { computeStats } from './stats';

const cans: Can[] = [
  { id: 'a', name: 'A', line: 'Juice', flavorColor: '#000000', regions: ['EU'], caffeineMg: 160 },
  { id: 'b', name: 'B', line: 'Juice', flavorColor: '#000000', regions: ['EU'] },
  { id: 'c', name: 'C', line: 'Ultra', flavorColor: '#000000', regions: ['US'], caffeineMg: 150 },
  { id: 'd', name: 'D', line: 'Ultra', flavorColor: '#000000', regions: ['US'], caffeineMg: 140 },
];

const entry = (rating: 1 | 2 | 3 | 4 | 5 | null, updatedAt: string, tried = true) =>
  ({ tried, wantToTry: false, rating, note: '', updatedAt });

describe('computeStats', () => {
  it('handles an empty collection', () => {
    const stats = computeStats(cans, {});
    expect(stats).toMatchObject({
      total: 4, tried: 0, rated: 0, wantToTry: 0, averageRating: null, topRated: [], caffeineMg: 0, caffeineKnown: 0,
    });
    expect(stats.byLine).toEqual([
      { line: 'Juice', total: 2, tried: 0, averageRating: null },
      { line: 'Ultra', total: 2, tried: 0, averageRating: null },
    ]);
  });

  it('counts tried, ratings, lines, and caffeine', () => {
    const data: UserData = {
      a: entry(4, '2026-10-01T00:00:00.000Z'),
      b: entry(null, '2026-10-02T00:00:00.000Z'),
      c: entry(5, '2026-10-03T00:00:00.000Z'),
      d: { ...entry(null, '2026-10-04T00:00:00.000Z', false), wantToTry: true },
      gone: entry(1, '2026-10-04T00:00:00.000Z'),
    };
    const stats = computeStats(cans, data);

    expect(stats.tried).toBe(3);
    expect(stats.rated).toBe(2);
    expect(stats.wantToTry).toBe(1);
    expect(stats.averageRating).toBe(4.5);
    expect(stats.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 1, 5: 1 });
    expect(stats.topRated.map((item) => item.can.id)).toEqual(['c', 'a']);
    expect(stats.byLine).toEqual([
      { line: 'Juice', total: 2, tried: 2, averageRating: 4 },
      { line: 'Ultra', total: 2, tried: 1, averageRating: 5 },
    ]);
    // a (160) + c (150); b is tried but its caffeine is unknown
    expect(stats.caffeineMg).toBe(310);
    expect(stats.caffeineKnown).toBe(2);
  });

  it('breaks rating ties by the most recent update', () => {
    const data: UserData = {
      a: entry(5, '2026-10-01T00:00:00.000Z'),
      b: entry(5, '2026-10-05T00:00:00.000Z'),
    };
    expect(computeStats(cans, data).topRated.map((item) => item.can.id)).toEqual(['b', 'a']);
  });
});
