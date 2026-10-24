import { NavLink, Outlet, ScrollRestoration } from 'react-router';
import { cans } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import styles from './Layout.module.css';

function navClass({ isActive }: { isActive: boolean }): string {
  return `${styles.navLink} ${isActive ? styles.active : ''}`;
}

export function Layout() {
  const { data, notice, dismissNotice } = useUserData();
  const triedCount = cans.filter((can) => data[can.id]?.tried).length;

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
          <p className={styles.counter}>
            <span className={styles.counterValue}>{triedCount}</span>
            <span aria-hidden="true">/</span>
            <span className="visually-hidden">of</span>
            {cans.length} tried
          </p>
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
        <p>Your tastings are saved in this browser only. Export them from Stats to keep a copy.</p>
        <p>A fan project. Not affiliated with Monster Energy.</p>
      </footer>

      <ScrollRestoration />
    </div>
  );
}
