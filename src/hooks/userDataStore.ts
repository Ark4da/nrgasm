import type { CanId } from '../types/can';
import type { EntryPatch, UserData } from '../types/tasting';
import { updateEntry } from '../lib/entries';
import { STORAGE_KEY, loadUserData, saveUserData } from '../lib/storage';

// A tiny store outside React. Components read it with useSyncExternalStore
// (see useUserData.ts); every change is saved to localStorage right away.

export interface UserDataSnapshot {
  data: UserData;
  /** Set when saved data could not be read or saving failed. */
  notice: string | null;
}

const UNREADABLE_NOTICE =
  'Your saved collection could not be read, so it starts empty. The old data was kept in the browser under "nrgasm:v1:unreadable".';
const UNAVAILABLE_NOTICE = 'This browser blocks local storage, so your changes will not survive a reload.';

function initialSnapshot(): UserDataSnapshot {
  try {
    const { data, recovered } = loadUserData(window.localStorage);
    return { data, notice: recovered ? UNREADABLE_NOTICE : null };
  } catch {
    return { data: {}, notice: UNAVAILABLE_NOTICE };
  }
}

let snapshot = initialSnapshot();
const listeners = new Set<() => void>();

function emit(next: UserDataSnapshot) {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function setData(data: UserData) {
  let notice = snapshot.notice;
  try {
    saveUserData(window.localStorage, data);
  } catch {
    notice = UNAVAILABLE_NOTICE;
  }
  emit({ data, notice });
}

export const userDataStore = {
  getSnapshot: (): UserDataSnapshot => snapshot,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  update(id: CanId, patch: EntryPatch) {
    setData(updateEntry(snapshot.data, id, patch, new Date()));
  },

  replaceAll(data: UserData) {
    setData(data);
  },

  dismissNotice() {
    emit({ ...snapshot, notice: null });
  },
};

// Another tab changed the collection: pick it up.
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY) {
    emit({ ...snapshot, data: loadUserData(window.localStorage).data });
  }
});
