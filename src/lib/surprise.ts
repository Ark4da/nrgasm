import type { Can } from '../types/can';
import type { UserData } from '../types/tasting';

/**
 * A random can the user has not tried: one still on sale if possible,
 * otherwise a discontinued one. `random` returns a number in [0, 1), like Math.random.
 */
export function pickSurprise(cans: Can[], data: UserData, random: () => number): Can | undefined {
  const untried = cans.filter((can) => !data[can.id]?.tried);
  const onSale = untried.filter((can) => !can.discontinued);
  const pool = onSale.length > 0 ? onSale : untried;
  if (pool.length === 0) {
    return undefined;
  }
  return pool[Math.floor(random() * pool.length)];
}
