import styles from './CanPlaceholder.module.css';
import type { CSSProperties } from 'react';

interface CanPlaceholderProps {
    name: string;
    flavorColor: string;
}

export function CanPlaceholder({ name, flavorColor }: CanPlaceholderProps) {

    const flavorStyle = { '--flavor': flavorColor } as CSSProperties;

    return (
        <div aria-hidden="true" className={styles.can} style={flavorStyle}>
            <div className={styles.rim} />
            <div className={styles.body}>
                <div className={styles.band}>
                    <span className={styles.label}>{name}</span>
                </div>
            </div>
        </div>
    );
}