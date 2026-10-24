const EXPIRED =
  'This sign-in link has expired or was already used. Ask for a new one, and open it in this browser.';

/**
 * When a sign-in link fails, Supabase sends the visitor back with the reason
 * in the query string or the hash (`error`, `error_code`, `error_description`).
 * Returns a message in plain words, or null when the address has no error.
 */
export function authErrorFromUrl(url: string): string | null {
  const parsed = new URL(url);
  for (const params of [parsed.searchParams, new URLSearchParams(parsed.hash.replace(/^#/, ''))]) {
    const error = params.get('error');
    if (!error) continue;
    if (params.get('error_code') === 'otp_expired') {
      return EXPIRED;
    }
    return `Sign-in failed: ${params.get('error_description') ?? error}`;
  }
  return null;
}

/**
 * A sign-in link that could not be used here (opened in another browser or a
 * mail app's built-in one, or past its 5 minutes) leaves `?code=` in the
 * address with no error. A successful sign-in removes the code first, so a
 * code still there once the visitor is known to be a guest means it failed.
 */
export function unusedSignInCode(url: string): string | null {
  return new URL(url).searchParams.has('code')
    ? 'This sign-in link was opened in a different browser or app, or it ran out. Ask for a new link here, and open it in this browser.'
    : null;
}
