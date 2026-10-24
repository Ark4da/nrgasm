import { describe, expect, it } from 'vitest';
import { authErrorFromUrl, unusedSignInCode } from './authUrl';

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

describe('unusedSignInCode', () => {
  it('explains a sign-in code left in the address of a guest', () => {
    expect(unusedSignInCode('https://nrgasm.vercel.app/catalog?code=abc')).toBe(
      'This sign-in link was opened in a different browser or app, or it ran out. Ask for a new link here, and open it in this browser.',
    );
  });

  it('says nothing without a code', () => {
    expect(unusedSignInCode('https://nrgasm.vercel.app/catalog?line=Ultra')).toBeNull();
  });
});
