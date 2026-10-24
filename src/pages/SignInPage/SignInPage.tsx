import { useId, useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { sendSignInLink } from '../../services/auth';
import { buttonClass } from '../../components/Button/buttonClass';
import styles from './SignInPage.module.css';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent'; email: string } | { kind: 'error'; message: string };

/** A failed link sends the visitor here with the reason (see Layout). */
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
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const linkError = errorFromState(location.state);

  if (auth.status === 'signed-in') {
    return <Navigate to="/catalog" replace />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ kind: 'sending' });
    const result = await sendSignInLink(email.trim(), `${window.location.origin}/catalog`);
    setStatus(result.ok ? { kind: 'sent', email: email.trim() } : { kind: 'error', message: result.message });
  }

  return (
    <div className={styles.page}>
      <title>Sign in | NRGASM</title>
      <h1 className={styles.title}>Sign in</h1>

      {status.kind === 'sent' ? (
        <div className={styles.sent} role="status">
          <p className={styles.lead}>Check your inbox.</p>
          <p className={styles.text}>
            We sent a sign-in link to <strong>{status.email}</strong>. Open the link in this browser — it works for 5
            minutes.
          </p>
          <button type="button" className={buttonClass('ghost')} onClick={() => setStatus({ kind: 'idle' })}>
            Use another email
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={submit}>
          <p className={styles.text}>
            Enter your email and we will send you a link. No password needed: the link signs you in.
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
          {status.kind === 'error' && (
            <p className={styles.error} role="alert">
              {status.message}
            </p>
          )}
          <button type="submit" className={buttonClass('primary')} disabled={status.kind === 'sending'}>
            {status.kind === 'sending' ? 'Sending…' : 'Send link'}
          </button>
        </form>
      )}
    </div>
  );
}
