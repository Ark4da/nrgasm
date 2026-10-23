import { useId, useState, type CSSProperties } from 'react';
import { Link, useParams } from 'react-router';
import type { Can } from '../../types/can';
import { cans, catalogNumber, findCan } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import { formatDateTime, formatFact, formatFactsBasis } from '../../lib/format';
import { CanTags } from '../../components/CanTags/CanTags';
import { CanVisual } from '../../components/CanVisual/CanVisual';
import { StarRating } from '../../components/StarRating/StarRating';
import { TriedToggle } from '../../components/TriedToggle/TriedToggle';
import { NotFoundPage } from '../NotFoundPage/NotFoundPage';
import styles from './CanPage.module.css';

const NOTE_LIMIT = 2000;

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
        <div className={styles.visual}>
          <div className={styles.can} style={transitionName}>
            <CanVisual can={can} size="lg" />
          </div>
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
            <TriedToggle tried={entry?.tried ?? false} onChange={(tried) => updateEntry(can.id, { tried })} />
            <StarRating value={entry?.rating ?? null} onChange={(rating) => updateEntry(can.id, { rating })} />
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
            <p className={styles.saved}>
              {entry ? `Saved ${formatDateTime(entry.updatedAt)}` : 'Notes save as you type'}
              <span>
                {draft.length} / {NOTE_LIMIT}
              </span>
            </p>
          </div>
        </div>
      </div>

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
