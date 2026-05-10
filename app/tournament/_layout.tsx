import { Stack } from 'expo-router/stack';

export default function TournamentPublicLayout() {
  return (
    <Stack screenOptions={{ headerTransparent: true, headerBlurEffect: 'systemMaterial', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="[slug]" options={{ title: '' }} />
    </Stack>
  );
}
