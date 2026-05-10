import { Link, Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
        <Text style={{ fontSize: 48 }}>🏟️</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#11181C', textAlign: 'center' }}>
          Esta pantalla no existe
        </Text>
        <Link href="/" style={{ marginTop: 8 }}>
          <Text style={{ color: '#0a7ea4', fontSize: 16 }}>Ir al inicio</Text>
        </Link>
      </View>
    </>
  );
}
