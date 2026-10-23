import type { Can } from '../../types/can';
import styles from './CanTags.module.css';

interface CanTagsProps {
  can: Can;
}

/** Where the can is sold, and whether it is still made. */
export function CanTags({ can }: CanTagsProps) {
  return (
    <ul className={styles.tags} aria-label="Availability">
      {can.regions.map((region) => (
        <li key={region} className={styles.tag}>
          {region}
        </li>
      ))}
      {can.discontinued && <li className={`${styles.tag} ${styles.discontinued}`}>Discontinued</li>}
    </ul>
  );
}
