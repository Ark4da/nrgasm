import type { CanId } from '../types/can';
import { isRecord } from './validate';

/** How everyone rated one can. */
export interface CommunityRating {
  average: number;
  count: number;
}

/** Rows of `can_rating_stats` as a map by can id; rows without ratings or with bad fields are skipped. */
export function ratingsFromStats(rows: unknown[]): Record<CanId, CommunityRating> {
  const ratings: Record<CanId, CommunityRating> = {};
  for (const row of rows) {
    if (!isRecord(row)) continue;
    const { can_id, rating_count, rating_sum } = row;
    if (typeof can_id !== 'string' || typeof rating_count !== 'number' || typeof rating_sum !== 'number') continue;
    if (rating_count <= 0) continue;
    ratings[can_id] = { average: rating_sum / rating_count, count: rating_count };
  }
  return ratings;
}

/** "★ 4.2 · 37 ratings" */
export function formatCommunityRating({ average, count }: CommunityRating): string {
  return `★ ${average.toFixed(1)} · ${count} ${count === 1 ? 'rating' : 'ratings'}`;
}

/** "Average rating 4.2 from 37 people", for screen readers. */
export function describeCommunityRating({ average, count }: CommunityRating): string {
  return `Average rating ${average.toFixed(1)} from ${count} ${count === 1 ? 'person' : 'people'}`;
}
