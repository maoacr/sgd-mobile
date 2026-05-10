import { Stack } from 'expo-router/stack';

export default function TournamentsStack() {
  return (
    <Stack
      screenOptions={{
        headerLargeTitle: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerBlurEffect: 'systemMaterial',
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      <Stack.Screen name="index"   options={{ title: 'Torneos' }} />
      <Stack.Screen name="new"     options={{ title: 'Nuevo torneo', headerLargeTitle: false }} />
      <Stack.Screen name="[id]"    options={{ title: 'Torneo',       headerLargeTitle: false }} />
    </Stack>
  );
}
