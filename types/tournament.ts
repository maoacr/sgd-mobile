/**
 * Tipos del dominio — Torneo
 */

export type TournamentStatus = 'draft' | 'active' | 'finished' | 'cancelled';

export type TournamentType =
  | 'league'       // Todos contra todos
  | 'knockout'     // Eliminación directa
  | 'groups'       // Fase de grupos + eliminatoria
  | 'mixed';       // Grupos + llaves

export type TournamentCategory =
  | 'amateur'
  | 'sub20'
  | 'sub23'
  | 'professional'
  | 'custom';

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  category: TournamentCategory;
  customCategory?: string;    // Cuando category === 'custom'
  maxTeams: number;
  startDate: string;          // ISO 8601
  status: TournamentStatus;
  createdBy: string;          // FK → users.id (superadmin)
  createdAt: string;
  updatedAt: string;
}

export interface Venue {
  id: string;
  tournamentId: string;
  name: string;
  address?: string;
}

/**
 * Relación torneo ↔ equipo.
 * Un equipo puede participar en múltiples torneos con distintos cupos.
 */
export interface TournamentTeam {
  tournamentId: string;
  teamId: string;
  squadId?: string;           // Sub-equipo específico que participa
  status: 'confirmed' | 'pending';
}

/**
 * Relación torneo ↔ árbitro.
 */
export interface TournamentReferee {
  tournamentId: string;
  refereeId: string;
}
