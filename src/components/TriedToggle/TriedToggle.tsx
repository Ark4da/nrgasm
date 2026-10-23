import styles from './TriedToggle.module.css';

interface TriedToggleProps {
  tried: boolean;
  onChange: (tried: boolean) => void;
  /** Visually hidden extra context, e.g. the can name on a card. */
  context?: string;
}

/** A checkbox styled as a pill, so its state is announced for free. */
export function TriedToggle({ tried, onChange, context }: TriedToggleProps) {
  return (
    <label className={`${styles.toggle} ${tried ? styles.on : ''}`}>
      <input
        type="checkbox"
        className="visually-hidden"
        checked={tried}
        onChange={(event) => onChange(event.target.checked)}
      />
      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path className={styles.check} d="M7.5 12.5l3 3 6-6.5" pathLength={1} />
      </svg>
      Tried
      {context && <span className="visually-hidden"> {context}</span>}
    </label>
  );
}
