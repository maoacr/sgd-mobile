import { ScrollView, View, Text, Pressable, Alert } from 'react-native';
import { useAuth } from '@/features/auth/use-auth';

/**
 * Settings del superadmin — incluye cerrar sesión.
 * Disponible desde Fase 2 para poder probar el logout.
 */
export default function SuperadminSettingsScreen() {
  const { state: { user }, actions: { signOut } } = useAuth();

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: 16, gap: 24 }}>
        {/* Perfil */}
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 13, color: '#687076', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Cuenta
          </Text>
          <View style={{ backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, gap: 4 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#11181C' }}>
              {user?.name ?? '—'}
            </Text>
            <Text style={{ fontSize: 14, color: '#687076' }}>{user?.email ?? '—'}</Text>
            <Text style={{ fontSize: 12, color: '#0a7ea4', marginTop: 4 }}>Superadmin</Text>
          </View>
        </View>

        {/* Cerrar sesión */}
        <Pressable
          onPress={handleSignOut}
          style={{ backgroundColor: '#FFF5F5', borderRadius: 12, padding: 16, alignItems: 'center' }}
        >
          <Text style={{ color: '#E53E3E', fontSize: 16, fontWeight: '500' }}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
