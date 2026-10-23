import type { Can } from '../types/can';
import type { Rating, UserData } from '../types/tasting';
import { isRating } from './validate';

export type TriedFilter = 'all' | 'tried' | 'untried';

export interface CatalogFilters {
  query: string;
  line: string | null;
  tried: TriedFilter;
  minRating: Rating | null;
}

export const DEFAULT_FILTERS: CatalogFilters = { query: '', line: null, tried: 'all', minRating: null };

/** Lowercase and strip accents, so "rosa" finds "Rosá". */
function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

export function filterCans(cans: Can[], data: UserData, filters: CatalogFilters): Can[] {
  const query = normalize(filters.query);

  return cans.filter((can) => {
    const entry = data[can.id];
    const tried = entry?.tried ?? false;

    if (query !== '' && !normalize(`${can.name} ${can.line} ${can.flavor ?? ''}`).includes(query)) {
      return false;
    }
    if (filters.line !== null && can.line !== filters.line) {
      return false;
    }
    if (filters.tried === 'tried' && !tried) {
      return false;
    }
    if (filters.tried === 'untried' && tried) {
      return false;
    }
    if (filters.minRating !== null && (entry?.rating ?? 0) < filters.minRating) {
      return false;
    }
    return true;
  });
}

/** Distinct lines in catalog order. */
export function getLines(cans: Can[]): string[] {
  return [...new Set(cans.map((can) => can.line))];
}

export function hasActiveFilters(filters: CatalogFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.line !== null ||
    filters.tried !== 'all' ||
    filters.minRating !== null
  );
}

// Filters live in the URL (?q=mango&line=Juice&tried=tried&rating=4),
// so a filtered view survives a reload and the back button.

function isTriedFilter(value: string | null): value is TriedFilter {
  return value === 'all' || value === 'tried' || value === 'untried';
}

export function filtersFromParams(params: URLSearchParams): CatalogFilters {
  const tried = params.get('tried');
  const rating = Number(params.get('rating'));
  return {
    query: params.get('q') ?? '',
    line: params.get('line') || null,
    tried: isTriedFilter(tried) ? tried : 'all',
    minRating: isRating(rating) ? rating : null,
  };
}

export function filtersToParams(filters: CatalogFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.query !== '') params.set('q', filters.query);
  if (filters.line !== null) params.set('line', filters.line);
  if (filters.tried !== 'all') params.set('tried', filters.tried);
  if (filters.minRating !== null) params.set('rating', String(filters.minRating));
  return params;
}
