import { lazy, Suspense, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { cans, findCan } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import { getLines } from '../../lib/filters';
import type { Can, CanId } from '../../types/can';
import { buttonClass } from '../../components/Button/buttonClass';
import { CanVisual } from '../../components/CanVisual/CanVisual';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { hasWebGL } from '../../three/webgl';
import styles from './HomePage.module.css';

// The 3D code (three.js and friends) is large, so it is loaded only here,
// and only after the label font is ready to be drawn on the textures.
const CanScene = lazy(() =>
  Promise.all([
    import('../../three/CanScene'),
    document.fonts.load('500 34px "JetBrains Mono"').catch(() => []),
  ]).then(([module]) => module),
);

const FEATURED_IDS = ['monster-energy', 'mango-loco', 'pipeline-punch', 'ultra-violet', 'khaotic', 'zero-ultra'];
const featured = FEATURED_IDS.map(findCan).filter((can): can is Can => can !== undefined);
const lines = getLines(cans);
const ease = [0.22, 1, 0.36, 1] as const;

/** Static stand-in while the 3D scene loads, or when WebGL is missing. */
function StaticCans() {
  return (
    <div className={styles.static}>
      {featured.slice(0, 3).map((can) => (
        <CanVisual key={can.id} can={can} size="md" />
      ))}
    </div>
  );
}

export function HomePage() {
  const { data } = useUserData();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion() ?? false;
  const [webgl] = useState(hasWebGL);
  const [paused, setPaused] = useState(false);
  const [activeId, setActiveId] = useState<CanId | null>(null);

  const triedCount = cans.filter((can) => data[can.id]?.tried).length;

  // One orchestrated entrance: the headline, then the rest
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reducedMotion ? 0 : 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease, delay: reducedMotion ? 0 : delay },
  });

  return (
    <div className={styles.page}>
      <title>NRGASM | Monster Energy tasting catalog</title>

      <section className={styles.hero}>
        <div className={styles.copy}>
          <motion.h1 className={styles.title} {...rise(0)}>
            Every can you have tried, rated and remembered
          </motion.h1>
          <motion.p className={styles.lead} {...rise(0.12)}>
            A personal catalog of Monster Energy cans. Mark what you have tasted, give it stars, and keep notes you can
            come back to.
          </motion.p>
          <motion.div className={styles.actions} {...rise(0.2)}>
            <Link to="/catalog" className={buttonClass('primary')} viewTransition>
              Browse the catalog
            </Link>
            <Link to="/stats" className={buttonClass('secondary')} viewTransition>
              See your stats
            </Link>
          </motion.div>
          <motion.p className={styles.progress} {...rise(0.28)}>
            {triedCount > 0
              ? `${triedCount} of ${cans.length} cans tried so far`
              : `${cans.length} cans in the catalog, none tried yet`}
          </motion.p>
        </div>

        <motion.div
          className={styles.stage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: reducedMotion ? 0 : 0.1 }}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className={styles.canvas}>
            {webgl ? (
              <ErrorBoundary fallback={<StaticCans />}>
                <Suspense fallback={<StaticCans />}>
                  <CanScene
                    cans={featured}
                    paused={paused}
                    activeId={activeId}
                    reducedMotion={reducedMotion}
                    onSelect={(id) => navigate(`/can/${id}`, { viewTransition: true })}
                    onHover={setActiveId}
                  />
                </Suspense>
              </ErrorBoundary>
            ) : (
              <StaticCans />
            )}
          </div>

          <ul className={styles.featured} aria-label="Featured cans">
            {featured.map((can) => (
              <li key={can.id}>
                <Link
                  to={`/can/${can.id}`}
                  className={`${styles.featuredLink} ${activeId === can.id ? styles.featuredActive : ''}`}
                  onPointerEnter={() => setActiveId(can.id)}
                  onPointerLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(can.id)}
                  onBlur={() => setActiveId(null)}
                  viewTransition
                >
                  {can.name}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      <section className={styles.lines} aria-labelledby="lines-heading">
        <h2 id="lines-heading" className={styles.linesHeading}>
          Browse by line
        </h2>
        <ul className={styles.lineList}>
          {lines.map((line) => {
            const inLine = cans.filter((can) => can.line === line);
            const tried = inLine.filter((can) => data[can.id]?.tried).length;
            return (
              <li key={line}>
                <Link to={`/catalog?line=${encodeURIComponent(line)}`} className={styles.lineLink} viewTransition>
                  <span className={styles.lineName}>{line}</span>
                  <span className={styles.lineCount}>
                    {tried} / {inLine.length} tried
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
