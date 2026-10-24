import { describe, expect, it } from 'vitest';
import type { Can } from '../types/can';
import type { UserData } from '../types/tasting';
import {
  DEFAULT_FILTERS,
  activeFilterCount,
  filterCans,
  filtersFromParams,
  filtersToParams,
  getLines,
  hasActiveFilters,
  sortCans,
  type CatalogFilters,
} from './filters';

const cans: Can[] = [
  { id: 'mango-loco', name: 'Mango Loco', line: 'Juice', flavorColor: '#000000', regions: ['EU', 'US'], flavor: 'Juicy mango', caffeineMg: 160, sugarG: 56 },
  { id: 'khaotic', name: 'Khaotic', line: 'Juice', flavorColor: '#000000', regions: ['EU'], flavor: 'Orange citrus', caffeineMg: 160, sugarG: 39 },
  { id: 'ultra-rosa', name: 'Ultra Rosá', line: 'Ultra', flavorColor: '#000000', regions: ['EU', 'US'], caffeineMg: 150, sugarG: 0 },
  { id: 'lo-carb', name: 'Lo-Carb', line: 'Original', flavorColor: '#000000', regions: ['US'], caffeineMg: 140 },
  { id: 'khaos', name: 'Khaos', line: 'Juice', flavorColor: '#000000', regions: ['US'], discontinued: true },
];

const data: UserData = {
  'mango-loco': { tried: true, wantToTry: false, rating: 5, note: '', updatedAt: '2026-10-20T12:00:00.000Z' },
  khaotic: { tried: true, wantToTry: false, rating: 2, note: '', updatedAt: '2026-10-22T12:00:00.000Z' },
  'lo-carb': { tried: false, wantToTry: true, rating: null, note: '', updatedAt: '2026-10-21T12:00:00.000Z' },
};

const ids = (result: Can[]) => result.map((can) => can.id);
const all: CatalogFilters = { ...DEFAULT_FILTERS, availability: 'all' };

describe('filterCans', () => {
  it('shows only cans still on sale by default', () => {
    expect(ids(filterCans(cans, data, DEFAULT_FILTERS))).toEqual(['mango-loco', 'khaotic', 'ultra-rosa', 'lo-carb']);
  });

  it('can show everything, or only discontinued cans', () => {
    expect(filterCans(cans, data, all)).toHaveLength(5);
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, availability: 'discontinued' }))).toEqual(['khaos']);
  });

  it('searches by name, ignoring case and accents', () => {
    expect(ids(filterCans(cans, data, { ...all, query: 'ROSA' }))).toEqual(['ultra-rosa']);
  });

  it('searches by line too', () => {
    expect(ids(filterCans(cans, data, { ...DEFAULT_FILTERS, query: 'juice' }))).toEqual(['mango-loco', 'khaotic']);
  });

  it('searches by flavor too', () => {
    expect(ids(filterCans(cans, data, { ...all, query: 'citrus' }))).toEqual(['khaotic']);
  });

  it('filters by line', () => {
    expect(ids(filterCans(cans, data, { ...all, line: 'Ultra' }))).toEqual(['ultra-rosa']);
  });

  it('filters by region', () => {
    expect(ids(filterCans(cans, data, { ...all, region: 'EU' }))).toEqual(['mango-loco', 'khaotic', 'ultra-rosa']);
    expect(ids(filterCans(cans, data, { ...all, region: 'US' }))).toEqual(['mango-loco', 'ultra-rosa', 'lo-carb', 'khaos']);
  });

  it('filters tried, untried, and want to try', () => {
    expect(ids(filterCans(cans, data, { ...all, tried: 'tried' }))).toEqual(['mango-loco', 'khaotic']);
    expect(ids(filterCans(cans, data, { ...all, tried: 'untried' }))).toEqual(['ultra-rosa', 'lo-carb', 'khaos']);
    expect(ids(filterCans(cans, data, { ...all, tried: 'want' }))).toEqual(['lo-carb']);
  });

  it('filters by minimum rating, excluding unrated cans', () => {
    expect(ids(filterCans(cans, data, { ...all, minRating: 3 }))).toEqual(['mango-loco']);
  });

  it('combines filters', () => {
    const filters: CatalogFilters = { ...DEFAULT_FILTERS, query: 'o', line: 'Juice', tried: 'tried', minRating: 2 };
    expect(ids(filterCans(cans, data, filters))).toEqual(['mango-loco', 'khaotic']);
  });

  it('can return nothing', () => {
    expect(filterCans(cans, data, { ...all, query: 'zzz' })).toEqual([]);
  });
});

describe('sortCans', () => {
  it('keeps catalog order by default', () => {
    expect(ids(sortCans(cans, data, 'catalog'))).toEqual(ids(cans));
  });

  it('sorts by name', () => {
    expect(ids(sortCans(cans, data, 'name'))).toEqual(['khaos', 'khaotic', 'lo-carb', 'mango-loco', 'ultra-rosa']);
  });

  it('sorts by caffeine, most first, unknown last', () => {
    expect(ids(sortCans(cans, data, 'caffeine'))).toEqual(['mango-loco', 'khaotic', 'ultra-rosa', 'lo-carb', 'khaos']);
  });

  it('sorts by sugar, least first, unknown last', () => {
    expect(ids(sortCans(cans, data, 'sugar'))).toEqual(['ultra-rosa', 'khaotic', 'mango-loco', 'lo-carb', 'khaos']);
  });

  it('sorts by the user’s rating, unrated last', () => {
    expect(ids(sortCans(cans, data, 'rating')).slice(0, 2)).toEqual(['mango-loco', 'khaotic']);
  });

  it('sorts by the latest change, untouched cans last', () => {
    expect(ids(sortCans(cans, data, 'recent')).slice(0, 3)).toEqual(['khaotic', 'lo-carb', 'mango-loco']);
  });

  it('does not mutate the input', () => {
    const copy = [...cans];
    sortCans(cans, data, 'name');
    expect(cans).toEqual(copy);
  });
});

describe('getLines', () => {
  it('lists distinct lines in catalog order', () => {
    expect(getLines(cans)).toEqual(['Juice', 'Ultra', 'Original']);
  });
});

describe('hasActiveFilters / activeFilterCount', () => {
  it('ignores the defaults and the sort order', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, query: '  ' })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, sort: 'name' })).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, tried: 'untried' })).toBe(true);
  });

  it('counts the filters a panel hides (not the search)', () => {
    expect(activeFilterCount({ ...DEFAULT_FILTERS, query: 'mango', line: 'Juice', region: 'EU', availability: 'all' })).toBe(3);
  });
});

describe('URL params', () => {
  it('round-trips filters', () => {
    const filters: CatalogFilters = {
      query: 'mango', line: 'Juice', tried: 'want', minRating: 4, availability: 'discontinued', region: 'US', sort: 'caffeine',
    };
    expect(filtersFromParams(filtersToParams(filters))).toEqual(filters);
  });

  it('writes nothing for defaults', () => {
    expect(filtersToParams(DEFAULT_FILTERS).toString()).toBe('');
  });

  it('ignores invalid values', () => {
    const params = new URLSearchParams('tried=maybe&rating=9&line=&show=some&region=JP&sort=price');
    expect(filtersFromParams(params)).toEqual(DEFAULT_FILTERS);
  });
});
