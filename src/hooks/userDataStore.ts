import type { CanId } from '../types/can';
import type { EntryPatch, UserData } from '../types/tasting';
import { updateEntry } from '../lib/entries';
import { createWriteQueue } from '../lib/queue';
import { importPlan, planWrite, restoreEntry, rowsToUserData } from '../lib/rows';
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
    setData(data);
    // Only once the account's own rows are here can old data be merged into them
    const legacyCount = legacySkipped ? 0 : Object.keys(readLegacy()).length;
    if (legacyCount > 0) emit({ ...snapshot, legacyCount });
  } catch {
    if (userId === id) emit({ ...snapshot, notice: LOAD_FAILED });
  }
}

function followAuth() {
  const auth = authStore.getSnapshot();
  if (auth.status === 'loading') return;

  if (auth.status === 'signed-in') {
    if (userId === auth.user.id) return;
    userId = auth.user.id;
    emit({ data: readCacheSafely(userId), notice: null, mode: 'signed-in', signInPrompt: false, legacyCount: 0 });
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
  emit({ data: {}, notice: null, mode: 'guest', signInPrompt: false, legacyCount: 0 });
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
    const previous = snapshot.data[id];
    const next = updateEntry(snapshot.data, id, patch, new Date());
    setData(next);
    const written = next[id];
    runWrite(id, () => writeEntry(planWrite(owner, id, next))).catch(() => {
      // Undo only if nothing newer replaced this change in the meantime
      if (userId !== owner || snapshot.data[id] !== written) return;
      setData(restoreEntry(snapshot.data, id, previous));
      emit({ ...snapshot, notice: SAVE_FAILED });
    });
  },

  /** Import: replaces the account's tastings with `data`. */
  async replaceAll(data: UserData): Promise<void> {
    const owner = userId;
    if (!owner) {
      emit({ ...snapshot, signInPrompt: true });
      return;
    }
    const plan = importPlan(owner, snapshot.data, data);
    setData(data);
    try {
      await applyImport(plan);
    } catch {
      emit({ ...snapshot, notice: 'The import did not finish. Your account shows what was saved.' });
      await load(owner);
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
      markLegacyMoved(window.localStorage);
    } catch {
      emit({ ...snapshot, notice: 'Could not move your tastings. They are still in this browser; try again after a reload.' });
      await load(owner);
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
