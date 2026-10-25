import { useSyncExternalStore } from 'react';
import type { CanId } from '../types/can';
import type { CommunityRating } from '../lib/ratings';
import { ratingsStore, type RatingsStatus } from './ratingsStore';

/** Everyone's average rating per can; empty while loading. */
export function useCommunityRatings(): Record<CanId, CommunityRating> {
  return useSyncExternalStore(ratingsStore.subscribe, ratingsStore.getSnapshot);
}

/** Whether everyone's ratings have arrived yet. */
export function useCommunityRatingsStatus(): RatingsStatus {
  return useSyncExternalStore(ratingsStore.subscribe, ratingsStore.getStatus);
}
