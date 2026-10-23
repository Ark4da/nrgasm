import { lazy, Suspense, useRef, type CSSProperties } from 'react';
import { Link } from 'react-router';
import type { Can } from '../../types/can';
import type { TastingEntry } from '../../types/tasting';
import { catalogNumber } from '../../data/cans';
import { formatFact } from '../../lib/format';
import { StarRating } from '../StarRating/StarRating';
import { CanVisual } from '../CanVisual/CanVisual';
import { TriedToggle } from '../TriedToggle/TriedToggle';
import { CanTags } from '../CanTags/CanTags';
import { useNearViewport } from '../../hooks/useNearViewport';
import styles from './CanCard.module.css';

// The 3D code is large: it loads only when a page asks for spinning cans,
// and only after the label font is ready to be drawn on the textures.
const CanView = lazy(() =>
    Promise.all([
        import('../../three/CatalogCans'),
        document.fonts.load('500 34px "JetBrains Mono"').catch(() => []),
    ]).then(([module]) => ({ default: module.CanView })),
);

interface CanCardProps {
    can: Can;
    entry?: TastingEntry;
    onTriedChange: (tried: boolean) => void;
    /** Spin the can in 3D. Needs a CatalogCanvas mounted on the page. */
    show3d?: boolean;
    reducedMotion?: boolean;
}

export function CanCard({ can, entry, onTriedChange, show3d = false, reducedMotion = false }: CanCardProps) {
    // The 3D can (and its textures) exists only near the screen; far cards show the flat can
    const visualRef = useRef<HTMLDivElement>(null);
    const near = useNearViewport(visualRef);
    // Shares a view-transition name with the can page, so the can glides between them
    const transitionStyle = { viewTransitionName: `can-${can.id}` } as CSSProperties;
    const flat = (
        <div className={styles.lift} style={transitionStyle}>
            <CanVisual can={can} size="sm" />
        </div>
    );

    return (
        <article className={`${styles.card} ${entry?.tried ? styles.isTried : ''}`}>
            <div className={styles.visual} ref={visualRef}>
                {show3d && near ? (
                    <Suspense fallback={flat}>
                        <CanView can={can} reducedMotion={reducedMotion} className={styles.view} style={transitionStyle} />
                    </Suspense>
                ) : (
                    flat
                )}
            </div>
            <div className={styles.info}>
                <div className={styles.meta}>
                    <span className={styles.line}>{can.line}</span>
                    <span className={styles.number}>{catalogNumber(can)}</span>
                </div>
                <h2 className={styles.name}>
                    {/* The ::after of this link covers the whole card */}
                    <Link className={styles.link} to={`/can/${can.id}`} viewTransition>
                        {can.name}
                    </Link>
                </h2>
                <CanTags can={can} />
                <StarRating value={entry?.rating ?? null} />
                <dl className={styles.facts}>
                    <div className={styles.fact}>
                        <dt className={styles.factLabel}>Caffeine</dt>
                        <dd className={styles.factValue}>{formatFact(can.caffeineMg, 'mg')}</dd>
                    </div>
                    <div className={styles.fact}>
                        <dt className={styles.factLabel}>Sugar</dt>
                        <dd className={styles.factValue}>{formatFact(can.sugarG, 'g')}</dd>
                    </div>
                </dl>
                {entry?.note && (
                    <p className={styles.note}>{entry.note}</p>
                )}
                <div className={styles.actions}>
                    <TriedToggle tried={entry?.tried ?? false} onChange={onTriedChange} context={can.name} />
                </div>
            </div>
        </article>
    );
}
