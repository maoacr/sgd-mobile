import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/features/auth/use-auth';

export default function AdminIndexScreen() {
  const insets = useSafeAreaInsets();
  const { state: { user } } = useAuth();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Panel Admin</Text>
        <Text style={styles.subtitle}>{user?.name ?? 'Admin'}</Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Canchas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Reservas</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { marginTop: 16, marginBottom: 32 },
  welcome: { fontSize: 14, color: '#687076' },
  subtitle: { fontSize: 28, fontWeight: '700', color: '#11181C' },
  stats: { flexDirection: 'row', gap: 12 },
  statCard: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, alignItems: 'center' },
  statNumber: { fontSize: 32, fontWeight: '700', color: '#0a7ea4' },
  statLabel: { fontSize: 13, color: '#687076', marginTop: 4 },
});