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
