import type { Can } from '../types/can';

export type FactKey = 'caffeine' | 'caffeinePer100' | 'sugar' | 'calories' | 'volume';

export interface FactRow {
  key: FactKey;
  label: string;
  unit: string;
  a: number | undefined;
  b: number | undefined;
  /** Which side has more; null when equal or when either value is unknown. */
  larger: 'a' | 'b' | null;
}

/** Caffeine in 100 ml: cans come in 500, 473, and 444 ml, so raw totals mislead. */
function caffeinePer100(can: Can): number | undefined {
  if (can.caffeineMg === undefined || can.volumeMl === undefined) {
    return undefined;
  }
  return (can.caffeineMg / can.volumeMl) * 100;
}

const FACTS: { key: FactKey; label: string; unit: string; value: (can: Can) => number | undefined }[] = [
  { key: 'caffeine', label: 'Caffeine', unit: 'mg', value: (can) => can.caffeineMg },
  { key: 'caffeinePer100', label: 'Caffeine / 100 ml', unit: 'mg', value: caffeinePer100 },
  { key: 'sugar', label: 'Sugar', unit: 'g', value: (can) => can.sugarG },
  { key: 'calories', label: 'Calories', unit: 'kcal', value: (can) => can.caloriesKcal },
  { key: 'volume', label: 'Volume', unit: 'ml', value: (can) => can.volumeMl },
];

/** The facts of two cans side by side, each row noting which can has more. */
export function compareFacts(a: Can, b: Can): FactRow[] {
  return FACTS.map(({ key, label, unit, value }) => {
    const x = value(a);
    const y = value(b);
    let larger: FactRow['larger'] = null;
    if (x !== undefined && y !== undefined && x !== y) {
      larger = x > y ? 'a' : 'b';
    }
    return { key, label, unit, a: x, b: y, larger };
  });
}
