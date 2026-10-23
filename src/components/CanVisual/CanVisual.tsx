import type { Can } from '../../types/can';
import { CanPlaceholder, type CanSize } from '../CanPlaceholder/CanPlaceholder';
import styles from './CanVisual.module.css';

interface CanVisualProps {
  can: Can;
  size?: CanSize;
}

/** The owner's photo when there is one, the neutral placeholder otherwise. */
export function CanVisual({ can, size = 'md' }: CanVisualProps) {
  if (can.image) {
    return <img className={`${styles.image} ${styles[size]}`} src={can.image} alt="" loading="lazy" />;
  }
  return <CanPlaceholder name={can.name} flavorColor={can.flavorColor} size={size} />;
}
