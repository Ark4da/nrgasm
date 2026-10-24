import { useId, useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { signInWithPassword, signUpWithPassword } from '../../services/auth';
import { buttonClass } from '../../components/Button/buttonClass';
import styles from './SignInPage.module.css';

type Mode = 'sign-in' | 'sign-up';
type Status = { kind: 'idle' } | { kind: 'busy' } | { kind: 'confirm-email' } | { kind: 'error'; message: string };

/** Supabase's own minimum is lower; 8 is what the dashboard is set to (docs/DEPLOY.md). */
const MIN_PASSWORD = 8;

/** A failed confirmation link sends the visitor here with the reason (see Layout). */
function errorFromState(state: unknown): string | null {
  if (typeof state === 'object' && state !== null && 'authError' in state && typeof state.authError === 'string') {
    return state.authError;
  }
  return null;
}

export function SignInPage() {
  const auth = useAuth();
  const location = useLocation();
  const emailId = useId();
  const passwordId = useId();
  const panelId = useId();
  const [mode, setMode] = useState<Mode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const linkError = errorFromState(location.state);

  // Signing in (or a new account) moves the visitor on as soon as the session arrives
  if (auth.status === 'signed-in') {
    return <Navigate to="/catalog" replace />;
  }

  function switchTo(next: Mode) {
    setMode(next);
    setStatus({ kind: 'idle' });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: 'busy' });
    const send = mode === 'sign-in' ? signInWithPassword : signUpWithPassword;
    const result = await send(email.trim(), password);
    if (result.kind === 'error') setStatus({ kind: 'error', message: result.message });
    else if (result.kind === 'confirm-email') setStatus({ kind: 'confirm-email' });
    // 'signed-in': the auth store updates and the Navigate above takes over
  }

  const signingUp = mode === 'sign-up';

  return (
    <div className={styles.page}>
      <title>{signingUp ? 'Create an account | NRGASM' : 'Sign in | NRGASM'}</title>
      <h1 className={styles.title}>{signingUp ? 'Create an account' : 'Sign in'}</h1>

      <div className={styles.tabs} role="tablist" aria-label="Sign in or create an account">
        <button
          type="button"
          role="tab"
          aria-selected={!signingUp}
          aria-controls={panelId}
          className={styles.tab}
          onClick={() => switchTo('sign-in')}
        >
          Sign in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={signingUp}
          aria-controls={panelId}
          className={styles.tab}
          onClick={() => switchTo('sign-up')}
        >
          Create account
        </button>
      </div>

      {status.kind === 'confirm-email' ? (
        <div className={styles.sent} role="status">
          <p className={styles.lead}>Almost there.</p>
          <p className={styles.text}>
            Your account was created. Open the confirmation link we sent to <strong>{email.trim()}</strong>, then sign
            in here.
          </p>
          <button type="button" className={buttonClass('ghost')} onClick={() => switchTo('sign-in')}>
            Back to sign in
          </button>
        </div>
      ) : (
        <form id={panelId} role="tabpanel" className={styles.form} onSubmit={submit}>
          <p className={styles.text}>
            {signingUp
              ? 'Pick an email and a password to keep your tastings on every device.'
              : 'Welcome back. Your tastings are waiting.'}
          </p>
          {linkError && status.kind === 'idle' && (
            <p className={styles.error} role="alert">
              {linkError}
            </p>
          )}
          <label htmlFor={emailId} className={styles.label}>
            Email
          </label>
          <input
            id={emailId}
            className={styles.input}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <label htmlFor={passwordId} className={styles.label}>
            Password
          </label>
          <input
            id={passwordId}
            className={styles.input}
            type="password"
            autoComplete={signingUp ? 'new-password' : 'current-password'}
            required
            minLength={signingUp ? MIN_PASSWORD : undefined}
            aria-describedby={signingUp ? `${passwordId}-hint` : undefined}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {signingUp && (
            <p id={`${passwordId}-hint`} className={styles.hint}>
              At least {MIN_PASSWORD} characters.
            </p>
          )}
          {status.kind === 'error' && (
            <p className={styles.error} role="alert">
              {status.message}
            </p>
          )}
          <button type="submit" className={buttonClass('primary')} disabled={status.kind === 'busy'}>
            {status.kind === 'busy' ? 'One moment…' : signingUp ? 'Create account' : 'Sign in'}
          </button>
        </form>
      )}
    </div>
  );
}
