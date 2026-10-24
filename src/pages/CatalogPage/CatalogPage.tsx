import { lazy, Suspense, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cans } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import {
  DEFAULT_FILTERS,
  filterCans,
  filtersFromParams,
  filtersToParams,
  getLines,
  sortCans,
  type CatalogFilters,
} from '../../lib/filters';
import { pickSurprise } from '../../lib/surprise';
import { CanCard } from '../../components/CanCard/CanCard';
import { FilterBar } from '../../components/FilterBar/FilterBar';
import { buttonClass } from '../../components/Button/buttonClass';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { hasWebGL } from '../../three/webgl';
import styles from './CatalogPage.module.css';

// One canvas draws every card's spinning can (see three/CatalogCans)
const CatalogCanvas = lazy(() =>
  import('../../three/CatalogCans').then((module) => ({ default: module.CatalogCanvas })),
);

const lines = getLines(cans);
const ease = [0.22, 1, 0.36, 1] as const; // --ease-out

export function CatalogPage() {
  const { data, updateEntry } = useUserData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const reducedMotion = useReducedMotion() ?? false;
  const [webgl] = useState(hasWebGL);
  const [canvasFailed, setCanvasFailed] = useState(false);
  // Without WebGL, or if the canvas breaks, the cards fall back to flat cans
  const show3d = webgl && !canvasFailed;
  const filters = filtersFromParams(params);
  const results = sortCans(filterCans(cans, data, filters), data, filters.sort);

  function setFilters(next: CatalogFilters) {
    // Typing should not flood the history with one entry per letter.
    setParams(filtersToParams(next), { replace: true, preventScrollReset: true });
  }

  function surprise() {
    const can = pickSurprise(cans, data, Math.random);
    if (can) {
      navigate(`/can/${can.id}`, { viewTransition: true });
    }
  }

  return (
    <div className={styles.page}>
      <title>Catalog | NRGASM</title>

      <header className={styles.header}>
        <h1 className={styles.title}>Catalog</h1>
        <div className={styles.headerSide}>
          <p className={styles.count} aria-live="polite">
            {results.length === cans.length
              ? `${cans.length} cans`
              : `${results.length} of ${cans.length} cans`}
          </p>
          <button type="button" className={buttonClass('secondary')} onClick={surprise}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              strokeLinejoin="round" aria-hidden="true" className={styles.surpriseIcon}>
              <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.2" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1.2" fill="currentColor" />
              <circle cx="12" cy="12" r="1.2" fill="currentColor" />
            </svg>
            Surprise me
          </button>
        </div>
      </header>

      <FilterBar
        filters={filters}
        lines={lines}
        resultCount={results.length}
        onChange={setFilters}
        onReset={() => setFilters({ ...DEFAULT_FILTERS, sort: filters.sort })}
      />

      {results.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No cans match these filters</p>
          <p className={styles.emptyText}>Try a shorter search, or clear the filters to see the whole catalog.</p>
          <button type="button" className={`${buttonClass('primary')} ${styles.emptyButton}`} onClick={() => setFilters(DEFAULT_FILTERS)}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {results.map((can, index) => (
              <motion.li
                key={can.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease, delay: Math.min(index, 8) * 0.03 } }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                transition={{ layout: { duration: 0.25, ease } }}
              >
                <CanCard
                  can={can}
                  entry={data[can.id]}
                  onChange={(patch) => updateEntry(can.id, patch)}
                  show3d={show3d}
                  reducedMotion={reducedMotion}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {show3d && (
        <ErrorBoundary fallback={null} onError={() => setCanvasFailed(true)}>
          <Suspense fallback={null}>
            <CatalogCanvas />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
