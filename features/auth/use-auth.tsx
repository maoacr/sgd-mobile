import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '@/lib/supabase';
import { signOut as authSignOut } from '@/lib/supabase-auth';
import type { AuthenticatedUser } from '@/types';

// ─── Interfaz del contexto (skill: state-context-interface) ──────────────────

interface AuthState {
  user: AuthenticatedUser | null;
  /** true mientras se verifica la sesión al arrancar la app */
  isLoading: boolean;
}

interface AuthActions {
  signOut: () => Promise<void>;
}

interface AuthContextValue {
  state: AuthState;
  actions: AuthActions;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helper: convierte la sesión de Supabase en AuthenticatedUser ─────────────

/**
 * Extrae el rol y los datos de dominio desde el JWT de Supabase.
 * El rol viene en user_metadata porque el superadmin lo setea al crear
 * los usuarios de equipo y árbitro vía Supabase Admin API.
 */
function sessionToUser(
  session: NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>,
): AuthenticatedUser | null {
  const meta = session.user.user_metadata as Record<string, unknown>;
  const role = meta?.role as string | undefined;
  const id = session.user.id;
  const email = session.user.email ?? '';
  const name = (meta?.name as string) ?? email;

  switch (role) {
    case 'superadmin':
      return { role: 'superadmin', id, email, name };

    case 'admin_complejo':
      return {
        role: 'admin_complejo',
        id,
        email,
        name,
      };

    case 'referee':
      return {
        role: 'referee',
        id,
        email,
        name,
      };

    case 'player':
    default:
      return {
        role: 'player',
        id,
        email,
        name,
      };
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Verificar sesión existente al montar
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setUser(sessionToUser(data.session));
      }
      setIsLoading(false);
    });

    // 2. Suscribirse a cambios de sesión (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? sessionToUser(session) : null);
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const actions: AuthActions = {
    signOut: async () => {
      await authSignOut();
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={{ state: { user, isLoading }, actions }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook público ─────────────────────────────────────────────────────────────

/**
 * Hook para consumir el contexto de autenticación.
 * Uso: const { state: { user }, actions: { signOut } } = useAuth();
 *
 * Usa React.use() en lugar de useContext() (skill: building-native-ui).
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('[SGD] useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
