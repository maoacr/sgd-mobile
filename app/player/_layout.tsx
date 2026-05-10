import { Stack } from 'expo-router/stack';

/** Layout sin header para el formulario de auto-registro del jugador */
export default function PlayerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="register" />
    </Stack>
  );
}
