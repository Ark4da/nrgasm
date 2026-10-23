import type { CanId } from './can';

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface TastingEntry {
  tried: boolean;
  rating: Rating | null;
  note: string;
  updatedAt: string; // ISO 8601
}

/** The user's whole collection: one entry per can they have touched. */
export type UserData = Record<CanId, TastingEntry>;

/** The fields a user can change; `updatedAt` is set by the code. */
export type EntryPatch = Partial<Omit<TastingEntry, 'updatedAt'>>;
