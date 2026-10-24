import type { UserData } from '../types/tasting';

/**
 * Joins the tastings saved in this browser with the account's.
 * Per can, the entry changed most recently wins; on a tie the account keeps its own.
 */
export function mergeUserData(account: UserData, browser: UserData): UserData {
  const merged: UserData = { ...account };
  for (const [id, entry] of Object.entries(browser)) {
    const mine = merged[id];
    if (!mine || Date.parse(entry.updatedAt) > Date.parse(mine.updatedAt)) {
      merged[id] = entry;
    }
  }
  return merged;
}
