export type CanId = string;

/** Where a can is (or was) sold. */
export type Region = 'EU' | 'US';

export interface Can {
  id: CanId;
  name: string;
  line: string;
  flavorColor: string;
  regions: Region[];
  /** Not on the current official US, UK, or German product lists. */
  discontinued?: boolean;
  /** Flavor profile, in the words of the source. */
  flavor?: string;
  caffeineMg?: number;
  sugarG?: number;
  caloriesKcal?: number;
  volumeMl?: number;
  /** Which region's can the numbers describe: recipes and can sizes differ. */
  factsRegion?: Region;
  /** Where the numbers come from. */
  source?: string;
  image?: string;
  /** The 3D can's skin: the whole label unrolled flat, about 1.38 : 1, front in the middle. */
  label?: string;
}
