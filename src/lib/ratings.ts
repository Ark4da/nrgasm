import type { Can, CanId } from '../types/can';
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

/** One row of the community chart. */
export interface RankedCan {
  can: Can;
  rating: CommunityRating;
}

/**
 * How many "average" votes every can starts with when ranking. A can with one
 * 5-star rating is pulled towards the overall average, so it does not top
 * cans that many people rated highly.
 */
const PRIOR_VOTES = 3;

/** Rated catalog cans, best first: by weighted average, then by number of ratings, then by name. */
export function rankCans(cans: Can[], ratings: Record<CanId, CommunityRating>): RankedCan[] {
  const rated: RankedCan[] = [];
  for (const can of cans) {
    const rating = ratings[can.id];
    if (rating) rated.push({ can, rating });
  }

  let votes = 0;
  let stars = 0;
  for (const { rating } of rated) {
    votes += rating.count;
    stars += rating.average * rating.count;
  }
  const overall = votes === 0 ? 0 : stars / votes;
  const score = ({ average, count }: CommunityRating) =>
    (PRIOR_VOTES * overall + average * count) / (PRIOR_VOTES + count);

  return rated.sort(
    (a, b) =>
      score(b.rating) - score(a.rating) || b.rating.count - a.rating.count || a.can.name.localeCompare(b.can.name),
  );
}
