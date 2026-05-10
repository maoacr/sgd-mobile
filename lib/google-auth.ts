import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/lib/supabase';

export const googleSignInConfig = {
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  redirectUri: makeRedirectUri({
    scheme: 'sgd',
    path: 'sign-in',
  }),
};

export const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest(
  googleSignInConfig,
);

/**
 * Ejecuta login con Google OAuth.
 * Devuelve el token de ID para usar con Supabase.
 */
export async function signInWithGoogle(): Promise<{
  idToken: string;
  accessToken: string;
} | null> {
  const result = await googlePromptAsync();

  if (result.type === 'success') {
    const { id_token, access_token } = result.params;
    return { idToken: id_token, accessToken: access_token };
  }

  return null;
}

/**
 * Autentica en Supabase con el token de Google.
 */
export async function signInWithGoogleSupabase(idToken: string, accessToken: string) {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
    access_token: accessToken,
  });

  if (error) throw error;
  return data;
}