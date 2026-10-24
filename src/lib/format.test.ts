import { describe, expect, it } from 'vitest';
import { formatAverage, formatFact, formatFactsBasis, sourceName } from './format';

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

describe('sourceName', () => {
  it('names the sources the catalog cites', () => {
    expect(sourceName('https://www.monsterenergy.com/en-gb/energy-drinks/monster-energy/assault/')).toBe('Monster Energy');
    expect(sourceName('https://www.energydrinkmania.net/en/monster_energy/monster_energy.html')).toBe('Energy Drink Mania');
    expect(sourceName('https://monster-energy.fandom.com/wiki/Monster_Energy')).toBe('Monster Energy Wiki');
  });

  it('falls back to the host name without "www."', () => {
    expect(sourceName('https://www.example.com/page')).toBe('example.com');
  });
});
