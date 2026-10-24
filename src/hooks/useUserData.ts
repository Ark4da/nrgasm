import { useSyncExternalStore } from 'react';
import { userDataStore, type UserDataSnapshot } from './userDataStore';

export interface UseUserData extends UserDataSnapshot {
  updateEntry: typeof userDataStore.update;
  replaceAll: typeof userDataStore.replaceAll;
  moveLegacy: typeof userDataStore.moveLegacy;
  skipLegacy: typeof userDataStore.skipLegacy;
  requestSignIn: typeof userDataStore.requestSignIn;
  closeSignInPrompt: typeof userDataStore.closeSignInPrompt;
  dismissNotice: typeof userDataStore.dismissNotice;
}

/** The user's collection; the component re-renders whenever it changes. */
export function useUserData(): UseUserData {
  const snapshot = useSyncExternalStore(userDataStore.subscribe, userDataStore.getSnapshot);
  return {
    ...snapshot,
    updateEntry: userDataStore.update,
    replaceAll: userDataStore.replaceAll,
    moveLegacy: userDataStore.moveLegacy,
    skipLegacy: userDataStore.skipLegacy,
    requestSignIn: userDataStore.requestSignIn,
    closeSignInPrompt: userDataStore.closeSignInPrompt,
    dismissNotice: userDataStore.dismissNotice,
  };
}
