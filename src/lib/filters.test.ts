import { describe, expect, it } from 'vitest';
import type { Can } from '../types/can';
import type { UserData } from '../types/tasting';
import {
  DEFAULT_FILTERS,
  filterCans,
  filtersFromParams,
  filtersToParams,
  getLines,
  hasActiveFilters,
} from './filters';

const cans: Can[] = [
  { id: 'mango-loco', name: 'Mango Loco', line: 'Juice', flavorColor: '#000000', regions: ['EU', 'US'], flavor: 'Juicy mango' },
  { id: 'khaotic', name: 'Khaotic', line: 'Juice', flavorColor: '#000000', regions: ['EU'], flavor: 'Orange citrus' },
  { id: 'ultra-rosa', name: 'Ultra Rosá', line: 'Ultra', flavorColor: '#000000', regions: ['EU', 'US'] },
  { id: 'lo-carb', name: 'Lo-Carb', line: 'Original', flavorColor: '#000000', regions: ['US'] },
];

const at = '2026-10-23T12:00:00.000Z';
const data: UserData = {
  'mango-loco': { tried: true, rating: 5, note: '', updatedAt: at },
  khaotic: { tried: true, rating: 2, note: '', updatedAt: at },
  'lo-carb': { tried: false, rating: null, note: 'Want to try', updatedAt: at },
};

const ids = (result: Can[]) => result.map((can) => can.id);

describe('filterCans', () => {
  it('returns everything with default filters', () => {
    expect(filterCans(cans, data, DEFAULT_FILTERS)).toHaveLength(4);
  });

  it('searches by name, ignoring case and accents', () => {
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, query: 'ROSA' }))).toEqual(['ultra-rosa']);
  });

  it('searches by line too', () => {
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, query: 'juice' }))).toEqual(['mango-loco', 'khaotic']);
  });

  it('searches by flavor too', () => {
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, query: 'citrus' }))).toEqual(['khaotic']);
  });

  it('filters by line', () => {
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, line: 'Ultra' }))).toEqual(['ultra-rosa']);
  });

  it('filters tried and untried', () => {
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, tried: 'tried' }))).toEqual(['mango-loco', 'khaotic']);
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, tried: 'untried' }))).toEqual(['ultra-rosa', 'lo-carb']);
  });

  it('filters by minimum rating, excluding unrated cans', () => {
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, minRating: 3 }))).toEqual(['mango-loco']);
  });

  it('combines filters', () => {
    const filters = { query: 'o', line: 'Juice', tried: 'tried' as const, minRating: 2 as const };
    expect(ids(filterCans(cans, data, filters))).toEqual(['mango-loco', 'khaotic']);
  });

  it('can return nothing', () => {
    expect(filterCans(cans, data, { ...DEFAULT_FILTERS, query: 'zzz' })).toEqual([]);
  });
});

describe('getLines', () => {
  it('lists distinct lines in catalog order', () => {
    expect(getLines(cans)).toEqual(['Juice', 'Ultra', 'Original']);
  });
});

describe('hasActiveFilters', () => {
  it('is false for defaults and true otherwise', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, query: '  ' })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, tried: 'untried' })).toBe(true);
  });
});

describe('URL params', () => {
  it('round-trips filters', () => {
    const filters = { query: 'mango', line: 'Juice', tried: 'tried' as const, minRating: 4 as const };
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it('writes nothing for defaults', () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe('');
  });

  it('ignores invalid values', () => {
    const params = new URLSearchParams('tried=maybe&rating=9&line=');
    expect(filtersFromParams(params)).toEqual(DEFAULT_FILTERS);
  });
});
