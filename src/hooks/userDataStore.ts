import type { CanId } from '../types/can';
import type { EntryPatch, UserData } from '../types/tasting';
import { updateEntry } from '../lib/entries';
import { createWriteQueue } from '../lib/queue';
import { importPlan, planWrite, restoreEntry, rowsToUserData } from '../lib/rows';
import { readCache, userCacheKey, writeCache } from '../lib/storage';
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
}

const SAVE_FAILED = 'Could not save your change, so it was undone. Check your connection and try again.';
const LOAD_FAILED = 'Could not load your tastings. Showing the last saved copy.';

let snapshot: UserDataSnapshot = { data: {}, notice: null, mode: 'guest', signInPrompt: false };
let userId: string | null = null;
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

async function load(id: string) {
  try {
    const data = rowsToUserData(await fetchEntries());
    if (userId === id) setData(data);
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
    emit({ data: readCacheSafely(userId), notice: null, mode: 'signed-in', signInPrompt: false });
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
  emit({ data: {}, notice: null, mode: 'guest', signInPrompt: false });
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
