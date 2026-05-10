import { Stack } from 'expo-router';

/**
 * Layout del grupo de autenticación.
 * Sin tabs, sin header visible — pantalla limpia de login.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="verify-email" />
    </Stack>
  );
}
