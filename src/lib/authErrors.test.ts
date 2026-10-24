import { describe, expect, it } from 'vitest';
import { authErrorMessage } from './authErrors';

describe('authErrorMessage', () => {
  it('explains a wrong email or password', () => {
    expect(authErrorMessage({ code: 'invalid_credentials', status: 400, message: 'Invalid login credentials' })).toBe(
      'Wrong email or password.',
    );
  });

  it('sends someone with an account to sign in instead', () => {
    expect(authErrorMessage({ code: 'user_already_exists', status: 422, message: 'User already registered' })).toBe(
      'This email already has an account. Sign in instead.',
    );
  });

  it('asks for a stronger password', () => {
    expect(authErrorMessage({ code: 'weak_password', status: 422, message: 'Password is too weak' })).toBe(
      'This password is too weak. Use at least 8 characters.',
    );
  });

  it('asks to confirm the email first', () => {
    expect(authErrorMessage({ code: 'email_not_confirmed', status: 400, message: 'Email not confirmed' })).toBe(
      'Confirm your email first: open the link we sent, then sign in.',
    );
  });

  it('asks to slow down on too many attempts', () => {
    expect(authErrorMessage({ code: 'over_request_rate_limit', status: 429, message: 'Rate limit' })).toBe(
      'Too many attempts. Wait a minute and try again.',
    );
    expect(authErrorMessage({ code: undefined, status: 429, message: 'Too many requests' })).toBe(
      'Too many attempts. Wait a minute and try again.',
    );
  });

  it('keeps an unknown error readable', () => {
    expect(authErrorMessage({ code: 'something_new', status: 500, message: 'Database error saving new user' })).toBe(
      'Could not sign in: Database error saving new user',
    );
  });
});
