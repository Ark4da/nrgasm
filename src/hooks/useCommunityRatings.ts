import { useSyncExternalStore } from 'react';
import type { CanId } from '../types/can';
import type { CommunityRating } from '../lib/ratings';
import { ratingsStore } from './ratingsStore';

/** Everyone's average rating per can; empty while loading. */
export function useCommunityRatings(): Record<CanId, CommunityRating> {
  return useSyncExternalStore(ratingsStore.subscribe, ratingsStore.getSnapshot);
}
