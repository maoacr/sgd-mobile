/**
 * Estado asíncrono genérico — discriminated union.
 * Cubre todos los estados posibles de cualquier operación async en SGD.
 *
 * Uso:
 *   const [state, setState] = useState<AsyncState<Tournament[]>>({ status: 'idle' });
 */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };

/**
 * Respuesta paginada estándar de Supabase.
 */
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
}

/**
 * Parámetros comunes de paginación para queries.
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
