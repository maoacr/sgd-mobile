import { Stack } from 'expo-router/stack';
export default function TeamPlayersStack() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerTransparent: true, headerBlurEffect: 'systemMaterial', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index"       options={{ title: 'Jugadores' }} />
      <Stack.Screen name="new"         options={{ title: 'Registrar jugador', headerLargeTitle: false }} />
      <Stack.Screen name="player-link" options={{ title: 'Link de registro',  headerLargeTitle: false }} />
      <Stack.Screen name="[id]"        options={{ title: 'Jugador',           headerLargeTitle: false }} />
    </Stack>
  );
}
