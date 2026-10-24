import { describeCommunityRating, formatCommunityRating, type CommunityRating as Rating } from '../../lib/ratings';
import styles from './CommunityRating.module.css';

interface CommunityRatingProps {
  rating: Rating | undefined;
}

/** "★ 4.2 · 37 ratings" from everyone; nothing for a can no one has rated yet. */
export function CommunityRating({ rating }: CommunityRatingProps) {
  if (!rating) {
    return null;
  }
  return (
    <p className={styles.rating}>
      <span aria-hidden="true">{formatCommunityRating(rating)}</span>
      <span className="visually-hidden">{describeCommunityRating(rating)}</span>
    </p>
  );
}
