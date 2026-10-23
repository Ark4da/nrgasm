import { useSyncExternalStore } from 'react';
import { userDataStore, type UserDataSnapshot } from './userDataStore';

export interface UseUserData extends UserDataSnapshot {
  updateEntry: typeof userDataStore.update;
  replaceAll: typeof userDataStore.replaceAll;
  dismissNotice: typeof userDataStore.dismissNotice;
}

/** The user's collection; the component re-renders whenever it changes. */
export function useUserData(): UseUserData {
  const { data, notice } = useSyncExternalStore(userDataStore.subscribe, userDataStore.getSnapshot);
  return {
    data,
    notice,
    updateEntry: userDataStore.update,
    replaceAll: userDataStore.replaceAll,
    dismissNotice: userDataStore.dismissNotice,
  };
}
