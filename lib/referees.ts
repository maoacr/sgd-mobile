import { supabase } from '@/lib/supabase';

export async function getRefereeFromAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: referee } = await supabase
    .from('referees')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return referee;
}

export async function getRefereeTournaments(refereeId: string) {
  const { data, error } = await supabase
    .from('tournament_referees')
    .select('tournament_id, tournaments(*)')
    .eq('referee_id', refereeId);
  if (error) throw error;
  return data;
}
