import { lazy, Suspense, useId, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useReducedMotion } from 'motion/react';
import type { Can } from '../../types/can';
import type { TastingEntry } from '../../types/tasting';
import { cans, findCan } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import { compareFacts } from '../../lib/compare';
import { getLines } from '../../lib/filters';
import { formatFact } from '../../lib/format';
import { CanTags } from '../../components/CanTags/CanTags';
import { CanVisual } from '../../components/CanVisual/CanVisual';
import { StarRating } from '../../components/StarRating/StarRating';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { buttonClass } from '../../components/Button/buttonClass';
import { hasWebGL } from '../../three/webgl';
import styles from './ComparePage.module.css';

// The catalog's 3D code: one canvas, a spinning View per can
const threeModule = () =>
  Promise.all([
    import('../../three/CatalogCans'),
    document.fonts.load('500 34px "JetBrains Mono"').catch(() => []),
  ]).then(([module]) => module);
const CanView = lazy(() => threeModule().then((module) => ({ default: module.CanView })));
const CatalogCanvas = lazy(() => threeModule().then((module) => ({ default: module.CatalogCanvas })));

const lines = getLines(cans);

/** 31.7123 → 31.7: per-100 ml figures are worked out, so they get one decimal. */
function round(value: number | undefined): number | undefined {
  return value === undefined ? undefined : Math.round(value * 10) / 10;
}

interface CanPickerProps {
  label: string;
  can: Can | undefined;
  entry: TastingEntry | undefined;
  onPick: (id: string) => void;
  show3d: boolean;
  reducedMotion: boolean;
}

function CanPicker({ label, can, entry, onPick, show3d, reducedMotion }: CanPickerProps) {
  const selectId = useId();
  const glowStyle = can ? ({ '--glow': can.flavorColor } as CSSProperties) : undefined;

  return (
    <section className={styles.slot} aria-label={label}>
      <label htmlFor={selectId} className={styles.pickLabel}>
        {label}
      </label>
      <select
        id={selectId}
        className={styles.select}
        value={can?.id ?? ''}
        onChange={(event) => onPick(event.target.value)}
      >
        <option value="">Choose a can</option>
        {lines.map((line) => (
          <optgroup key={line} label={line}>
            {cans
              .filter((item) => item.line === line)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>

      <div className={styles.visual} style={glowStyle}>
        {can ? (
          show3d ? (
            <Suspense fallback={<CanVisual can={can} size="md" />}>
              <CanView can={can} reducedMotion={reducedMotion} className={styles.view} />
            </Suspense>
          ) : (
            <CanVisual can={can} size="md" />
          )
        ) : (
          <p className={styles.emptySlot}>No can yet</p>
        )}
      </div>

      {can && (
        <div className={styles.about}>
          <Link to={`/can/${can.id}`} className={styles.name}>
            {can.name}
          </Link>
          <p className={styles.line}>{can.line}</p>
          <CanTags can={can} />
          <StarRating value={entry?.rating ?? null} />
          <p className={styles.tried}>{entry?.tried ? 'Tried' : 'Not tried yet'}</p>
        </div>
      )}
    </section>
  );
}

export function ComparePage() {
  const { data } = useUserData();
  const [params, setParams] = useSearchParams();
  const reducedMotion = useReducedMotion() ?? false;
  const [webgl] = useState(hasWebGL);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const show3d = webgl && !canvasFailed;
  const a = findCan(params.get('a') ?? undefined);
  const b = findCan(params.get('b') ?? undefined);

  function pick(side: 'a' | 'b', id: string) {
    const next = new URLSearchParams(params);
    if (id === '') {
      next.delete(side);
    } else {
      next.set(side, id);
    }
    setParams(next, { replace: true, preventScrollReset: true });
  }

  function swap() {
    const next = new URLSearchParams();
    if (b) next.set('a', b.id);
    if (a) next.set('b', a.id);
    setParams(next, { replace: true, preventScrollReset: true });
  }

  const rows = a && b ? compareFacts(a, b) : [];
  // Numbers from an EU and a US page describe different recipes and can sizes
  const mixedBasis = a?.factsRegion !== undefined && b?.factsRegion !== undefined && a.factsRegion !== b.factsRegion;

  return (
    <div className={styles.page}>
      <title>Compare | NRGASM</title>

      <header className={styles.header}>
        <h1 className={styles.title}>Compare</h1>
        <button type="button" className={buttonClass('secondary')} onClick={swap} disabled={!a && !b}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round" aria-hidden="true" className={styles.swapIcon}>
            <path d="M7 4l-4 4 4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
          </svg>
          Swap
        </button>
      </header>

      <div className={styles.slots}>
        <CanPicker label="First can" can={a} entry={a && data[a.id]} onPick={(id) => pick('a', id)}
          show3d={show3d} reducedMotion={reducedMotion} />
        <CanPicker label="Second can" can={b} entry={b && data[b.id]} onPick={(id) => pick('b', id)}
          show3d={show3d} reducedMotion={reducedMotion} />
      </div>

      {a && b ? (
        <section className={styles.panel}>
          <table className={styles.table}>
            <caption className="visually-hidden">
              {a.name} and {b.name} side by side
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.factHead}>Per can</th>
                <th scope="col">{a.name}</th>
                <th scope="col">{b.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row" className={styles.factLabel}>{row.label}</th>
                  {(['a', 'b'] as const).map((side) => (
                    <td key={side} className={row.larger === side ? styles.more : undefined}>
                      {formatFact(round(row[side]), row.unit)}
                      {row.larger === side && <span className="visually-hidden"> (more)</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {mixedBasis && (
            <p className={styles.note}>
              Figures for {a.name} describe the {a.factsRegion} can and for {b.name} the {b.factsRegion} can.
              Recipes and sizes differ by region.
            </p>
          )}
        </section>
      ) : (
        <p className={styles.hint}>Pick two cans to see their caffeine, sugar, and your ratings side by side.</p>
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
