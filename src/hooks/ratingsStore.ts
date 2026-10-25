import type { CanId } from '../types/can';
import { ratingsFromStats, type CommunityRating } from '../lib/ratings';
import { fetchRatingStats } from '../services/ratings';

// Everyone's average rating per can, loaded once per page load for guests
// and signed-in users alike. Until it arrives, or if it fails, it is empty
// and the cards simply show no community rating.

export type RatingsStatus = 'loading' | 'ready' | 'failed';

let ratings: Record<CanId, CommunityRating> = {};
let status: RatingsStatus = 'loading';
let requested = false;
const listeners = new Set<() => void>();

function loadOnce() {
  if (requested) return;
  requested = true;
  fetchRatingStats()
    .then((rows) => {
      ratings = ratingsFromStats(rows);
      status = 'ready';
    })
    .catch(() => {
      // No community ratings this time; only the ratings page says so
      status = 'failed';
    })
    .finally(() => listeners.forEach((listener) => listener()));
}

export const ratingsStore = {
  getSnapshot: (): Record<CanId, CommunityRating> => ratings,

  getStatus: (): RatingsStatus => status,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    loadOnce();
    return () => listeners.delete(listener);
  },
};
