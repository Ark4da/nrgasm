import { lazy, Suspense, useRef } from 'react';
import type { Can } from '../../types/can';
import { useNearViewport } from '../../hooks/useNearViewport';
import { CanVisual } from '../CanVisual/CanVisual';
import styles from './MiniCan.module.css';

// The catalog's 3D code: one canvas per page, a View per can
const CanView = lazy(() =>
  Promise.all([
    import('../../three/CatalogCans'),
    document.fonts.load('500 34px "JetBrains Mono"').catch(() => []),
  ]).then(([module]) => ({ default: module.CanView })),
);

export interface MiniCanProps {
  can: Can;
  /** Draw the can in 3D. Needs a CatalogCanvas mounted on the page. */
  show3d: boolean;
  reducedMotion: boolean;
}

/** A small spinning 3D can for lists; the flat front of its skin while far away, loading, or without WebGL. */
export function MiniCan({ can, show3d, reducedMotion }: MiniCanProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const near = useNearViewport(ref);
  const flat = <CanVisual can={can} size="xs" labelFront />;

  return (
    <span className={styles.can} ref={ref}>
      {show3d && near ? (
        <Suspense fallback={flat}>
          <CanView can={can} reducedMotion={reducedMotion} className={styles.view} />
        </Suspense>
      ) : (
        flat
      )}
    </span>
  );
}
