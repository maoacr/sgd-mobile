import * as SecureStore from 'expo-secure-store';
import { supabase } from '@/lib/supabase';

/**
 * SecureStore adapter para Supabase auth.
 * Cifra la sesión en el keychain (iOS) / keystore (Android).
 */
export const secureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export interface SignUpCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  countryCode?: string;
  birthDate?: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
}

/**
 * Valida que la contraseña cumpla con los requisitos de seguridad.
 * - Mínimo 1 número
 * - Mínimo 1 mayúscula
 * - Mínimo 1 minúscula
 * - Mínimo 1 carácter especial
 * - Mínimo 8 caracteres
 */
export function validatePassword(password: string): AuthError | null {
  if (password.length < 8) {
    return { message: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (!/[0-9]/.test(password)) {
    return { message: 'La contraseña debe contener al menos 1 número.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { message: 'La contraseña debe contener al menos 1 letra mayúscula.' };
  }
  if (!/[a-z]/.test(password)) {
    return { message: 'La contraseña debe contener al menos 1 letra minúscula.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { message: 'La contraseña debe contener al menos 1 carácter especial.' };
  }
  return null;
}

/**
 * Registra un nuevo usuario con rol player por defecto.
 * Envía correo de verificación.
 */
export async function signUp(
  credentials: SignUpCredentials,
): Promise<{ data: null; error: AuthError } | { data: { userId: string }; error: null }> {
  const passwordError = validatePassword(credentials.password);
  if (passwordError) return { data: null, error: passwordError };

  const { data, error } = await supabase.auth.signUp({
    email: credentials.email.trim(),
    password: credentials.password,
    options: {
      data: {
        role: 'player',
        first_name: credentials.firstName.trim(),
        last_name: credentials.lastName.trim(),
        phone: credentials.phone?.trim() || null,
        country_code: credentials.countryCode || '+57',
        birth_date: credentials.birthDate || null,
      },
      emailRedirectTo: 'sgd://confirm-email',
    },
  });

  if (error) return { data: null, error: { message: error.message } };
  if (!data.user) return { data: null, error: { message: 'Error al crear usuario.' } };

  // Crear perfil en la tabla profiles (el trigger de Supabase no funciona)
  const fullName = `${credentials.firstName} ${credentials.lastName}`.trim();
  const { error: profileError } = await supabase.from('profiles').insert({
    id: data.user.id,
    name: fullName,
    email: data.user.email ?? credentials.email.trim(),
    country_code: credentials.countryCode || '+57',
    role: 'player',
  });

  if (profileError) {
    // No bloqueamos el registro si el perfil falla — se puede crear después
    console.warn('[Auth] Profile creation failed:', profileError.message);
  }

  return { data: { userId: data.user.id }, error: null };
}

/**
 * Inicia sesión con email y contraseña.
 */
export async function signIn(
  credentials: SignInCredentials,
): Promise<{ data: null; error: AuthError } | { data: { userId: string }; error: null }> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email.trim(),
    password: credentials.password,
  });

  if (error) return { data: null, error: { message: error.message } };
  if (!data.user) return { data: null, error: { message: 'Error al iniciar sesión.' } };

  return { data: { userId: data.user.id }, error: null };
}

/**
 * Cierra la sesión del usuario actual.
 */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Obtiene la sesión activa.
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Actualiza el perfil del usuario en la tabla users.
 * Nota: auth.users metadata se actualiza por separado si es necesario.
 */
export async function updateUserProfile(
  userId: string,
  updates: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    birthDate?: string;
    photoUrl?: string;
  },
): Promise<{ data: null; error: AuthError } | { data: { id: string }; error: null }> {
  const { data, error } = await supabase
    .from('users')
    .update({
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      birth_date: updates.birthDate,
      photo_url: updates.photoUrl,
    })
    .eq('id', userId)
    .select('id')
    .single();

  if (error) return { data: null, error: { message: error.message } };
  return { data: { id: data.id }, error: null };
}

/**
 * Obtiene el perfil del usuario actual.
 */
export async function getCurrentUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
}