import { lazy, Suspense, useId, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router';
import { useReducedMotion } from 'motion/react';
import type { Can } from '../../types/can';
import { cans, catalogNumber, findCan } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import { formatDateTime, formatFact, formatFactsBasis } from '../../lib/format';
import { CanTags } from '../../components/CanTags/CanTags';
import { CanVisual } from '../../components/CanVisual/CanVisual';
import { StarRating } from '../../components/StarRating/StarRating';
import { TriedToggle } from '../../components/TriedToggle/TriedToggle';
import { WantToggle } from '../../components/WantToggle/WantToggle';
import { ErrorBoundary } from '../../components/ErrorBoundary/ErrorBoundary';
import { NOTE_TAGS, hasNoteTag, toggleNoteTag } from '../../lib/noteTags';
import { hasWebGL } from '../../three/webgl';
import { NotFoundPage } from '../NotFoundPage/NotFoundPage';
import styles from './CanPage.module.css';

const NOTE_LIMIT = 2000;

// The same 3D code as the catalog: one canvas, and a View the visitor can turn.
// It loads only after the label font is ready to be drawn on the texture.
const threeModule = () =>
  Promise.all([
    import('../../three/CatalogCans'),
    document.fonts.load('500 34px "JetBrains Mono"').catch(() => []),
  ]).then(([module]) => module);
const CanView = lazy(() => threeModule().then((module) => ({ default: module.CanView })));
const CatalogCanvas = lazy(() => threeModule().then((module) => ({ default: module.CatalogCanvas })));

export function CanPage() {
  const { id } = useParams();
  const can = findCan(id);

  if (!can) {
    return <NotFoundPage title="Can not found" message={`There is no can called "${id ?? ''}" in the catalog.`} />;
  }
  // `key` gives every can a fresh component, so the note draft resets on navigation.
  return <CanDetails key={can.id} can={can} />;
}

function neighbours(can: Can): { previous?: Can; next?: Can } {
  const index = cans.indexOf(can);
  return { previous: cans[index - 1], next: cans[index + 1] };
}

function CanDetails({ can }: { can: Can }) {
  const { data, updateEntry } = useUserData();
  const entry = data[can.id];
  const noteId = useId();
  // A local draft: storage drops blank entries, which would otherwise eat a leading space.
  const [draft, setDraft] = useState(entry?.note ?? '');
  const { previous, next } = neighbours(can);
  const transitionName = { viewTransitionName: `can-${can.id}` } as CSSProperties;
  const factsBasis = formatFactsBasis(can);
  // The glow behind the can takes the can's own color
  const glowStyle = { '--glow': can.flavorColor } as CSSProperties;
  const tried = entry?.tried ?? false;
  const reducedMotion = useReducedMotion() ?? false;
  const [webgl] = useState(hasWebGL);
  const [canvasFailed, setCanvasFailed] = useState(false);
  const show3d = webgl && !canvasFailed;
  const flat = (
    <div className={styles.can} style={transitionName}>
      <CanVisual can={can} size="lg" />
    </div>
  );

  function changeNote(note: string) {
    setDraft(note);
    updateEntry(can.id, { note });
  }

  return (
    <article className={styles.page}>
      <title>{`${can.name} | NRGASM`}</title>

      <Link to="/catalog" className={styles.back} viewTransition>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          strokeLinejoin="round" aria-hidden="true" className={styles.backIcon}>
          <path d="M15 5l-7 7 7 7" />
        </svg>
        Catalog
      </Link>

      <div className={styles.layout}>
        <div className={styles.visual} style={glowStyle}>
          {show3d ? (
            <Suspense fallback={flat}>
              <CanView can={can} reducedMotion={reducedMotion} interactive className={styles.view} style={transitionName} />
            </Suspense>
          ) : flat}
          {show3d && <p className={styles.dragHint} aria-hidden="true">Drag to turn</p>}
        </div>

        <div className={styles.info}>
          <div className={styles.meta}>
            <Link className={styles.line} to={`/catalog?line=${encodeURIComponent(can.line)}`}>
              {can.line}
            </Link>
            <span className={styles.number}>{catalogNumber(can)}</span>
          </div>

          <div className={styles.heading}>
            <h1 className={styles.name}>{can.name}</h1>
            {can.flavor && <p className={styles.flavor}>{can.flavor}</p>}
            <CanTags can={can} />
          </div>

          <section className={styles.tasting} aria-label="Your tasting">
            <TriedToggle tried={tried} onChange={(value) => updateEntry(can.id, { tried: value })} />
            {!tried && (
              <WantToggle
                wanted={entry?.wantToTry ?? false}
                onChange={(wantToTry) => updateEntry(can.id, { wantToTry })}
              />
            )}
            <StarRating value={entry?.rating ?? null} onChange={(rating) => updateEntry(can.id, { rating })} />
            <Link to={`/compare?a=${can.id}`} className={styles.compare}>
              Compare
            </Link>
          </section>

          <section className={styles.factsBlock} aria-label="Nutrition facts">
            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>Caffeine</dt>
                <dd className={styles.factValue}>{formatFact(can.caffeineMg, 'mg')}</dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>Sugar</dt>
                <dd className={styles.factValue}>{formatFact(can.sugarG, 'g')}</dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>Calories</dt>
                <dd className={styles.factValue}>{formatFact(can.caloriesKcal, 'kcal')}</dd>
              </div>
              <div className={styles.fact}>
                <dt className={styles.factLabel}>Volume</dt>
                <dd className={styles.factValue}>{formatFact(can.volumeMl, 'ml')}</dd>
              </div>
            </dl>
            {factsBasis && (
              <p className={styles.factsNote}>
                {factsBasis}
                {can.source && (
                  <>
                    {' · '}
                    <a href={can.source} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  </>
                )}
              </p>
            )}
          </section>

          <div className={styles.notes}>
            <label htmlFor={noteId} className={styles.notesLabel}>
              Tasting notes
            </label>
            <textarea
              id={noteId}
              className={styles.textarea}
              value={draft}
              maxLength={NOTE_LIMIT}
              rows={6}
              placeholder="How did it taste? Sweet, sour, flat, would buy again…"
              onChange={(event) => changeNote(event.target.value)}
            />
            {/* One tap adds a #tag to the note; a second tap removes it */}
            <div className={styles.tags} role="group" aria-label="Quick tags">
              {NOTE_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  className={styles.tag}
                  aria-pressed={hasNoteTag(draft, tag.id)}
                  onClick={() => changeNote(toggleNoteTag(draft, tag.id))}
                >
                  {tag.label}
                </button>
              ))}
            </div>
            <p className={styles.saved}>
              {entry ? `Saved ${formatDateTime(entry.updatedAt)}` : 'Notes save as you type'}
              <span>
                {draft.length} / {NOTE_LIMIT}
              </span>
            </p>
          </div>
        </div>
      </div>

      {show3d && (
        <ErrorBoundary fallback={null} onError={() => setCanvasFailed(true)}>
          <Suspense fallback={null}>
            <CatalogCanvas />
          </Suspense>
        </ErrorBoundary>
      )}

      <nav className={styles.pager} aria-label="Other cans">
        {previous ? (
          <Link to={`/can/${previous.id}`} className={styles.pagerLink} viewTransition>
            <span className={styles.pagerHint}>Previous</span>
            {previous.name}
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/can/${next.id}`} className={`${styles.pagerLink} ${styles.pagerNext}`} viewTransition>
            <span className={styles.pagerHint}>Next</span>
            {next.name}
          </Link>
        )}
      </nav>
    </article>
  );
}
