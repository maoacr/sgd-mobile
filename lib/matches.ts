import { supabase } from '@/lib/supabase';

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  referee_id: string | null;
  scheduled_at: string;
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed';
  round: number | null;
  group_name: string | null;
  created_at: string;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string | null;
  team_id: string;
  event_type: 'goal' | 'own_goal' | 'yellow_card' | 'red_card' | 'yellow_red_card' | 'substitution' | 'penalty_scored' | 'penalty_missed';
  minute: number;
  created_at: string;
}

export interface MatchResult {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  registered_by: string;
  registered_at: string;
}

export async function listMatchesByTournament(tournamentId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*, home_team:teams!home_team_id(*), away_team:teams!away_team_id(*), referee:referees(*), match_results(*), match_events(*)')
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true })
    .order('scheduled_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createMatch(data: {
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  scheduled_at: string;
  round?: number;
  group_name?: string;
  referee_id?: string;
}) {
  const { data: result, error } = await supabase
    .from('matches')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Match;
}

export async function updateMatchStatus(matchId: string, status: Match['status']) {
  const { data, error } = await supabase
    .from('matches')
    .update({ status })
    .eq('id', matchId)
    .select()
    .single();
  if (error) throw error;
  return data as Match;
}

export async function registerMatchResult(matchId: string, homeScore: number, awayScore: number, registeredBy: string) {
  const { data, error } = await supabase
    .from('match_results')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      registered_by: registeredBy,
    })
    .select()
    .single();
  if (error) throw error;

  // Also update match status to finished
  await supabase.from('matches').update({ status: 'finished' }).eq('id', matchId);

  return data as MatchResult;
}

export async function addMatchEvent(data: {
  match_id: string;
  team_id: string;
  event_type: MatchEvent['event_type'];
  minute: number;
  player_id?: string;
}) {
  const { data: result, error } = await supabase
    .from('match_events')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as MatchEvent;
}

export async function listMatchEvents(matchId: string) {
  const { data, error } = await supabase
    .from('match_events')
    .select('*')
    .eq('match_id', matchId)
    .order('minute', { ascending: true });
  if (error) throw error;
  return data as MatchEvent[];
}

export async function updateMatchScore(matchId: string, homeScore: number, awayScore: number) {
  const { data, error } = await supabase
    .from('match_results')
    .upsert({
      match_id: matchId,
      home_score: homeScore,
      away_score: awayScore,
      registered_by: 'system',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}