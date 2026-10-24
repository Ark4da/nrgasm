import { describe, expect, it } from 'vitest';
import type { Can } from '../types/can';
import { compareFacts } from './compare';

const base: Can = { id: 'a', name: 'A', line: 'Original', flavorColor: '#000000', regions: ['EU'] };

describe('compareFacts', () => {
  it('marks the larger value in each row', () => {
    const a: Can = { ...base, caffeineMg: 160, sugarG: 0, volumeMl: 500 };
    const b: Can = { ...base, id: 'b', caffeineMg: 150, sugarG: 55, volumeMl: 500 };
    const rows = compareFacts(a, b);
    expect(rows.find((row) => row.key === 'caffeine')).toMatchObject({ a: 160, b: 150, larger: 'a' });
    expect(rows.find((row) => row.key === 'sugar')).toMatchObject({ a: 0, b: 55, larger: 'b' });
  });

  it('marks no side when the values are equal or one is unknown', () => {
    const a: Can = { ...base, caffeineMg: 160, volumeMl: 500 };
    const b: Can = { ...base, id: 'b', caffeineMg: 160 };
    const rows = compareFacts(a, b);
    expect(rows.find((row) => row.key === 'caffeine')?.larger).toBeNull();
    expect(rows.find((row) => row.key === 'volume')).toMatchObject({ a: 500, b: undefined, larger: null });
  });

  it('works out caffeine per 100 ml, so different can sizes compare fairly', () => {
    const a: Can = { ...base, caffeineMg: 160, volumeMl: 500 };
    const b: Can = { ...base, id: 'b', caffeineMg: 150, volumeMl: 473 };
    const row = compareFacts(a, b).find((item) => item.key === 'caffeinePer100');
    expect(row?.a).toBe(32);
    expect(row?.b).toBeCloseTo(31.7, 1);
    expect(row?.larger).toBe('a');
  });

  it('leaves caffeine per 100 ml unknown without a volume', () => {
    const a: Can = { ...base, caffeineMg: 160 };
    const row = compareFacts(a, a).find((item) => item.key === 'caffeinePer100');
    expect(row?.a).toBeUndefined();
  });
});
