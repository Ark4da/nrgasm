import { lazy, Suspense, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { useReducedMotion } from 'motion/react';
import type { Can } from '../../types/can';
import { cans } from '../../data/cans';
import { useCommunityRatings, useCommunityRatingsStatus } from '../../hooks/useCommunityRatings';
import { useNearViewport } from '../../hooks/useNearViewport';
import { describeCommunityRating, rankCans } from '../../lib/ratings';
import { hasWebGL } from '../../three/webgl';
import { buttonClass } from '../../components/Button/buttonClass';
import { CanVisual } from '../../components/CanVisual/CanVisual';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import styles from './RatingsPage.module.css';

// The catalog's 3D code: one canvas, a View per can, here standing still
const threeModule = () =>
  Promise.all([
    import('../../three/CatalogCans'),
    document.fonts.load('500 34px "JetBrains Mono"').catch(() => []),
  ]).then(([module]) => module);
const CanView = lazy(() => threeModule().then((module) => ({ default: module.CanView })));
const CatalogCanvas = lazy(() => threeModule().then((module) => ({ default: module.CatalogCanvas })));

/** The average's share of five stars goes into CSS as a 0–1 custom property. */
function fill(average: number): CSSProperties {
  return { '--fill': average / 5 } as CSSProperties;
}

interface ChartCanProps {
  can: Can;
  show3d: boolean;
  reducedMotion: boolean;
}

/** A still 3D can, logo to the front; the flat front of its skin while far away, loading, or without WebGL. */
function ChartCan({ can, show3d, reducedMotion }: ChartCanProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(ref);
  const flat = <CanVisual can={can} size="xs" labelFront />;

  return (
    <span className={styles.can} ref={ref}>
      {show3d && near ? (
        <Suspense fallback={flat}>
          <CanView can={can} reducedMotion={reducedMotion} still className={styles.view} />
        </Suspense>
      ) : (
        flat
      )}
    </span>
  );
}

export function RatingsPage() {
  const status = useCommunityRatingsStatus();
  const ranked = rankCans(cans, useCommunityRatings());
  const reducedMotion = useReducedMotion() ?? false;
  const [webgl] = useState(hasWebGL);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const show3d = webgl && !canvasFailed;

  return (
    <div className={styles.page}>
      <title>Ratings | NRGASM</title>
      <header className={styles.intro}>
        <h1 className={styles.title}>Ratings</h1>
        <p className={styles.lead}>
          How everyone rates each can. A can rated by only a few people is pulled towards the overall average, so a
          single 5-star vote does not top the chart.
        </p>
      </header>

      {status === 'loading' && (
        <p className={styles.muted} role="status">
          Loading ratings…
        </p>
      )}

      {status === 'failed' && (
        <section className={styles.empty} role="alert">
          <h2 className={styles.heading}>Ratings did not load</h2>
          <p className={styles.emptyText}>Check your connection and reload the page.</p>
        </section>
      )}

      {status === 'ready' && ranked.length === 0 && (
        <section className={styles.empty}>
          <h2 className={styles.heading}>No ratings yet</h2>
          <p className={styles.emptyText}>Rate a can you have tried, and the chart starts here.</p>
          <Link to="/catalog" className={buttonClass('primary')}>
            Open the catalog
          </Link>
        </section>
      )}

      {ranked.length > 0 && (
        <ol className={styles.chart}>
          {ranked.map(({ can, rating }, index) => (
            <li key={can.id}>
              <Link to={`/can/${can.id}`} className={styles.row} viewTransition>
                <span className={`${styles.rank} ${index < 3 ? styles.podium : ''}`}>{index + 1}</span>
                <ChartCan can={can} show3d={show3d} reducedMotion={reducedMotion} />
                <span className={styles.name}>
                  <span className={styles.canName}>{can.name}</span>
                  <span className={styles.line}>{can.line}</span>
                </span>
                <span className={styles.score}>
                  <span className={styles.bar} style={fill(rating.average)} aria-hidden="true" />
                  <span className={styles.average} aria-hidden="true">
                    ★ {rating.average.toFixed(1)}
                  </span>
                  <span className={styles.count} aria-hidden="true">
                    {rating.count} {rating.count === 1 ? 'rating' : 'ratings'}
                  </span>
                  <span className="visually-hidden">{describeCommunityRating(rating)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

      {show3d && ranked.length > 0 && (
        <ErrorBoundary fallback={null} onError={() => setCanvasFailed(true)}>
          <Suspense fallback={null}>
            <CatalogCanvas />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
