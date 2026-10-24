import type { Can } from '../types/can';
import type { Rating, UserData } from '../types/tasting';
import { getLines } from './filters';

export interface LineStats {
  line: string;
  total: number;
  tried: number;
  averageRating: number | null;
}

export interface RatedCan {
  can: Can;
  rating: Rating;
}

export interface CollectionStats {
  total: number;
  tried: number;
  rated: number;
  wantToTry: number;
  averageRating: number | null;
  /** Caffeine across tried cans whose caffeine is known. */
  caffeineMg: number;
  /** How many tried cans count towards `caffeineMg`. */
  caffeineKnown: number;
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
  let wantToTry = 0;
  let caffeineMg = 0;
  let caffeineKnown = 0;

  for (const can of cans) {
    const entry = data[can.id];
    if (entry?.tried) {
      tried += 1;
      if (can.caffeineMg !== undefined) {
        caffeineMg += can.caffeineMg;
        caffeineKnown += 1;
      }
    }
    if (entry?.wantToTry) {
      wantToTry += 1;
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
    const ratings = rated.filter((item) => item.can.line === line).map((item) => item.rating);
    return {
      line,
      total: inLine.length,
      tried: inLine.filter((can) => data[can.id]?.tried).length,
      averageRating: ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null,
    };
  });

  return {
    total: cans.length,
    tried,
    rated: rated.length,
    wantToTry,
    averageRating: rated.length > 0 ? sum / rated.length : null,
    caffeineMg,
    caffeineKnown,
    distribution,
    topRated,
    byLine,
  };
}
