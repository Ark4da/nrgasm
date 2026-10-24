import type { Rating, TastingEntry, UserData } from '../types/tasting';

// Runtime checks for data that comes from outside the type system
// (localStorage, imported files). TypeScript types vanish at runtime,
// so `unknown` has to be narrowed by hand.

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isRating(value: unknown): value is Rating {
  return value === 1 || value === 2 || value === 3 || value === 4 || value === 5;
}

/** A stored entry: like TastingEntry, but `wantToTry` may be missing in older data. */
type StoredEntry = Omit<TastingEntry, 'wantToTry'> & { wantToTry?: boolean };

export function isTastingEntry(value: unknown): value is StoredEntry {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.tried === 'boolean' &&
    // Missing in data saved before "want to try" existed
    (value.wantToTry === undefined || typeof value.wantToTry === 'boolean') &&
    (value.rating === null || isRating(value.rating)) &&
    typeof value.note === 'string' &&
    typeof value.updatedAt === 'string' &&
    !Number.isNaN(Date.parse(value.updatedAt))
  );
}

/** Returns the map if every entry is valid, otherwise null. */
export function parseUserData(value: unknown): UserData | null {
  if (!isRecord(value)) {
    return null;
  }
  const data: UserData = {};
  for (const [id, entry] of Object.entries(value)) {
    if (!isTastingEntry(entry)) {
      return null;
    }
    data[id] = {
      tried: entry.tried,
      wantToTry: entry.wantToTry ?? false,
      rating: entry.rating,
      note: entry.note,
      updatedAt: entry.updatedAt,
    };
  }
  return data;
}
