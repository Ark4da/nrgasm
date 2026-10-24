import { useSyncExternalStore } from 'react';
import { authStore, type AuthState } from './authStore';

/** The current sign-in state; the component re-renders when it changes. */
export function useAuth(): AuthState {
  return useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
}
