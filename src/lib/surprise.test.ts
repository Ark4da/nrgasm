import { describe, expect, it } from 'vitest';
import type { Can } from '../types/can';
import type { UserData } from '../types/tasting';
import { pickSurprise } from './surprise';

const can = (id: string, discontinued = false): Can =>
  ({ id, name: id, line: 'Juice', flavorColor: '#000000', regions: ['EU'], discontinued });

const cans = [can('a'), can('b'), can('c'), can('old', true)];
const tried = { tried: true, wantToTry: false, rating: null, note: '', updatedAt: '2026-10-01T00:00:00.000Z' };

describe('pickSurprise', () => {
  it('picks an untried can that is still on sale', () => {
    const data: UserData = { a: tried, c: tried };
    expect(pickSurprise(cans, data, () => 0)?.id).toBe('b');
    expect(pickSurprise(cans, data, () => 0.99)?.id).toBe('b');
  });

  it('uses the random number to choose', () => {
    expect(pickSurprise(cans, {}, () => 0)?.id).toBe('a');
    expect(pickSurprise(cans, {}, () => 0.99)?.id).toBe('c');
  });

  it('falls back to discontinued cans when everything on sale is tried', () => {
    const data: UserData = { a: tried, b: tried, c: tried };
    expect(pickSurprise(cans, data, () => 0)?.id).toBe('old');
  });

  it('returns nothing when every can is tried', () => {
    const data: UserData = { a: tried, b: tried, c: tried, old: tried };
    expect(pickSurprise(cans, data, () => 0)).toBeUndefined();
  });
});
