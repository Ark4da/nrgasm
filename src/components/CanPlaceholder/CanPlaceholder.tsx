import styles from './CanPlaceholder.module.css';
import type { CSSProperties } from 'react';

export type CanSize = 'xs' | 'sm' | 'md' | 'lg';

interface CanPlaceholderProps {
    name: string;
    flavorColor: string;
    size?: CanSize;
}

export function CanPlaceholder({ name, flavorColor, size = 'md' }: CanPlaceholderProps) {

    const flavorStyle = { '--flavor': flavorColor } as CSSProperties;

    return (
        <div aria-hidden="true" className={`${styles.can} ${styles[size]}`} style={flavorStyle}>
            <div className={styles.rim} />
            <div className={styles.body}>
                <div className={styles.band}>
                    <span className={styles.label}>{name}</span>
                </div>
            </div>
        </div>
    );
}
