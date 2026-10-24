import type { CanId } from '../types/can';
import type { EntryPatch, TastingEntry, UserData } from '../types/tasting';

const BLANK: Omit<TastingEntry, 'updatedAt'> = { tried: false, wantToTry: false, rating: null, note: '' };

/**
 * Applies a change to one can and returns a new map (the input is never mutated).
 *
 * Rules:
 * - rating a can marks it as tried;
 * - marking a can as not tried clears its rating;
 * - a tried can is no longer one the user wants to try;
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
  if (next.tried) {
    next.wantToTry = false;
  }

  const rest = { ...data };
  delete rest[id];

  if (!next.tried && !next.wantToTry && next.rating === null && next.note.trim() === '') {
    return rest;
  }
  return { ...rest, [id]: next };
}
