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

// A signed-in account's last loaded tastings, so the next visit (or an
// offline one) shows them at once. One key per account: on a shared
// computer one person's cache never shows up for another.

export function userCacheKey(userId: string): string {
  return `nrgasm:v1:user:${userId}`;
}

/** The cached tastings of one account; empty when there are none or they cannot be read. */
export function readCache(storage: KeyValueStorage, userId: string): UserData {
  const raw = storage.getItem(userCacheKey(userId));
  if (raw === null) {
    return {};
  }
  try {
    return parseUserData(JSON.parse(raw)) ?? {};
  } catch {
    return {};
  }
}

export function writeCache(storage: KeyValueStorage, userId: string, data: UserData): void {
  storage.setItem(userCacheKey(userId), JSON.stringify(data));
}
