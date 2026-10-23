import type { Can } from '../types/can';

/** "Figures for the 500 ml EU can": recipes and sizes differ by region. */
export function formatFactsBasis(can: Pick<Can, 'factsRegion' | 'volumeMl'>): string | null {
  if (can.factsRegion === undefined) {
    return null;
  }
  const volume = can.volumeMl === undefined ? '' : `${can.volumeMl} ml `;
  return `Figures for the ${volume}${can.factsRegion} can`;
}

/** "160 mg", or "—" while a fact is unverified. */
export function formatFact(value: number | undefined, unit: string): string {
  if (value === undefined) {
    return '—';
  }
  return `${value} ${unit}`;
}

/** "23 Oct 2026, 14:05" in the visitor's time zone. */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

/** 4.25 → "4.3"; null → "—". */
export function formatAverage(value: number | null): string {
  return value === null ? '—' : value.toFixed(1);
}
