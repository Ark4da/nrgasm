import type { CanId } from '../types/can';
import type { EntryRow, WritePlan } from '../lib/rows';
import { supabase } from './supabase';

// Reads and writes the signed-in user's rows of `tasting_entries`.
// Row Level Security limits every call to that user's own rows.
// Each function throws on failure; the store decides what the user sees.

const TABLE = 'tasting_entries';

function client() {
  if (!supabase) {
    throw new Error('Supabase is not configured');
  }
  return supabase;
}

/** All of the user's rows, unchecked (rowsToUserData checks them). */
export async function fetchEntries(): Promise<unknown[]> {
  const { data, error } = await client().from(TABLE).select('*');
  if (error) throw error;
  return data ?? [];
}

export async function writeEntry(plan: WritePlan): Promise<void> {
  const table = client().from(TABLE);
  const { error } =
    plan.kind === 'upsert'
      ? await table.upsert(plan.row, { onConflict: 'user_id,can_id' })
      : await table.delete().eq('can_id', plan.canId);
  if (error) throw error;
}

/** Upserts everything first, then deletes leftovers, so a failure never loses data. */
export async function applyImport(plan: { upserts: EntryRow[]; deletes: CanId[] }): Promise<void> {
  if (plan.upserts.length > 0) {
    const { error } = await client().from(TABLE).upsert(plan.upserts, { onConflict: 'user_id,can_id' });
    if (error) throw error;
  }
  if (plan.deletes.length > 0) {
    const { error } = await client().from(TABLE).delete().in('can_id', plan.deletes);
    if (error) throw error;
  }
}
