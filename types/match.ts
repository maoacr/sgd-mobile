/**
 * Tipos del dominio — Partido y Eventos
 */

export type MatchStatus =
  | 'scheduled'
  | 'in_progress'
  | 'finished'
  | 'cancelled'
  | 'postponed';

export type MatchEventType =
  | 'goal'
  | 'own_goal'
  | 'yellow_card'
  | 'red_card'
  | 'yellow_red_card'
  | 'substitution'
  | 'penalty_scored'
  | 'penalty_missed';

export interface Match {
  id: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  refereeId?: string;
  venueId?: string;
  scheduledAt: string;        // ISO 8601
  status: MatchStatus;
  round?: number;
  groupName?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Evento registrado durante un partido (gol, tarjeta, etc.)
 * Registrado por el Árbitro.
 */
export interface MatchEvent {
  id: string;
  matchId: string;
  playerId?: string;
  teamId: string;
  eventType: MatchEventType;
  minute: number;
  createdAt: string;
}

/**
 * Resultado final del partido — registrado por el Árbitro.
 */
export interface MatchResult {
  id: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  registeredBy: string;       // FK → referees.id
  registeredAt: string;
}
