import { describe, expect, it } from 'vitest';
import { formatAverage, formatFact, formatFactsBasis } from './format';

describe('formatFact', () => {
  it('shows a dash for unknown values', () => {
    expect(formatFact(undefined, 'mg')).toBe('—');
  });

  it('keeps zero', () => {
    expect(formatFact(0, 'g')).toBe('0 g');
  });
});

describe('formatFactsBasis', () => {
  it('names the can the numbers describe', () => {
    expect(formatFactsBasis({ factsRegion: 'EU', volumeMl: 500 })).toBe('Figures for the 500 ml EU can');
  });

  it('leaves out an unknown volume', () => {
    expect(formatFactsBasis({ factsRegion: 'US' })).toBe('Figures for the US can');
  });

  it('says nothing without a source region', () => {
    expect(formatFactsBasis({ volumeMl: 473 })).toBeNull();
  });
});

describe('formatAverage', () => {
  it('rounds to one decimal', () => {
    expect(formatAverage(4.25)).toBe('4.3');
    expect(formatAverage(4)).toBe('4.0');
    expect(formatAverage(null)).toBe('—');
  });
});
