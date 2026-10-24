import type { CanId } from '../types/can';
import type { EntryPatch, UserData } from '../types/tasting';
import { updateEntry } from '../lib/entries';
import { createWriteQueue } from '../lib/queue';
import { importPlan, planWrite, rowsToUserData } from '../lib/rows';
import { failedWrite, loaded, rollbackAll, savedWrite } from '../lib/sync';
import { mergeUserData } from '../lib/merge';
import { loadUserData, markLegacyMoved, readCache, userCacheKey, writeCache } from '../lib/storage';
import { applyImport, fetchEntries, writeEntry } from '../services/entries';
import { authStore } from './authStore';

// A tiny store outside React. Components read it with useSyncExternalStore
// (see useUserData.ts).
//
// Guests: no data; trying to change something asks them to sign in.
// Signed in: the account's rows are loaded once, every change shows at once
// and is sent to Supabase in the background, one write at a time per can.
// A write that fails is undone on screen. The last loaded data is cached in
// localStorage per account, for a fast start and for reading offline.

export interface UserDataSnapshot {
  data: UserData;
  /** A message for the header: a failed save or load. */
  notice: string | null;
  mode: 'guest' | 'signed-in';
  /** True while the "Sign in to keep track" prompt should show. */
  signInPrompt: boolean;
  /** Tastings saved in this browser before signing in, waiting to be moved; 0 when none. */
  legacyCount: number;
}

const SAVE_FAILED = 'Could not save your change, so it was undone. Check your connection and try again.';
const LOAD_FAILED = 'Could not load your tastings. Showing the last saved copy.';

let snapshot: UserDataSnapshot = { data: {}, notice: null, mode: 'guest', signInPrompt: false, legacyCount: 0 };
let userId: string | null = null;
/** What the database is known to hold (see lib/sync.ts); failures fall back to it. */
let confirmed: UserData = {};
/** "Not now" on the move question holds until the next page load. */
let legacySkipped = false;
const listeners = new Set<() => void>();
const runWrite = createWriteQueue();

function emit(next: UserDataSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

/** Shows `data` and keeps the account's cache in step (a blocked localStorage is fine). */
function setData(data: UserData) {
  if (userId) {
    try {
      writeCache(window.localStorage, userId, data);
    } catch {
      // No cache this time; the database still has everything
    }
  }
  emit({ ...snapshot, data });
}

function readCacheSafely(id: string): UserData {
  try {
    return readCache(window.localStorage, id);
  } catch {
    return {};
  }
}

/** This browser's tastings from before accounts existed. */
function readLegacy(): UserData {
  try {
    return loadUserData(window.localStorage).data;
  } catch {
    return {};
  }
}

async function load(id: string) {
  try {
    const data = rowsToUserData(await fetchEntries());
    if (userId !== id) return;
    const state = loaded(data);
    confirmed = state.confirmed;
    setData(state.data);
    // Only once the account's own rows are here can old data be merged into them
    const legacyCount = legacySkipped ? 0 : Object.keys(readLegacy()).length;
    if (legacyCount > 0) emit({ ...snapshot, legacyCount });
  } catch {
    // Keep a more specific notice (a failed import or move) if there is one
    if (userId === id && !snapshot.notice) emit({ ...snapshot, notice: LOAD_FAILED });
  }
}

function followAuth() {
  const auth = authStore.getSnapshot();
  if (auth.status === 'loading') return;

  if (auth.status === 'signed-in') {
    if (userId === auth.user.id) return;
    userId = auth.user.id;
    // The cache is the last copy the database confirmed (failed changes are undone in it too)
    confirmed = readCacheSafely(userId);
    emit({ data: confirmed, notice: null, mode: 'signed-in', signInPrompt: false, legacyCount: 0 });
    void load(userId);
    return;
  }

  // Signed out (or never signed in): forget the account on this device
  if (userId) {
    try {
      window.localStorage.removeItem(userCacheKey(userId));
    } catch {
      // Nothing to clean up
    }
  }
  userId = null;
  confirmed = {};
  emit({ data: {}, notice: null, mode: 'guest', signInPrompt: false, legacyCount: 0 });
}

/** A failed import or move: show the confirmed data again, then re-read the database if it can be reached. */
function undoBulkChange(owner: string, notice: string) {
  if (userId !== owner) return;
  setData(rollbackAll({ data: snapshot.data, confirmed }).data);
  emit({ ...snapshot, notice });
  void load(owner);
}

authStore.subscribe(followAuth);
followAuth();

export const userDataStore = {
  getSnapshot: (): UserDataSnapshot => snapshot,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  update(id: CanId, patch: EntryPatch) {
    const owner = userId;
    if (!owner) {
      emit({ ...snapshot, signInPrompt: true });
      return;
    }
    const next = updateEntry(snapshot.data, id, patch, new Date());
    setData(next);
    const written = next[id];
    runWrite(id, () => writeEntry(planWrite(owner, id, next))).then(
      () => {
        if (userId === owner) confirmed = savedWrite({ data: snapshot.data, confirmed }, id, written).confirmed;
      },
      () => {
        if (userId !== owner) return;
        const state = failedWrite({ data: snapshot.data, confirmed }, id, written);
        // A newer change to this can is already on screen: its own write decides
        if (state.data === snapshot.data) return;
        setData(state.data);
        emit({ ...snapshot, notice: SAVE_FAILED });
      },
    );
  },

  /** Import: replaces the account's tastings with `data`. Resolves to whether it was saved. */
  async replaceAll(data: UserData): Promise<boolean> {
    const owner = userId;
    if (!owner) {
      emit({ ...snapshot, signInPrompt: true });
      return false;
    }
    const plan = importPlan(owner, snapshot.data, data);
    setData(data);
    try {
      await applyImport(plan);
      if (userId === owner) confirmed = data;
      return true;
    } catch {
      undoBulkChange(owner, 'The import did not finish, so nothing changed. Check your connection and try again.');
      return false;
    }
  },

  /** Moves this browser's old tastings into the account; the newer entry wins per can. */
  async moveLegacy(): Promise<void> {
    const owner = userId;
    if (!owner) return;
    const merged = mergeUserData(snapshot.data, readLegacy());
    const plan = importPlan(owner, snapshot.data, merged);
    setData(merged);
    emit({ ...snapshot, legacyCount: 0 });
    try {
      await applyImport(plan);
      if (userId === owner) confirmed = merged;
      markLegacyMoved(window.localStorage);
    } catch {
      undoBulkChange(owner, 'Could not move your tastings. They are still in this browser; try again after a reload.');
    }
  },

  skipLegacy() {
    legacySkipped = true;
    emit({ ...snapshot, legacyCount: 0 });
  },

  requestSignIn() {
    emit({ ...snapshot, signInPrompt: true });
  },

  closeSignInPrompt() {
    emit({ ...snapshot, signInPrompt: false });
  },

  dismissNotice() {
    emit({ ...snapshot, notice: null });
  },
};

// Another tab of the same account saved a change: pick up its copy.
window.addEventListener('storage', (event) => {
  if (userId && event.key === userCacheKey(userId)) {
    emit({ ...snapshot, data: readCacheSafely(userId) });
  }
});
