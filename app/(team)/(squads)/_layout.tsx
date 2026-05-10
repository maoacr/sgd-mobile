import { Stack } from 'expo-router/stack';
export default function SquadsStack() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerTransparent: true, headerBlurEffect: 'systemMaterial', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Mis Equipos' }} />
      <Stack.Screen name="new"   options={{ title: 'Nuevo equipo', headerLargeTitle: false }} />
      <Stack.Screen name="[id]"  options={{ title: 'Equipo',       headerLargeTitle: false }} />
    </Stack>
  );
}
