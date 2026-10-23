import type { UserData } from '../types/tasting';
import { parseUserData } from './validate';

export const STORAGE_KEY = 'nrgasm:v1';
/** Where unreadable data is moved, so a later save never destroys it. */
export const BACKUP_KEY = 'nrgasm:v1:unreadable';

export type KeyValueStorage = Pick<Storage, 'getItem' | 'setItem'>;

export interface LoadResult {
  data: UserData;
  /** True when something was stored but could not be read. */
  recovered: boolean;
}

export function loadUserData(storage: KeyValueStorage): LoadResult {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) {
    return { data: {}, recovered: false };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }

  const data = parseUserData(parsed);
  if (data === null) {
    storage.setItem(BACKUP_KEY, raw);
    return { data: {}, recovered: true };
  }
  return { data, recovered: false };
}

export function saveUserData(storage: KeyValueStorage, data: UserData): void {
  storage.setItem(STORAGE_KEY, JSON.stringify(data));
}
