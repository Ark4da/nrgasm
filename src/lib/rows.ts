import type { CanId } from '../types/can';
import type { TastingEntry, UserData } from '../types/tasting';
import { isRating, isRecord } from './validate';

// The bridge between the app's TastingEntry and a row of the Supabase
// table `tasting_entries`. Rows come over the network, so they are checked
// like any other outside data: a bad row is skipped, never trusted.

export interface EntryRow {
  user_id: string;
  can_id: string;
  tried: boolean;
  want_to_try: boolean;
  rating: number | null;
  note: string;
  updated_at: string;
}

/** One row as [can id, entry], or null when any field is wrong. */
export function rowToEntry(row: unknown): [canId: CanId, entry: TastingEntry] | null {
  if (!isRecord(row)) {
    return null;
  }
  const { can_id, tried, want_to_try, rating, note, updated_at } = row;
  if (
    typeof can_id !== 'string' ||
    can_id === '' ||
    typeof tried !== 'boolean' ||
    typeof want_to_try !== 'boolean' ||
    !(rating === null || isRating(rating)) ||
    typeof note !== 'string' ||
    typeof updated_at !== 'string' ||
    Number.isNaN(Date.parse(updated_at))
  ) {
    return null;
  }
  return [can_id, { tried, wantToTry: want_to_try, rating, note, updatedAt: updated_at }];
}

/** The user's collection from their rows, skipping any that do not check out. */
export function rowsToUserData(rows: unknown[]): UserData {
  const data: UserData = {};
  for (const row of rows) {
    const mapped = rowToEntry(row);
    if (mapped) {
      data[mapped[0]] = mapped[1];
    }
  }
  return data;
}

export function entryToRow(userId: string, canId: CanId, entry: TastingEntry): EntryRow {
  return {
    user_id: userId,
    can_id: canId,
    tried: entry.tried,
    want_to_try: entry.wantToTry,
    rating: entry.rating,
    note: entry.note,
    updated_at: entry.updatedAt,
  };
}

export type WritePlan = { kind: 'upsert'; row: EntryRow } | { kind: 'delete'; canId: CanId };

/** What to send after a change: blank entries are already gone from `data`, so they are deleted. */
export function planWrite(userId: string, canId: CanId, data: UserData): WritePlan {
  const entry = data[canId];
  return entry ? { kind: 'upsert', row: entryToRow(userId, canId, entry) } : { kind: 'delete', canId };
}

/** Puts back the entry from before a write that failed (or removes it, if there was none). */
export function restoreEntry(data: UserData, canId: CanId, previous: TastingEntry | undefined): UserData {
  const rest = { ...data };
  delete rest[canId];
  return previous ? { ...rest, [canId]: previous } : rest;
}

/**
 * An import replaces the account's data. Everything imported is upserted
 * first and only the leftovers are deleted after, so a failure halfway
 * never leaves the account emptier than before.
 */
export function importPlan(
  userId: string,
  current: UserData,
  incoming: UserData,
): { upserts: EntryRow[]; deletes: CanId[] } {
  return {
    upserts: Object.entries(incoming).map(([id, entry]) => entryToRow(userId, id, entry)),
    deletes: Object.keys(current).filter((id) => !(id in incoming)),
  };
}
