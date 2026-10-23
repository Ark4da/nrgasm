export type Rating = 1 | 2 | 3 | 4 | 5;

export interface TastingEntry {
  tried: boolean;
  rating: Rating|null;
  note: string;
  updatedAt: string;     
}