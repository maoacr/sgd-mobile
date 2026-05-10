import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';

import { useAuth } from '@/features/auth/use-auth';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { actions } = useAuth();

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
      <Text style={styles.title}>Configuración</Text>

      <View style={styles.section}>
        <Pressable style={styles.menuItem} onPress={() => router.push('/(drawer)/profile')}>
          <Text style={styles.menuText}>Mi Perfil</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        <Pressable style={styles.menuItem} onPress={() => router.push('/(drawer)/notifications')}>
          <Text style={styles.menuText}>Notificaciones</Text>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Pressable style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: '700', color: '#11181C', marginBottom: 24 },
  section: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  menuText: { fontSize: 16, color: '#11181C' },
  chevron: { fontSize: 20, color: '#9BA1A6' },
  logoutItem: { borderBottomWidth: 0 },
  logoutText: { fontSize: 16, color: '#DC2626', fontWeight: '500' },
});