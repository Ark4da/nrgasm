import { describe, expect, it } from 'vitest';
import { describeCommunityRating, formatCommunityRating, ratingsFromStats } from './ratings';

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
