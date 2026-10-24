import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { cans } from '../../data/cans';
import { useUserData } from '../../hooks/useUserData';
import { computeStats } from '../../lib/stats';
import { formatAverage } from '../../lib/format';
import type { Rating } from '../../types/tasting';
import { buttonClass } from '../../components/Button/buttonClass';
import { CanVisual } from '../../components/CanVisual/CanVisual';
import { DataTransfer } from '../../components/DataTransfer/DataTransfer';
import { StarRating } from '../../components/StarRating/StarRating';
import styles from './StatsPage.module.css';

const STARS_DESC: Rating[] = [5, 4, 3, 2, 1];

/** A bar's fill goes into CSS as a 0–1 custom property. */
function fill(part: number, whole: number): CSSProperties {
  return { '--fill': whole === 0 ? 0 : part / whole } as CSSProperties;
}

export function StatsPage() {
  const { data } = useUserData();
  const stats = computeStats(cans, data);
  const mostCommon = Math.max(...Object.values(stats.distribution));

  return (
    <div className={styles.page}>
      <title>Stats | NRGASM</title>
      <h1 className={styles.title}>Stats</h1>

      <section className={styles.summary} aria-label="Summary">
        <p className={styles.headline}>
          Tried <span className={styles.big}>{stats.tried}</span> of {stats.total}
        </p>
        <div
          className={styles.progress}
          role="progressbar"
          aria-label="Cans tried"
          aria-valuemin={0}
          aria-valuemax={stats.total}
          aria-valuenow={stats.tried}
          style={fill(stats.tried, stats.total)}
        />
        <dl className={styles.figures}>
          <div className={styles.figure}>
            <dt>Rated</dt>
            <dd>{stats.rated}</dd>
          </div>
          <div className={styles.figure}>
            <dt>Average rating</dt>
            <dd>{formatAverage(stats.averageRating)}</dd>
          </div>
          <div className={styles.figure}>
            <dt>Want to try</dt>
            <dd>
              {stats.wantToTry > 0 ? (
                <Link to="/catalog?tried=want&show=all" className={styles.figureLink}>
                  {stats.wantToTry}
                </Link>
              ) : 0}
            </dd>
          </div>
          <div className={styles.figure}>
            <dt>Still to try</dt>
            <dd>{stats.total - stats.tried}</dd>
          </div>
          <div className={styles.figure}>
            <dt>Caffeine drunk</dt>
            <dd>
              {stats.caffeineMg.toLocaleString('en-GB')} <span className={styles.unit}>mg</span>
            </dd>
            {stats.caffeineKnown < stats.tried && (
              <p className={styles.figureNote}>
                {stats.caffeineKnown} of {stats.tried} tried cans have a known caffeine figure
              </p>
            )}
          </div>
        </dl>
      </section>

      {stats.tried === 0 ? (
        <section className={styles.empty}>
          <h2 className={styles.heading}>Nothing tried yet</h2>
          <p className={styles.emptyText}>
            Open the catalog and mark the first can you have tasted. Ratings and line progress appear here.
          </p>
          <Link to="/catalog" className={buttonClass('primary')}>
            Open the catalog
          </Link>
        </section>
      ) : (
        <div className={styles.columns}>
          <section className={styles.panel}>
            <h2 className={styles.heading}>Top rated</h2>
            {stats.topRated.length === 0 ? (
              <p className={styles.muted}>Rate a can to see your favourites here.</p>
            ) : (
              <ol className={styles.top}>
                {stats.topRated.map(({ can, rating }, index) => (
                  <li key={can.id}>
                    <Link to={`/can/${can.id}`} className={styles.topLink}>
                      <span className={styles.rank}>{index + 1}</span>
                      <CanVisual can={can} size="xs" />
                      <span className={styles.topName}>{can.name}</span>
                      <StarRating value={rating} />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className={styles.panel}>
            <h2 className={styles.heading}>Ratings</h2>
            <ul className={styles.bars}>
              {STARS_DESC.map((star) => (
                <li key={star} className={styles.barRow}>
                  <span className={styles.barLabel}>{star} ★</span>
                  <span className={styles.bar} style={fill(stats.distribution[star], mostCommon)} aria-hidden="true" />
                  <span className={styles.barValue}>
                    {stats.distribution[star]}
                    <span className="visually-hidden"> {stats.distribution[star] === 1 ? 'can' : 'cans'}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${styles.panel} ${styles.wide}`}>
            <h2 className={styles.heading}>By line</h2>
            <p className={styles.barHead} aria-hidden="true">
              <span>Tried</span>
              <span>Avg ★</span>
            </p>
            <ul className={styles.bars}>
              {stats.byLine.map((line) => (
                <li key={line.line} className={styles.barRow}>
                  <Link to={`/catalog?line=${encodeURIComponent(line.line)}`} className={styles.lineLink}>
                    {line.line}
                  </Link>
                  <span className={styles.bar} style={fill(line.tried, line.total)} aria-hidden="true" />
                  <span className={styles.barValue}>
                    {line.tried} / {line.total}
                  </span>
                  <span className={styles.barValue}>
                    <span className="visually-hidden">Average rating </span>
                    {formatAverage(line.averageRating)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}

      <section className={styles.panel}>
        <h2 className={styles.heading}>Your data</h2>
        <p className={styles.muted}>
          Everything is stored in this browser. Export a JSON file to back it up or move it to another browser.
        </p>
        <DataTransfer />
      </section>
    </div>
  );
}
