import { describe, expect, it } from 'vitest';
import { entryToRow, importPlan, planWrite, restoreEntry, rowToEntry, rowsToUserData } from './rows';

const row = {
  user_id: 'u1',
  can_id: 'mango-loco',
  tried: true,
  want_to_try: false,
  rating: 4,
  note: 'Sweet',
  updated_at: '2026-10-24T10:00:00.000Z',
};

describe('rowToEntry', () => {
  it('maps a database row to an entry', () => {
    expect(rowToEntry(row)).toEqual([
      'mango-loco',
      { tried: true, wantToTry: false, rating: 4, note: 'Sweet', updatedAt: '2026-10-24T10:00:00.000Z' },
    ]);
  });

  it('rejects a row with a rating outside 1–5', () => {
    expect(rowToEntry({ ...row, rating: 7 })).toBeNull();
  });

  it('rejects a row without a can id or with a bad date', () => {
    expect(rowToEntry({ ...row, can_id: '' })).toBeNull();
    expect(rowToEntry({ ...row, updated_at: 'yesterday' })).toBeNull();
  });
});

describe('rowsToUserData', () => {
  it('skips bad rows and keeps good ones', () => {
    expect(Object.keys(rowsToUserData([row, { ...row, can_id: 'khaotic', tried: 'yes' }]))).toEqual(['mango-loco']);
  });
});

describe('entryToRow', () => {
  it('round-trips an entry through a row', () => {
    const mapped = rowToEntry(row);
    expect(mapped).not.toBeNull();
    const [id, entry] = mapped!;
    expect(entryToRow('u1', id, entry)).toEqual(row);
  });
});

describe('planWrite', () => {
  it('plans an upsert for an existing entry and a delete for a removed one', () => {
    const data = rowsToUserData([row]);
    expect(planWrite('u1', 'mango-loco', data)).toEqual({ kind: 'upsert', row });
    expect(planWrite('u1', 'khaotic', data)).toEqual({ kind: 'delete', canId: 'khaotic' });
  });
});

describe('restoreEntry', () => {
  it('restores the previous entry after a failed write', () => {
    const data = rowsToUserData([row]);
    const changed = { ...data, 'mango-loco': { ...data['mango-loco'], rating: 1 as const } };
    expect(restoreEntry(changed, 'mango-loco', data['mango-loco'])).toEqual(data);
  });

  it('removes an entry that did not exist before the failed write', () => {
    const data = rowsToUserData([row]);
    expect(restoreEntry(data, 'mango-loco', undefined)).toEqual({});
  });
});

describe('importPlan', () => {
  it('imports by upserting everything first and deleting only leftovers', () => {
    const current = rowsToUserData([row, { ...row, can_id: 'khaotic' }]);
    const incoming = rowsToUserData([{ ...row, rating: 5 }]);
    const plan = importPlan('u1', current, incoming);
    expect(plan.upserts).toEqual([{ ...row, rating: 5 }]);
    expect(plan.deletes).toEqual(['khaotic']);
  });
});
