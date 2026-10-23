import styles from './StarRating.module.css';
import type { Rating } from '../../types/tasting';

interface StarRatingProps {
  value: Rating | null;
}

const STAR_PATH =
  'M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.54L12 17.5l-5.87 3.08 1.12-6.54L2.5 9.41l6.56-.95L12 2.5z';

export function StarRating({ value }: StarRatingProps) {
  const filledCount = value ?? 0;
  const label = value !== null ? `${value} / 5` : 'Not rated';                // ←
  const ariaLabel = value !== null ? `Rated ${value} out of 5` : 'Not rated'; // ←

  return (
    <div className={styles.rating} role="img" aria-label={ariaLabel}>
      <div className={styles.stars}>
        {Array.from({ length: 5 }, (_, i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            aria-hidden="true"
            className={`${styles.star} ${i < filledCount ? styles.filled : styles.empty}`}
          >
            <path d={STAR_PATH} />
          </svg>
        ))}
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
}