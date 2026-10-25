import type { Can } from '../../types/can';
import { CanPlaceholder, type CanSize } from '../CanPlaceholder/CanPlaceholder';
import styles from './CanVisual.module.css';

interface CanVisualProps {
  can: Can;
  size?: CanSize;
  /** Without a photo, show the middle of the 3D skin (the can's front) as a flat picture. */
  labelFront?: boolean;
}

/** The owner's photo when there is one, the neutral placeholder otherwise. */
export function CanVisual({ can, size = 'md', labelFront = false }: CanVisualProps) {
  if (can.image) {
    return <img className={`${styles.image} ${styles[size]}`} src={can.image} alt="" loading="lazy" />;
  }
  if (labelFront && can.label) {
    return <img className={`${styles.image} ${styles.front} ${styles[size]}`} src={can.label} alt="" loading="lazy" />;
  }
  return <CanPlaceholder name={can.name} flavorColor={can.flavorColor} size={size} />;
}
