import { isAuthRetryableFetchError, type AuthError } from '@supabase/supabase-js';
import { authErrorMessage } from '../lib/authErrors';
import { supabase } from './supabase';

export interface AccountUser {
  id: string;
  email: string;
}

export type AuthResult =
  | { kind: 'signed-in' }
  /** The account exists but must be confirmed from an email first ("Confirm email" is on in Supabase). */
  | { kind: 'confirm-email' }
  | { kind: 'error'; message: string };

const NO_SERVER = 'Sign-in is not set up on this copy of the site.';
const OFFLINE = 'Could not reach the server. Check your connection.';

function failure(error: AuthError): AuthResult {
  if (isAuthRetryableFetchError(error)) {
    return { kind: 'error', message: OFFLINE };
  }
  return { kind: 'error', message: authErrorMessage({ code: error.code, status: error.status, message: error.message }) };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { kind: 'error', message: NO_SERVER };
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? failure(error) : { kind: 'signed-in' };
  } catch {
    return { kind: 'error', message: OFFLINE };
  }
}

/** Creates an account. With "Confirm email" off in Supabase it signs in at once, with no email sent. */
export async function signUpWithPassword(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { kind: 'error', message: NO_SERVER };
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/catalog` },
    });
    if (error) return failure(error);
    return data.session ? { kind: 'signed-in' } : { kind: 'confirm-email' };
  } catch {
    return { kind: 'error', message: OFFLINE };
  }
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut();
}

/** Calls `listener` with the signed-in user (or null) now and after every change. */
export function onSessionChange(listener: (user: AccountUser | null) => void): () => void {
  if (!supabase) {
    listener(null);
    return () => {};
  }
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    listener(user ? { id: user.id, email: user.email ?? '' } : null);
  });
  return () => data.subscription.unsubscribe();
}
