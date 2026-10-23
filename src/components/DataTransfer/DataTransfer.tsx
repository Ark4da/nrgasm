import { useState, type ChangeEvent } from 'react';
import { useUserData } from '../../hooks/useUserData';
import { exportFileName, parseImport, serializeExport } from '../../lib/transfer';
import type { UserData } from '../../types/tasting';
import { buttonClass } from '../Button/buttonClass';
import styles from './DataTransfer.module.css';

type Status =
  | { kind: 'idle' }
  | { kind: 'confirm'; fileName: string; data: UserData; count: number }
  | { kind: 'done'; message: string }
  | { kind: 'error'; message: string };

function plural(count: number, word: string, many = `${word}s`): string {
  return `${count} ${count === 1 ? word : many}`;
}

export function DataTransfer() {
  const { data, replaceAll } = useUserData();
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const entryCount = Object.keys(data).length;

  function exportData() {
    const now = new Date();
    const blob = new Blob([serializeExport(data, now)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = exportFileName(now);
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); // after the download has started
    setStatus({ kind: 'done', message: `Exported ${plural(entryCount, 'entry', 'entries')}.` });
  }

  async function pickFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ''; // picking the same file twice should still fire
    if (!file) {
      return;
    }
    const result = parseImport(await file.text());
    if (result.ok) {
      setStatus({ kind: 'confirm', fileName: file.name, data: result.data, count: result.count });
    } else {
      setStatus({ kind: 'error', message: `${file.name}: ${result.error} Your current data was not changed.` });
    }
  }

  function confirmImport() {
    if (status.kind !== 'confirm') {
      return;
    }
    replaceAll(status.data);
    setStatus({ kind: 'done', message: `Imported ${status.fileName}.` });
  }

  return (
    <div className={styles.transfer}>
      <div className={styles.actions}>
        <button type="button" className={buttonClass('primary')} onClick={exportData}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
          </svg>
          Export JSON
        </button>
        <label className={buttonClass('secondary')}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 15V4M7 9l5-5 5 5M5 20h14" />
          </svg>
          Import JSON
          <input type="file" accept="application/json,.json" className="visually-hidden" onChange={pickFile} />
        </label>
      </div>

      {status.kind === 'confirm' && (
        <div className={styles.confirm} role="alertdialog" aria-labelledby="import-question">
          <p id="import-question">
            Replace your collection ({plural(entryCount, 'can')}) with the {plural(status.count, 'can')} in{' '}
            <strong>{status.fileName}</strong>?
          </p>
          <div className={styles.actions}>
            <button type="button" className={buttonClass('primary')} onClick={confirmImport} autoFocus>
              Replace collection
            </button>
            <button type="button" className={buttonClass('ghost')} onClick={() => setStatus({ kind: 'idle' })}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status.kind === 'done' && (
        <p className={styles.message} role="status">{status.message}</p>
      )}
      {status.kind === 'error' && (
        <p className={`${styles.message} ${styles.error}`} role="alert">{status.message}</p>
      )}
    </div>
  );
}
