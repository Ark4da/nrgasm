import { describe, expect, it } from 'vitest';
import type { Can } from '../types/can';
import { describeCommunityRating, formatCommunityRating, rankCans, ratingsFromStats } from './ratings';

describe('ratingsFromStats', () => {
  it('turns stats rows into averages', () => {
    expect(ratingsFromStats([{ can_id: 'assault', rating_count: 4, rating_sum: 14 }])).toEqual({
      assault: { average: 3.5, count: 4 },
    });
  });

  it('skips empty and malformed rows', () => {
    expect(
      ratingsFromStats([{ can_id: 'a', rating_count: 0, rating_sum: 0 }, { can_id: 'b', rating_count: '2' }, null]),
    ).toEqual({});
  });
});

describe('formatCommunityRating', () => {
  it('shows one decimal and the count', () => {
    expect(formatCommunityRating({ average: 4.1666, count: 37 })).toBe('★ 4.2 · 37 ratings');
  });

  it('says "rating" for one', () => {
    expect(formatCommunityRating({ average: 5, count: 1 })).toBe('★ 5.0 · 1 rating');
  });
});

describe('describeCommunityRating', () => {
  it('reads well to a screen reader', () => {
    expect(describeCommunityRating({ average: 4.1666, count: 37 })).toBe('Average rating 4.2 from 37 people');
    expect(describeCommunityRating({ average: 3, count: 1 })).toBe('Average rating 3.0 from 1 person');
  });
});

describe('rankCans', () => {
  const can = (id: string, name: string): Can => ({ id, name, line: 'Original', flavorColor: '#000000', regions: ['EU'] });
  const cans = [can('a', 'Alpha'), can('b', 'Bravo'), can('c', 'Charlie'), can('d', 'Delta')];

  it('ranks by average and skips cans no one rated', () => {
    const ranked = rankCans(cans, {
      a: { average: 3, count: 10 },
      b: { average: 4.5, count: 10 },
      c: { average: 4, count: 10 },
    });
    expect(ranked.map((entry) => entry.can.id)).toEqual(['b', 'c', 'a']);
    expect(ranked[0].rating).toEqual({ average: 4.5, count: 10 });
  });

  it('does not let one 5-star rating beat many good ones', () => {
    const ranked = rankCans(cans, {
      a: { average: 5, count: 1 },
      b: { average: 4.6, count: 40 },
      c: { average: 3, count: 40 },
    });
    expect(ranked.map((entry) => entry.can.id)).toEqual(['b', 'a', 'c']);
  });

  it('breaks ties by number of ratings, then by name', () => {
    const ranked = rankCans(cans, {
      d: { average: 4, count: 5 },
      c: { average: 4, count: 5 },
      a: { average: 4, count: 9 },
    });
    expect(ranked.map((entry) => entry.can.id)).toEqual(['a', 'c', 'd']);
  });

  it('ignores ratings for cans that are not in the catalog', () => {
    expect(rankCans(cans, { gone: { average: 5, count: 3 } })).toEqual([]);
  });
});
