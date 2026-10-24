import { useEffect } from 'react';
import { NavLink, Outlet, ScrollRestoration, useNavigate } from 'react-router';
import { cans } from '../../data/cans';
import { useAuth } from '../../hooks/useAuth';
import { useUserData } from '../../hooks/useUserData';
import { authErrorFromUrl, unusedSignInCode } from '../../lib/authUrl';
import { AccountMenu } from '../AccountMenu/AccountMenu';
import { SignInPrompt } from '../SignInPrompt/SignInPrompt';
import { MoveDataPrompt } from '../MoveDataPrompt/MoveDataPrompt';
import styles from './Layout.module.css';

function navClass({ isActive }: { isActive: boolean }): string {
  return `${styles.navLink} ${isActive ? styles.active : ''}`;
}

export function Layout() {
  const { data, notice, dismissNotice, signInPrompt, closeSignInPrompt, legacyCount, moveLegacy, skipLegacy } =
    useUserData();
  const auth = useAuth();
  const navigate = useNavigate();
  const triedCount = cans.filter((can) => data[can.id]?.tried).length;

  // A sign-in link that failed (expired, used twice) lands on whatever page it
  // pointed at, with the reason in the address: show it on the sign-in page.
  useEffect(() => {
    const authError = authErrorFromUrl(window.location.href);
    if (authError) {
      navigate('/sign-in', { replace: true, state: { authError } });
    }
  }, [navigate]);

  // A link opened in another browser (or past its 5 minutes) gives no error,
  // only a code left in the address of someone who is still a guest.
  useEffect(() => {
    if (auth.status !== 'guest') return;
    const authError = unusedSignInCode(window.location.href);
    if (authError) {
      navigate('/sign-in', { replace: true, state: { authError } });
    }
  }, [auth.status, navigate]);

  return (
    <div className={styles.shell}>
      <a className={styles.skip} href="#main">
        Skip to content
      </a>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink to="/" className={styles.wordmark} viewTransition>
            NRGASM
          </NavLink>
          <nav aria-label="Main" className={styles.nav}>
            <NavLink to="/catalog" className={navClass} viewTransition>
              Catalog
            </NavLink>
            <NavLink to="/compare" className={navClass} viewTransition>
              Compare
            </NavLink>
            <NavLink to="/stats" className={navClass} viewTransition>
              Stats
            </NavLink>
          </nav>
          <div className={styles.account}>
            {auth.status === 'signed-in' && (
              <p className={styles.counter}>
                <span className={styles.counterValue}>{triedCount}</span>
                <span aria-hidden="true">/</span>
                <span className="visually-hidden">of</span>
                {cans.length} tried
              </p>
            )}
            <AccountMenu />
          </div>
        </div>
      </header>

      {notice && (
        <div className={styles.notice} role="alert">
          <p>{notice}</p>
          <button type="button" className={styles.noticeClose} onClick={dismissNotice}>
            Dismiss
          </button>
        </div>
      )}

      <main id="main" className={styles.main}>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <p>Sign in to keep your tastings on every device. You can export them from Stats at any time.</p>
        <p>A fan project. Not affiliated with Monster Energy.</p>
      </footer>

      <SignInPrompt open={signInPrompt} onClose={closeSignInPrompt} />
      <MoveDataPrompt count={legacyCount} onMove={() => void moveLegacy()} onSkip={skipLegacy} />
      <ScrollRestoration />
    </div>
  );
}
