import { supabase } from '@/lib/supabase';

export type TournamentType = 'league' | 'knockout' | 'groups' | 'mixed';
export type TournamentStatus = 'draft' | 'active' | 'finished' | 'cancelled';
export type TournamentCategory = 'amateur' | 'sub20' | 'sub23' | 'professional' | 'custom';
export type TournamentTeamStatus = 'confirmed' | 'pending';

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  category: TournamentCategory;
  custom_category: string | null;
  max_teams: number;
  start_date: string;
  status: TournamentStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentTeam {
  tournament_id: string;
  team_id: string;
  squad_id: string | null;
  status: TournamentTeamStatus;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createTournament(data: {
  name: string;
  type: TournamentType;
  category: TournamentCategory;
  max_teams: number;
  start_date: string;
  created_by: string;
  custom_category?: string;
}) {
  const { data: result, error } = await supabase
    .from('tournaments')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Tournament;
}

export async function listTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Tournament[];
}

export async function listDraftTournaments() {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('status', 'draft')
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data as Tournament[];
}

export async function getTournament(id: string) {
  const { data, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function updateTournament(id: string, updates: Partial<Tournament>) {
  const { data, error } = await supabase
    .from('tournaments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Tournament;
}

export async function deleteTournament(id: string) {
  const { error } = await supabase.from('tournaments').delete().eq('id', id);
  if (error) throw error;
}

// ─── Tournament Teams ─────────────────────────────────────────────────────────

export async function applyToTournament(teamId: string, tournamentId: string) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .insert({ team_id: teamId, tournament_id: tournamentId, status: 'pending' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function listTournamentTeams(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('*, team:teams(*)')
    .eq('tournament_id', tournamentId);
  if (error) throw error;
  return data;
}

export async function confirmTeamApplication(tournamentId: string, teamId: string) {
  const { error } = await supabase
    .from('tournament_teams')
    .update({ status: 'confirmed' })
    .eq('tournament_id', tournamentId)
    .eq('team_id', teamId);
  if (error) throw error;
}

export async function confirmTeam(tournamentId: string, teamId: string) {
  return confirmTeamApplication(tournamentId, teamId);
}

export async function rejectTeamApplication(tournamentId: string, teamId: string) {
  const { error } = await supabase
    .from('tournament_teams')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('team_id', teamId);
  if (error) throw error;
}

export async function rejectTeam(tournamentId: string, teamId: string) {
  return rejectTeamApplication(tournamentId, teamId);
}

export async function getTeamTournaments(teamId: string) {
  const { data, error } = await supabase
    .from('tournament_teams')
    .select('*, tournament:tournaments(*)')
    .eq('team_id', teamId);
  if (error) throw error;
  return data;
}

// ─── Tournament Referees ──────────────────────────────────────────────────────

export async function listTournamentReferees(tournamentId: string) {
  const { data, error } = await supabase
    .from('tournament_referees')
    .select('referee_id, profiles(*)')
    .eq('tournament_id', tournamentId);
  if (error) throw error;
  return data;
}

export async function addTournamentReferee(tournamentId: string, refereeId: string) {
  const { error } = await supabase.from('tournament_referees').insert({
    tournament_id: tournamentId,
    referee_id: refereeId,
  });
  if (error) throw error;
}

// ─── Tournament Matches ────────────────────────────────────────────────────────

export async function listTournamentMatches(tournamentId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*, home_team:teams(*), away_team:teams(*)')
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: true });
  if (error) throw error;
  return data;
}

export async function getMatch(matchId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*, home_team:teams(*), away_team:teams(*)')
    .eq('id', matchId)
    .single();
  if (error) throw error;
  return data;
}

// ─── Standings ────────────────────────────────────────────────────────────────

export interface StandingsEntry {
  team_id: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
}

export async function computeStandings(tournamentId: string): Promise<StandingsEntry[]> {
  // Get all matches for the tournament
  const { data: matchesData, error: matchesError } = await supabase
    .from('matches')
    .select('*, home_team_id, away_team_id')
    .eq('tournament_id', tournamentId);

  if (matchesError) throw matchesError;

  // Get confirmed teams
  const { data: teamsData, error: teamsError } = await supabase
    .from('tournament_teams')
    .select('*, team:teams(*)')
    .eq('tournament_id', tournamentId)
    .eq('status', 'confirmed');

  if (teamsError) throw teamsError;

  // Get match results
  const { data: resultsData, error: resultsError } = await supabase
    .from('match_results')
    .select('*')
    .in('match_id', (matchesData ?? []).map((m: any) => m.id));

  if (resultsError) throw resultsError;

  const resultsMap: Record<string, { home_score: number; away_score: number }> = {};
  (resultsData ?? []).forEach((r: any) => {
    resultsMap[r.match_id] = r;
  });

  const teamStats: Record<string, {
    played: number; won: number; drawn: number; lost: number;
    goalsFor: number; goalsAgainst: number; points: number;
  }> = {};

  // Initialize
  (teamsData ?? []).forEach((tt: any) => {
    teamStats[tt.team_id] = {
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
    };
  });

  // Compute stats from finished matches
  (matchesData ?? []).forEach((match: any) => {
    if (match.status !== 'finished') return;
    const result = resultsMap[match.id];
    if (!result) return;

    const home = match.home_team_id;
    const away = match.away_team_id;
    const homeScore = result.home_score;
    const awayScore = result.away_score;

    if (!teamStats[home] || !teamStats[away]) return;

    teamStats[home].played++;
    teamStats[away].played++;
    teamStats[home].goalsFor += homeScore;
    teamStats[home].goalsAgainst += awayScore;
    teamStats[away].goalsFor += awayScore;
    teamStats[away].goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      teamStats[home].won++;
      teamStats[home].points += 3;
      teamStats[away].lost++;
    } else if (homeScore < awayScore) {
      teamStats[away].won++;
      teamStats[away].points += 3;
      teamStats[home].lost++;
    } else {
      teamStats[home].drawn++;
      teamStats[away].drawn++;
      teamStats[home].points += 1;
      teamStats[away].points += 1;
    }
  });

  // Build standings entries
  const standings: StandingsEntry[] = (teamsData ?? []).map((tt: any) => {
    const stats = teamStats[tt.team_id] ?? {
      played: 0, won: 0, drawn: 0, lost: 0,
      goalsFor: 0, goalsAgainst: 0, points: 0,
    };
    return {
      team_id: tt.team_id,
      teamName: tt.team?.name ?? '—',
      played: stats.played,
      won: stats.won,
      drawn: stats.drawn,
      lost: stats.lost,
      goalsFor: stats.goalsFor,
      goalsAgainst: stats.goalsAgainst,
      goalDiff: stats.goalsFor - stats.goalsAgainst,
      points: stats.points,
    };
  });

  // Sort by points desc, then goal diff desc
  return standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goalDiff - a.goalDiff;
  });
}