import { describe, expect, it } from 'vitest';
import { mergeUserData } from './merge';

const older = { tried: true, wantToTry: false, rating: 3 as const, note: 'old', updatedAt: '2026-10-01T00:00:00.000Z' };
const newer = { ...older, rating: 5 as const, note: 'new', updatedAt: '2026-10-20T00:00:00.000Z' };

describe('mergeUserData', () => {
  it('keeps the newer entry per can', () => {
    expect(mergeUserData({ a: older }, { a: newer })).toEqual({ a: newer });
    expect(mergeUserData({ a: newer }, { a: older })).toEqual({ a: newer });
  });

  it('keeps the account entry on a tie', () => {
    const tie = { ...newer, note: 'browser' };
    expect(mergeUserData({ a: newer }, { a: tie })).toEqual({ a: newer });
  });

  it('adds cans that only one side has', () => {
    expect(mergeUserData({ a: older }, { b: newer })).toEqual({ a: older, b: newer });
  });
});
