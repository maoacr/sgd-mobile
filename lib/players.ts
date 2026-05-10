import { supabase } from '@/lib/supabase';

export async function getPlayerFromAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Resolve via user_players junction (Option B)
  // Return the primary player, or the first one found
  const { data: junction } = await supabase
    .from('user_players')
    .select('player_id')
    .eq('user_id', user.id)
    .order('is_primary', { ascending: false })
    .limit(1)
    .single();

  if (!junction) return null;

  const { data: player } = await supabase
    .from('players')
    .select('*, squads(*, teams(*))')
    .eq('id', junction.player_id)
    .single();

  return player;
}

export async function getPlayer(playerId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*, squads(*, teams(*))')
    .eq('id', playerId)
    .single();
  if (error) throw error;
  return data;
}

export async function getPlayersByTeam(teamId: string) {
  // Resolve via squads → teams chain
  const { data, error } = await supabase
    .from('players')
    .select('*, squads(*, teams(*))')
    .eq('squads.team_id', teamId);
  if (error) throw error;
  return data;
}

export async function createPlayer(params: {
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  position?: string;
  squad_id: string;
}) {
  const { data, error } = await supabase
    .from('players')
    .insert(params)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function linkPlayerToUser(playerId: string, userId: string, isPrimary = false) {
  const { data, error } = await supabase
    .from('user_players')
    .insert({ player_id: playerId, user_id: userId, is_primary: isPrimary })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePlayer(playerId: string, params: Partial<{
  name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  squad_id: string;
}>) {
  const { data, error } = await supabase
    .from('players')
    .update(params)
    .eq('id', playerId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
