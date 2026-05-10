import { Stack } from 'expo-router/stack';
export default function RefereeTournamentsStack() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerTransparent: true, headerBlurEffect: 'systemMaterial', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Mis Torneos' }} />
      <Stack.Screen name="[id]"  options={{ title: 'Torneo', headerLargeTitle: false }} />
    </Stack>
  );
}
