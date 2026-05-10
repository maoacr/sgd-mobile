import { Stack } from 'expo-router/stack';
export default function TeamsStack() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerTransparent: true, headerBlurEffect: 'systemMaterial', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Equipos' }} />
    </Stack>
  );
}
