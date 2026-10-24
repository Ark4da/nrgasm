import { describe, expect, it } from 'vitest';
import type { TastingEntry } from '../types/tasting';
import { failedWrite, loaded, rollbackAll, savedWrite, type SyncState } from './sync';

const entry = (rating: TastingEntry['rating'], tried = true): TastingEntry => ({
  tried,
  wantToTry: false,
  rating,
  note: '',
  updatedAt: '2026-10-24T10:00:00.000Z',
});

describe('sync state', () => {
  it('starts with what the database returned as both screen and confirmed', () => {
    const data = { a: entry(3) };
    expect(loaded(data)).toEqual({ data, confirmed: data });
  });

  it('remembers a saved write as confirmed', () => {
    const a = entry(4);
    const state: SyncState = { data: { a }, confirmed: {} };
    expect(savedWrite(state, 'a', a).confirmed).toEqual({ a });
  });

  it('forgets a confirmed entry when its delete is saved', () => {
    const state: SyncState = { data: {}, confirmed: { a: entry(4) } };
    expect(savedWrite(state, 'a', undefined).confirmed).toEqual({});
  });

  it('after two failed writes in a row, shows what the database really has', () => {
    const triedOnly = entry(null);
    const rated = entry(5);
    // Offline: click Tried (write A), then a star (write B); nothing was ever saved
    let state: SyncState = { data: { a: rated }, confirmed: {} };
    state = failedWrite(state, 'a', triedOnly); // A fails, but the screen already shows B: keep it
    expect(state.data).toEqual({ a: rated });
    state = failedWrite(state, 'a', rated); // B fails: back to the database's copy, which has nothing
    expect(state.data).toEqual({});
  });

  it('puts back the confirmed entry, not the unconfirmed one before it', () => {
    const saved = entry(2);
    const shown = entry(5);
    const state: SyncState = { data: { a: shown }, confirmed: { a: saved } };
    expect(failedWrite(state, 'a', shown).data).toEqual({ a: saved });
  });

  it('after a failed import, shows the confirmed data again', () => {
    const confirmed = { a: entry(2) };
    const state: SyncState = { data: { a: entry(5), b: entry(1) }, confirmed };
    expect(rollbackAll(state)).toEqual({ data: confirmed, confirmed });
  });
});
