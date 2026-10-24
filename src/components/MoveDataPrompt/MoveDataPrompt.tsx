import { useEffect, useRef } from 'react';
import { buttonClass } from '../Button/buttonClass';
import styles from './MoveDataPrompt.module.css';

interface MoveDataPromptProps {
  /** Tastings saved in this browser before signing in; the dialog shows while it is above 0. */
  count: number;
  onMove: () => void;
  onSkip: () => void;
}

/** After the first sign-in in a browser with old data: offer to move it into the account. */
export function MoveDataPrompt({ count, onMove, onSkip }: MoveDataPromptProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const open = count > 0;

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
      aria-labelledby="move-data-title"
      // Escape counts as "Not now"
      onCancel={onSkip}
    >
      <h2 id="move-data-title" className={styles.title}>
        Move your tastings?
      </h2>
      <p className={styles.text}>
        This browser has {count} {count === 1 ? 'tasting' : 'tastings'} saved from before you signed in. Move them to
        your account? When both have the same can, the newer one is kept.
      </p>
      <div className={styles.actions}>
        <button type="button" className={buttonClass('primary')} onClick={onMove}>
          Move them
        </button>
        <button type="button" className={buttonClass('ghost')} onClick={onSkip}>
          Not now
        </button>
      </div>
    </dialog>
  );
}
