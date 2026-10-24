import { supabase } from './supabase';

/** Every row of `can_rating_stats` (totals only, readable by anyone), unchecked. */
export async function fetchRatingStats(): Promise<unknown[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from('can_rating_stats').select('can_id, rating_count, rating_sum');
  if (error) throw error;
  return data ?? [];
}
