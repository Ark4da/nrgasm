import type { CanId } from '../types/can';
import type { EntryPatch, TastingEntry, UserData } from '../types/tasting';

const BLANK: Omit<TastingEntry, 'updatedAt'> = { tried: false, rating: null, note: '' };

/**
 * Applies a change to one can and returns a new map (the input is never mutated).
 *
 * Rules:
 * - rating a can marks it as tried;
 * - marking a can as not tried clears its rating;
 * - an entry that is back to blank is removed, so storage holds only real data.
 */
export function updateEntry(data: UserData, id: CanId, patch: EntryPatch, now: Date): UserData {
  const current = data[id] ?? { ...BLANK, updatedAt: now.toISOString() };
  const next: TastingEntry = { ...current, ...patch, updatedAt: now.toISOString() };

  if (patch.rating != null) {
    next.tried = true;
  }
  if (patch.tried === false) {
    next.rating = null;
  }

  const rest = { ...data };
  delete rest[id];

  if (!next.tried && next.rating === null && next.note.trim() === '') {
    return rest;
  }
  return { ...rest, [id]: next };
}
