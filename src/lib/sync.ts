import type { CanId } from '../types/can';
import type { TastingEntry, UserData } from '../types/tasting';

// What the screen shows (`data`) next to what the database is known to hold
// (`confirmed`): the rows it returned plus every write it accepted. When a
// write fails, the screen goes back to the confirmed entry, never to an
// earlier change that was itself never saved.

export interface SyncState {
  data: UserData;
  confirmed: UserData;
}

export function loaded(data: UserData): SyncState {
  return { data, confirmed: data };
}

function withEntry(map: UserData, canId: CanId, entry: TastingEntry | undefined): UserData {
  const rest = { ...map };
  delete rest[canId];
  return entry ? { ...rest, [canId]: entry } : rest;
}

/** The database accepted `written` (undefined: a delete) for this can. */
export function savedWrite(state: SyncState, canId: CanId, written: TastingEntry | undefined): SyncState {
  return { ...state, confirmed: withEntry(state.confirmed, canId, written) };
}

/**
 * A write of `written` failed. If the screen still shows it, show the
 * confirmed entry instead; if a newer change is already on screen, leave it,
 * because its own write decides what happens next.
 */
export function failedWrite(state: SyncState, canId: CanId, written: TastingEntry | undefined): SyncState {
  if (state.data[canId] !== written) {
    return state;
  }
  return { ...state, data: withEntry(state.data, canId, state.confirmed[canId]) };
}

/** An import or move failed: show exactly what the database is known to hold. */
export function rollbackAll(state: SyncState): SyncState {
  return { ...state, data: state.confirmed };
}
