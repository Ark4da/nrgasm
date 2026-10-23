import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

/** Class names for anything that should look like a button. */
export function buttonClass(variant: ButtonVariant = 'secondary'): string {
  return `${styles.button} ${styles[variant]}`;
}
