import { isAuthRetryableFetchError } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AccountUser {
  id: string;
  email: string;
}

export type SendLinkResult = { ok: true } | { ok: false; message: string };

const NO_SERVER = 'Sign-in is not set up on this copy of the site.';

/** Emails a sign-in link; the link brings the visitor back to `redirectTo`. */
export async function sendSignInLink(email: string, redirectTo: string): Promise<SendLinkResult> {
  if (!supabase) {
    return { ok: false, message: NO_SERVER };
  }
  try {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    if (!error) {
      return { ok: true };
    }
    if (/not authorized/i.test(error.message)) {
      return { ok: false, message: 'Only invited email addresses can sign in for now.' };
    }
    if (error.status === 429) {
      return { ok: false, message: 'Too many sign-in emails. Try again in an hour.' };
    }
    if (isAuthRetryableFetchError(error)) {
      return { ok: false, message: 'Could not reach the server. Check your connection.' };
    }
    return { ok: false, message: error.message };
  } catch {
    return { ok: false, message: 'Could not reach the server. Check your connection.' };
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
