import { describe, expect, it } from 'vitest';
import type { UserData } from '../types/tasting';
import { exportFileName, parseImport, serializeExport } from './transfer';

const now = new Date('2026-10-23T12:00:00.000Z');
const data: UserData = {
  'mango-loco': { tried: true, wantToTry: false, rating: 4, note: 'Tropical', updatedAt: now.toISOString() },
};

describe('export / import', () => {
  it('round-trips the collection', () => {
    expect(parseImport(serializeExport(data, now))).toEqual({ ok: true, data, count: 1 });
  });

  it('names the file by date', () => {
    expect(exportFileName(now)).toBe('nrgasm-collection-2026-10-23.json');
  });

  it('rejects text that is not JSON', () => {
    expect(parseImport('hello')).toEqual({ ok: false, error: 'This file is not valid JSON.' });
  });

  it('rejects JSON from somewhere else', () => {
    expect(parseImport('{"entries":{}}')).toMatchObject({ ok: false, error: 'This file is not an NRGASM export.' });
    expect(parseImport('[1,2]')).toMatchObject({ ok: false });
  });

  it('rejects an unknown version', () => {
    const file = JSON.stringify({ app: 'nrgasm', version: 2, entries: {} });
    expect(parseImport(file)).toMatchObject({ ok: false });
  });

  it('rejects damaged entries', () => {
    const file = JSON.stringify({ app: 'nrgasm', version: 1, entries: { x: { tried: true, rating: 0 } } });
    expect(parseImport(file)).toMatchObject({ ok: false });
  });

  it('accepts an empty collection', () => {
    expect(parseImport(serializeExport({}, now))).toEqual({ ok: true, data: {}, count: 0 });
  });
});
