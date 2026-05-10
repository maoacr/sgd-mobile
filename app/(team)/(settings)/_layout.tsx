import { Stack } from 'expo-router/stack';
export default function TeamSettingsStack() {
  return (
    <Stack screenOptions={{ headerLargeTitle: true, headerTransparent: true, headerBlurEffect: 'systemMaterial', headerBackButtonDisplayMode: 'minimal' }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
    </Stack>
  );
}
