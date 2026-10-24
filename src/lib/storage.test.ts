import { describe, expect, it } from 'vitest';
import type { UserData } from '../types/tasting';
import {
  BACKUP_KEY,
  STORAGE_KEY,
  loadUserData,
  readCache,
  saveUserData,
  userCacheKey,
  writeCache,
  type KeyValueStorage,
} from './storage';

function memoryStorage(initial: Record<string, string> = {}): KeyValueStorage & { items: Record<string, string> } {
  const items = { ...initial };
  return {
    items,
    getItem: (key) => items[key] ?? null,
    setItem: (key, value) => {
      items[key] = value;
    },
  };
}

const sample: UserData = {
  'mango-loco': { tried: true, wantToTry: false, rating: 4, note: 'Sweet', updatedAt: '2026-10-23T10:00:00.000Z' },
};

describe('loadUserData', () => {
  it('starts empty when nothing is stored', () => {
    expect(loadUserData(memoryStorage())).toEqual({ data: {}, recovered: false });
  });

  it('reads valid data', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(sample) });
    expect(loadUserData(storage)).toEqual({ data: sample, recovered: false });
  });

  it('reads entries saved before "want to try" existed', () => {
    const old = { 'mango-loco': { tried: true, rating: 4, note: 'Sweet', updatedAt: '2026-10-23T10:00:00.000Z' } };
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(old) });
    expect(loadUserData(storage)).toEqual({ data: sample, recovered: false });
  });

  it('rejects a "want to try" that is not a boolean', () => {
    const bad = { 'mango-loco': { ...sample['mango-loco'], wantToTry: 'yes' } };
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(bad) });
    expect(loadUserData(storage).recovered).toBe(true);
  });

  it('recovers from broken JSON and backs the raw value up', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '{not json' });
    expect(loadUserData(storage)).toEqual({ data: {}, recovered: true });
    expect(storage.items[BACKUP_KEY]).toBe('{not json');
  });

  it('recovers from a wrong shape', () => {
    const bad = { 'mango-loco': { tried: 'yes', rating: 7, note: 1 } };
    const storage = memoryStorage({ [STORAGE_KEY]: JSON.stringify(bad) });
    expect(loadUserData(storage).recovered).toBe(true);
  });

  it('rejects an array', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: '[]' });
    expect(loadUserData(storage).recovered).toBe(true);
  });
});

describe('saveUserData', () => {
  it('round-trips through load', () => {
    const storage = memoryStorage();
    saveUserData(storage, sample);
    expect(loadUserData(storage).data).toEqual(sample);
  });
});

describe('account cache', () => {
  it('builds the per-account cache key', () => {
    expect(userCacheKey('u1')).toBe('nrgasm:v1:user:u1');
  });

  it('reads back what it wrote, for that account only', () => {
    const storage = memoryStorage();
    writeCache(storage, 'u1', sample);
    expect(readCache(storage, 'u1')).toEqual(sample);
    expect(readCache(storage, 'u2')).toEqual({});
  });

  it('treats an unreadable cache as empty and leaves the legacy key alone', () => {
    const storage = memoryStorage({ 'nrgasm:v1:user:u1': '{broken', [STORAGE_KEY]: JSON.stringify(sample) });
    expect(readCache(storage, 'u1')).toEqual({});
    expect(storage.items[STORAGE_KEY]).toBe(JSON.stringify(sample));
  });
});
