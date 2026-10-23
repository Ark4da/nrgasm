import type { UserData } from '../types/tasting';
import { isRecord, parseUserData } from './validate';

// Export / import of the user's collection as a JSON file.
// The file wraps the data in an envelope so a random JSON file
// is not mistaken for a backup.

export const EXPORT_VERSION = 1;

export interface ExportFile {
  app: 'nrgasm';
  version: typeof EXPORT_VERSION;
  exportedAt: string;
  entries: UserData;
}

export function serializeExport(data: UserData, now: Date): string {
  const file: ExportFile = {
    app: 'nrgasm',
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    entries: data,
  };
  return JSON.stringify(file, null, 2);
}

export function exportFileName(now: Date): string {
  return `nrgasm-collection-${now.toISOString().slice(0, 10)}.json`;
}

export type ImportResult =
  | { ok: true; data: UserData; count: number }
  | { ok: false; error: string };

export function parseImport(text: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }

  if (!isRecord(parsed) || parsed.app !== 'nrgasm') {
    return { ok: false, error: 'This file is not an NRGASM export.' };
  }
  if (parsed.version !== EXPORT_VERSION) {
    return { ok: false, error: `This export uses format version ${String(parsed.version)}, which this app cannot read.` };
  }

  const data = parseUserData(parsed.entries);
  if (data === null) {
    return { ok: false, error: 'Some entries in this file are damaged, so nothing was imported.' };
  }
  return { ok: true, data, count: Object.keys(data).length };
}
