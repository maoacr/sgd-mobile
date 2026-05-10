/**
 * Tipos del dominio — Equipo, Sub-equipo y Jugador
 */

export type SquadCategory =
  | 'amateur'
  | 'sub20'
  | 'sub23'
  | 'professional'
  | 'custom';

export type PlayerPosition =
  | 'goalkeeper'
  | 'defender'
  | 'midfielder'
  | 'forward';

/**
 * Equipo — creado y gestionado por el rol 'team'.
 * Un equipo puede tener múltiples sub-equipos (squads) por categoría.
 */
export interface Team {
  id: string;
  name: string;
  logoUrl?: string;
  userId: string;             // FK → users.id (rol team)
  createdAt: string;
  updatedAt: string;
}

/**
 * Sub-equipo (Squad) — agrupa jugadores por categoría.
 * Equipo A, Sub-20, Amateur, etc.
 * Un squad puede estar en múltiples torneos.
 */
export interface Squad {
  id: string;
  teamId: string;
  name: string;
  category: SquadCategory;
  customCategory?: string;    // Cuando category === 'custom'
  createdAt: string;
}

/**
 * Jugador — pertenece a un squad.
 * Accede al sistema vía token único (sin usuario propio).
 */
export interface Player {
  id: string;
  squadId: string;
  name: string;
  lastName: string;
  number?: number;
  position?: PlayerPosition;
  photoUrl?: string;
  /** Token único para el formulario de auto-registro */
  registrationToken: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Árbitro — creado por el superadmin, tiene usuario propio.
 */
export interface Referee {
  id: string;
  userId: string;             // FK → users.id (rol referee)
  name: string;
  photoUrl?: string;
  createdAt: string;
}
