import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useAuth } from '@/features/auth/use-auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerIndexScreen() {
  const { state: { user }, actions } = useAuth();

  async function handleLogout() {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await actions.signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.welcome}>Bienvenido</Text>
          <Text style={styles.name}>{user?.name ?? 'Jugador'}</Text>
        </View>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#DC2626" />
        </Pressable>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Equipos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Partidos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Torneos</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcome: { fontSize: 14, color: '#687076' },
  name: { fontSize: 28, fontWeight: '700', color: '#11181C' },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statNumber: { fontSize: 32, fontWeight: '700', color: '#0a7ea4' },
  statLabel: { fontSize: 13, color: '#687076', marginTop: 4 },
});