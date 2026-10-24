import { onSessionChange, type AccountUser } from '../services/auth';

// Who is signed in, as a store outside React (like userDataStore):
// useAuth() reads it with useSyncExternalStore, and other stores subscribe directly.

export type AuthState = { status: 'loading' } | { status: 'guest' } | { status: 'signed-in'; user: AccountUser };

let state: AuthState = { status: 'loading' };
const listeners = new Set<() => void>();

onSessionChange((user) => {
  const next: AuthState = user ? { status: 'signed-in', user } : { status: 'guest' };
  // Token refreshes report the same user again; keep the snapshot so nothing re-renders
  if (next.status === 'signed-in' && state.status === 'signed-in' && state.user.id === next.user.id) {
    return;
  }
  state = next;
  listeners.forEach((listener) => listener());
});

export const authStore = {
  getSnapshot: (): AuthState => state,

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
