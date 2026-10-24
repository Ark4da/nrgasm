import { describe, expect, it } from 'vitest';
import { ratingsFromStats } from './ratings';

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
