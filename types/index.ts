/**
 * Barrel de tipos — punto de entrada único para importar tipos de dominio.
 *
 * Uso:
 *   import type { Tournament, Match, Player } from '@/types';
 *
 * SRP: cada archivo define su dominio, este barrel los expone de forma limpia.
 */

export type { UserRole, AuthenticatedUser } from './roles';
export { isRole } from './roles';

export type { AsyncState, PaginatedResponse, PaginationParams } from './async-state';

export type {
  TournamentStatus,
  TournamentType,
  TournamentCategory,
  Tournament,
  Venue,
  TournamentTeam,
  TournamentReferee,
} from './tournament';

export type {
  SquadCategory,
  PlayerPosition,
  Team,
  Squad,
  Player,
  Referee,
} from './team';

export type {
  MatchStatus,
  MatchEventType,
  Match,
  MatchEvent,
  MatchResult,
} from './match';
