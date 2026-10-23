import type { Can } from '../types/can';
import type { Rating, UserData } from '../types/tasting';
import { getLines } from './filters';

export interface LineStats {
  line: string;
  total: number;
  tried: number;
}

export interface RatedCan {
  can: Can;
  rating: Rating;
}

export interface CollectionStats {
  total: number;
  tried: number;
  rated: number;
  averageRating: number | null;
  /** How many cans got each star count. */
  distribution: Record<Rating, number>;
  topRated: RatedCan[];
  byLine: LineStats[];
}

const TOP_LIMIT = 5;

/** Only cans in the catalog count; entries for removed cans are ignored. */
export function computeStats(cans: Can[], data: UserData): CollectionStats {
  const distribution: Record<Rating, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const rated: (RatedCan & { updatedAt: string })[] = [];
  let tried = 0;

  for (const can of cans) {
    const entry = data[can.id];
    if (entry?.tried) {
      tried += 1;
    }
    if (entry?.rating != null) {
      distribution[entry.rating] += 1;
      rated.push({ can, rating: entry.rating, updatedAt: entry.updatedAt });
    }
  }

  const sum = rated.reduce((total, item) => total + item.rating, 0);

  // Highest rating first; among equals, the most recently updated.
  const topRated = [...rated]
    .sort((a, b) => b.rating - a.rating || b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, TOP_LIMIT)
    .map(({ can, rating }) => ({ can, rating }));

  const byLine = getLines(cans).map((line) => {
    const inLine = cans.filter((can) => can.line === line);
    return {
      line,
      total: inLine.length,
      tried: inLine.filter((can) => data[can.id]?.tried).length,
    };
  });

  return {
    total: cans.length,
    tried,
    rated: rated.length,
    averageRating: rated.length > 0 ? sum / rated.length : null,
    distribution,
    topRated,
    byLine,
  };
}
