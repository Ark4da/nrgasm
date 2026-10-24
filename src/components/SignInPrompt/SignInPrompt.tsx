import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { buttonClass } from '../Button/buttonClass';
import styles from './SignInPrompt.module.css';

interface SignInPromptProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Shown when a guest tries to mark, rate, or write about a can.
 * A native modal dialog: it traps focus, closes on Escape, and gives focus
 * back to the control that opened it.
 */
export function SignInPrompt({ open, onClose }: SignInPromptProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="sign-in-prompt-title"
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
    >
      <h2 id="sign-in-prompt-title" className={styles.title}>
        Sign in to keep track of your cans
      </h2>
      <p className={styles.text}>Mark cans, rate them, and keep notes on any device.</p>
      <div className={styles.actions}>
        <Link to="/sign-in" className={buttonClass('primary')} onClick={() => dialog.current?.close()}>
          Sign in
        </Link>
        <button type="button" className={buttonClass('ghost')} onClick={() => dialog.current?.close()}>
          Not now
        </button>
      </div>
    </dialog>
  );
}
