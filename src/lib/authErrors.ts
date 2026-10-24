/** The parts of a Supabase auth error that decide what the visitor is told. */
export interface AuthErrorInfo {
  code: string | undefined;
  status: number | undefined;
  message: string;
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Wrong email or password.',
  user_already_exists: 'This email already has an account. Sign in instead.',
  weak_password: 'This password is too weak. Use at least 8 characters.',
  email_address_invalid: 'Check the email address.',
  email_not_confirmed: 'Confirm your email first: open the link we sent, then sign in.',
  over_request_rate_limit: 'Too many attempts. Wait a minute and try again.',
  over_email_send_rate_limit: 'Too many emails were sent. Try again in an hour.',
  signup_disabled: 'New accounts are closed for now.',
  email_provider_disabled: 'Signing in with email is turned off for now.',
};

/** Supabase's sign-in and sign-up errors in plain words. */
export function authErrorMessage({ code, status, message }: AuthErrorInfo): string {
  if (code && code in MESSAGES) {
    return MESSAGES[code];
  }
  if (status === 429) {
    return MESSAGES.over_request_rate_limit;
  }
  return `Could not sign in: ${message}`;
}
