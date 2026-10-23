import { lazy, Suspense, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { cans } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import {
  DEFAULT_FILTERS,
  filterCans,
  filtersFromParams,
  filtersToParams,
  getLines,
  type CatalogFilters,
} from '../../lib/filters';
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
  const [params, setParams] = useSearchParams();
  const reducedMotion = useReducedMotion() ?? false;
  const [webgl] = useState(hasWebGL);
  const [canvasFailed, setCanvasFailed] = useState(false);
  // Without WebGL, or if the canvas breaks, the cards fall back to flat cans
  const show3d = webgl && !canvasFailed;
  const filters = filtersFromParams(params);
  const results = filterCans(cans, data, filters);

  function setFilters(next: CatalogFilters) {
    // Typing should not flood the history with one entry per letter.
    setParams(filtersToParams(next), { replace: true, preventScrollReset: true });
  }

  return (
    <div className={styles.page}>
      <title>Catalog | NRGASM</title>

      <header className={styles.header}>
        <h1 className={styles.title}>Catalog</h1>
        <p className={styles.count} aria-live="polite">
          {results.length === cans.length
            ? `${cans.length} cans`
            : `${results.length} of ${cans.length} cans`}
        </p>
      </header>

      <FilterBar
        filters={filters}
        lines={lines}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_FILTERS)}
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
                  onTriedChange={(tried) => updateEntry(can.id, { tried })}
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
