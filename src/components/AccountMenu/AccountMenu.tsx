import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/auth';
import styles from './AccountMenu.module.css';

/** A person; on narrow screens it stands in for the "Sign in" / "Sign out" words. */
function PersonIcon() {
  return (
    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  );
}

/** The header's account corner: "Sign in" for guests, the email and "Sign out" when signed in. */
export function AccountMenu() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return null;
  }
  if (auth.status === 'guest') {
    return (
      <Link to="/sign-in" className={styles.link} viewTransition>
        <PersonIcon />
        <span className={styles.label}>Sign in</span>
      </Link>
    );
  }
  return (
    <div className={styles.menu}>
      <span className={styles.email} title={auth.user.email}>
        {auth.user.email}
      </span>
      <button type="button" className={styles.link} onClick={() => void signOut()}>
        <PersonIcon />
        <span className={styles.label}>Sign out</span>
      </button>
    </div>
  );
}
