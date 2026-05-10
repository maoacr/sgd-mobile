import { Stack } from 'expo-router/stack';

/**
 * Layout del detalle de torneo del árbitro.
 * Contiene sub-pantallas: info del torneo + registro de partido.
 */
export default function RefereeTournamentDetailLayout() {
  return (
    <Stack screenOptions={{ headerLargeTitle: false, headerTransparent: true, headerBlurEffect: 'systemMaterial', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index"           options={{ title: 'Torneo' }} />
      <Stack.Screen name="match/[matchId]" options={{ title: 'Registrar partido' }} />
    </Stack>
  );
}
