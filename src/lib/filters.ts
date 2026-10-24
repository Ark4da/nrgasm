import type { Can, Region } from '../types/can';
import type { Rating, UserData } from '../types/tasting';
import { isRating } from './validate';

export type TriedFilter = 'all' | 'tried' | 'untried' | 'want';
export type Availability = 'current' | 'all' | 'discontinued';
export type SortKey = 'catalog' | 'name' | 'caffeine' | 'sugar' | 'rating' | 'recent';

export interface CatalogFilters {
  query: string;
  line: string | null;
  tried: TriedFilter;
  minRating: Rating | null;
  availability: Availability;
  region: Region | null;
  sort: SortKey;
}

export const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  line: null,
  tried: 'all',
  minRating: null,
  availability: 'current',
  region: null,
  sort: 'catalog',
};

export const SORT_KEYS: SortKey[] = ['catalog', 'name', 'caffeine', 'sugar', 'rating', 'recent'];

/** Lowercase and strip accents, so "rosa" finds "Rosá". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export function filterCans(cans: Can[], data: UserData, filters: CatalogFilters): Can[] {
  const query = normalize(filters.query);

  return cans.filter((can) => {
    const entry = data[can.id];
    const tried = entry?.tried ?? false;

    if (filters.availability === 'current' && can.discontinued) {
      return false;
    }
    if (filters.availability === 'discontinued' && !can.discontinued) {
      return false;
    }
    if (query !== '' && !normalize(`${can.name} ${can.line} ${can.flavor ?? ''}`).includes(query)) {
      return false;
    }
    if (filters.line !== null && can.line !== filters.line) {
      return false;
    }
    if (filters.region !== null && !can.regions.includes(filters.region)) {
      return false;
    }
    if (filters.tried === 'tried' && !tried) {
      return false;
    }
    if (filters.tried === 'untried' && tried) {
      return false;
    }
    if (filters.tried === 'want' && !entry?.wantToTry) {
      return false;
    }
    if (filters.minRating !== null && (entry?.rating ?? 0) < filters.minRating) {
      return false;
    }
    return true;
  });
}

/**
 * Orders by a number; cans without one go last, in catalog order.
 * `direction` 1 = smallest first, -1 = largest first.
 */
function byNumber(value: (can: Can) => number | undefined, direction: 1 | -1) {
  return (a: Can, b: Can): number => {
    const x = value(a);
    const y = value(b);
    if (x === undefined || y === undefined) {
      return (x === undefined ? 1 : 0) - (y === undefined ? 1 : 0);
    }
    return (x - y) * direction;
  };
}

/** A sorted copy; the stable sort keeps catalog order among equals. */
export function sortCans(cans: Can[], data: UserData, sort: SortKey): Can[] {
  const copy = [...cans];
  switch (sort) {
    case 'catalog':
      return copy;
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name, 'en'));
    case 'caffeine':
      return copy.sort(byNumber((can) => can.caffeineMg, -1));
    case 'sugar':
      return copy.sort(byNumber((can) => can.sugarG, 1));
    case 'rating':
      return copy.sort(byNumber((can) => data[can.id]?.rating ?? undefined, -1));
    case 'recent':
      return copy.sort(byNumber((can) => {
        const at = data[can.id]?.updatedAt;
        return at === undefined ? undefined : Date.parse(at);
      }, -1));
  }
}

/** Distinct lines in catalog order. */
export function getLines(cans: Can[]): string[] {
  return [...new Set(cans.map((can) => can.line))];
}

/** How many filters differ from the defaults, not counting the search box or the sort. */
export function activeFilterCount(filters: CatalogFilters): number {
  return [
    filters.line !== null,
    filters.tried !== DEFAULT_FILTERS.tried,
    filters.minRating !== null,
    filters.availability !== DEFAULT_FILTERS.availability,
    filters.region !== null,
  ].filter(Boolean).length;
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return filters.query.trim() !== '' || activeFilterCount(filters) > 0;
}

// Filters live in the URL (?q=mango&line=Juice&tried=tried&rating=4&show=all&region=EU&sort=name),
// so a filtered view survives a reload and the back button.

function isTriedFilter(value: string | null): value is TriedFilter {
  return value === 'all' || value === 'tried' || value === 'untried' || value === 'want';
}

function isAvailability(value: string | null): value is Availability {
  return value === 'current' || value === 'all' || value === 'discontinued';
}

function isRegion(value: string | null): value is Region {
  return value === 'EU' || value === 'US';
}

function isSortKey(value: string | null): value is SortKey {
  return SORT_KEYS.some((key) => key === value);
}

export function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const tried = params.get('tried');
  const rating = Number(params.get('rating'));
  const show = params.get('show');
  const region = params.get('region');
  const sort = params.get('sort');
  return {
    query: params.get('q') ?? '',
    line: params.get('line') || null,
    tried: isTriedFilter(tried) ? tried : 'all',
    minRating: isRating(rating) ? rating : null,
    availability: isAvailability(show) ? show : DEFAULT_FILTERS.availability,
    region: isRegion(region) ? region : null,
    sort: isSortKey(sort) ? sort : DEFAULT_FILTERS.sort,
  };
}

export function filtersToParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query !== '') params.set('q', filters.query);
  if (filters.line !== null) params.set('line', filters.line);
  if (filters.tried !== 'all') params.set('tried', filters.tried);
  if (filters.minRating !== null) params.set('rating', String(filters.minRating));
  if (filters.availability !== DEFAULT_FILTERS.availability) params.set('show', filters.availability);
  if (filters.region !== null) params.set('region', filters.region);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  return params;
}
