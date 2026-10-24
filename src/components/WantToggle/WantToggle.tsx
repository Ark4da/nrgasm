import styles from './WantToggle.module.css';

interface WantToggleProps {
  wanted: boolean;
  onChange: (wanted: boolean) => void;
  /** Visually hidden extra context, e.g. the can name on a card. */
  context?: string;
}

/** "Want to try": a bookmark for the shopping list, styled like the Tried pill. */
export function WantToggle({ wanted, onChange, context }: WantToggleProps) {
  return (
    <label className={`${styles.toggle} ${wanted ? styles.on : ''}`}>
      <input
        type="checkbox"
        className="visually-hidden"
        checked={wanted}
        onChange={(event) => onChange(event.target.checked)}
      />
      <svg className={styles.icon} viewBox="0 0 24 24" stroke="currentColor"
        strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 3.5h12v17l-6-4-6 4z" />
      </svg>
      Want to try
      {context && <span className="visually-hidden"> {context}</span>}
    </label>
  );
}
