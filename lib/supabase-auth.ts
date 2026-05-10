import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

/**
 * Adaptador de SecureStore para que Supabase persista la sesión
 * de forma segura en el dispositivo (skill: native-data-fetching).
 *
 * Supabase acepta un objeto storage personalizado con estos 3 métodos.
 * expo-secure-store cifra los datos en el keychain (iOS) / keystore (Android).
 */
export const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

/** Credenciales de login — el único flujo de entrada al sistema SGD */
export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
}

/**
 * Inicia sesión con email y contraseña.
 * Retorna un Result discriminado — nunca lanza excepciones al caller.
 */
export async function signIn(
  credentials: SignInCredentials,
): Promise<{ data: null; error: AuthError } | { data: { userId: string }; error: null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error) return { data: null, error: { message: error.message } };

  return { data: { userId: data.user.id }, error: null };
}

/** Cierra la sesión del usuario actual */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Obtiene la sesión activa desde Supabase (verifica token local).
 * Llamado en el root layout al montar la app.
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
