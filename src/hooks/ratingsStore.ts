import type { CanId } from '../types/can';
import { ratingsFromStats, type CommunityRating } from '../lib/ratings';
import { fetchRatingStats } from '../services/ratings';

// Everyone's average rating per can, loaded once per page load for guests
// and signed-in users alike. Until it arrives, or if it fails, it is empty
// and the cards simply show no community rating.

let ratings: Record<CanId, CommunityRating> = {};
let requested = false;
const listeners = new Set<() => void>();

function loadOnce() {
  if (requested) return;
  requested = true;
  fetchRatingStats()
    .then((rows) => {
      ratings = ratingsFromStats(rows);
      listeners.forEach((listener) => listener());
    })
    .catch(() => {
      // No community ratings this time; nothing else depends on them
    });
}

export const ratingsStore = {
  getSnapshot: (): Record<CanId, CommunityRating> => ratings,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    loadOnce();
    return () => listeners.delete(listener);
  },
};
