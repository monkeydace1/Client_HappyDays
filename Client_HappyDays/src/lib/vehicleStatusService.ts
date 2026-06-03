import { supabase } from './supabase';

export async function fetchHiddenVehicleIds(): Promise<Set<number>> {
  try {
    const { data, error } = await supabase
      .from('vehicles')
      .select('id, status')
      .in('status', ['maintenance', 'retired']);

    if (error) {
      console.error('Error fetching hidden vehicles:', error);
      return new Set();
    }

    return new Set((data ?? []).map((v) => v.id as number));
  } catch (err) {
    console.error('Error fetching hidden vehicles:', err);
    return new Set();
  }
}
