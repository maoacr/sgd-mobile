import { supabase } from '@/lib/supabase';

export interface Team {
  id: string;
  name: string;
  tagline: string | null;
  email: string | null;
  phone: string | null;
  whatsapp_url: string | null;
  logo_url: string | null;
  local_venue_id: string | null;
  created_by: string;
  is_public: boolean;
  team_type: 'open' | 'invite_only';
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  user_id: string;
  team_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    photo_url: string | null;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string | null;
  phone: string | null;
  channel: 'email' | 'whatsapp' | 'both';
  token: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  invited_by: string;
  expires_at: string;
  created_at: string;
  responded_at: string | null;
}

export interface CreateTeamInput {
  name: string;
  tagline?: string;
  email?: string;
  phone?: string;
  whatsapp_url?: string;
  logo_url?: string;
  local_venue_id?: string;
  is_public?: boolean;
  team_type?: 'open' | 'invite_only';
}

export interface InviteMemberInput {
  teamId: string;
  email?: string;
  phone?: string;
  channel: 'email' | 'whatsapp' | 'both';
}

/**
 * Obtiene todos los equipos donde el usuario es admin o miembro.
 * Phase 5: queries teams directly via user_id until team_members migration runs.
 */
export async function getMyTeams(): Promise<Team[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;

  return data ?? [];
}

/**
 * Obtiene un equipo por ID con sus miembros.
 */
export async function getTeamWithMembers(teamId: string): Promise<{
  team: Team;
  members: (TeamMember & { user: any })[];
} | null> {
  const [teamRes, membersRes] = await Promise.all([
    supabase.from('teams').select('*').eq('id', teamId).single(),
    supabase
      .from('team_members')
      .select('*, user:users(id, first_name, last_name, email, photo_url)')
      .eq('team_id', teamId),
  ]);

  if (teamRes.error || !teamRes.data) return null;

  return {
    team: teamRes.data,
    members: membersRes.data ?? [],
  };
}

/**
 * Obtiene invitaciones pendientes de un equipo.
 * Stubbed until team_invitations table exists (Phase 5 migration).
 */
export async function getTeamInvitations(teamId: string): Promise<TeamInvitation[]> {
  // Migration 001_phase5_foundation creates this table
  // Return empty until migration runs
  return [];
}

/**
 * Crea un equipo y automáticamente hace al creador admin.
 */
export async function createTeam(userId: string, input: CreateTeamInput): Promise<Team> {
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ ...input, created_by: userId })
    .select()
    .single();

  if (teamError) {
    if (teamError.message.includes('unique') || teamError.code === '23505') {
      throw new Error('Ya existe un equipo con ese nombre. Elige otro.');
    }
    throw teamError;
  }

  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ user_id: userId, team_id: team.id, role: 'admin' });

  if (memberError) throw memberError;

  return team;
}

/**
 * Actualiza info del equipo (solo admins).
 */
export async function updateTeam(teamId: string, input: Partial<CreateTeamInput>): Promise<Team> {
  const { data, error } = await supabase
    .from('teams')
    .update(input)
    .eq('id', teamId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Elimina equipo (creator, solo si no tiene miembros).
 */
export async function deleteTeam(teamId: string): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', teamId);
  if (error) throw error;
}

/**
 * Invita a un miembro al equipo.
 */
export async function inviteMember(input: InviteMemberInput): Promise<TeamInvitation> {
  const { data, error } = await supabase
    .from('team_invitations')
    .insert({
      team_id: input.teamId,
      email: input.email || null,
      phone: input.phone || null,
      channel: input.channel,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Acepta invitación usando token.
 */
export async function acceptInvitation(token: string, userId: string, userEmail: string): Promise<boolean> {
  const { error } = await supabase.rpc('accept_team_invitation', {
    p_token: token,
    p_user_id: userId,
  });

  if (error) throw error;
  return true;
}

/**
 * Rechaza invitación.
 */
export async function declineInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase
    .from('team_invitations')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', invitationId);

  if (error) throw error;
}

/**
 * Promueve miembro a admin.
 */
export async function promoteToAdmin(userId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .update({ role: 'admin' })
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) throw error;
}

/**
 * Expulsa/remueve miembro (solo admins).
 */
export async function removeMember(userId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) throw error;
}

/**
 * Sale del equipo (el propio usuario).
 */
export async function leaveTeam(userId: string, teamId: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('user_id', userId)
    .eq('team_id', teamId);

  if (error) throw error;
}

/**
 * Busca equipos públicos por nombre.
 */
export async function searchTeams(query: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .ilike('name', `%${query}%`)
    .eq('is_public', true)
    .limit(20);

  if (error) throw error;
  return data ?? [];
}