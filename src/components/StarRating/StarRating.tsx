import { useId, useState } from 'react';
import styles from './StarRating.module.css';
import type { Rating } from '../../types/tasting';

interface StarRatingProps {
  value: Rating | null;
  /** When given, the stars become an input; without it they only display. */
  onChange?: (value: Rating | null) => void;
}

const STAR_PATH =
  'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z';

const RATINGS: Rating[] = [1, 2, 3, 4, 5];

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`${styles.star} ${filled ? styles.filled : styles.empty}`}>
      <path d={STAR_PATH} />
    </svg>
  );
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const name = useId();
  const [preview, setPreview] = useState<Rating | null>(null);

  const label = value !== null ? `${value} / 5` : 'Not rated';

  if (!onChange) {
    const filledCount = value ?? 0;
    const ariaLabel = value !== null ? `Rated ${value} out of 5` : 'Not rated';
    return (
      <div className={styles.rating} role="img" aria-label={ariaLabel}>
        <div className={styles.stars}>
          {RATINGS.map((star) => (
            <Star key={star} filled={star <= filledCount} />
          ))}
        </div>
        <span className={styles.label}>{label}</span>
      </div>
    );
  }

  // Interactive: native radio buttons, so arrow keys work out of the box.
  const shown = preview ?? value ?? 0;

  return (
    <fieldset className={styles.rating}>
      <legend className="visually-hidden">Your rating</legend>
      <div className={styles.stars} onMouseLeave={() => setPreview(null)}>
        {RATINGS.map((star) => (
          <label
            key={star}
            className={`${styles.option} ${star === value ? styles.picked : ''}`}
            onMouseEnter={() => setPreview(star)}
          >
            <input
              type="radio"
              className="visually-hidden"
              name={name}
              value={star}
              checked={value === star}
              onChange={() => onChange(star)}
            />
            <Star filled={star <= shown} />
            <span className="visually-hidden">
              {star} {star === 1 ? 'star' : 'stars'}
            </span>
          </label>
        ))}
      </div>
      <span className={styles.label} aria-hidden="true">
        {label}
      </span>
      {value !== null && (
        <button type="button" className={styles.clear} onClick={() => onChange(null)}>
          Clear
        </button>
      )}
    </fieldset>
  );
}
