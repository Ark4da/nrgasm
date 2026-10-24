import { describe, expect, it } from 'vitest';
import { authErrorFromUrl } from './authUrl';

describe('authErrorFromUrl', () => {
  it('explains an expired or reused link', () => {
    expect(
      authErrorFromUrl(
        'https://nrgasm.vercel.app/?error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired',
      ),
    ).toBe('This sign-in link has expired or was already used. Ask for a new one, and open it in this browser.');
  });

  it('reads errors from the hash too', () => {
    expect(authErrorFromUrl('https://nrgasm.vercel.app/#error=server_error&error_description=Boom')).toBe(
      'Sign-in failed: Boom',
    );
  });

  it('returns null without an error', () => {
    expect(authErrorFromUrl('https://nrgasm.vercel.app/catalog?code=abc')).toBeNull();
  });
});
