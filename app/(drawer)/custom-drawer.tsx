import { usePathname, router } from 'expo-router';
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerContent,
} from '@react-navigation/drawer';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/features/auth/use-auth';
import { Routes } from '@/constants/routes';

export default function CustomDrawerContent(props: any) {
  const { state: { user }, actions } = useAuth();
  const pathname = usePathname();

  async function handleSignOut() {
    await actions.signOut();
    router.replace(Routes.auth.signIn);
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name ?? 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
      </View>

      <View style={styles.menu}>
        <DrawerItem
          label="Mi Perfil"
          focused={pathname === '/drawer/profile'}
          onPress={() => router.push(Routes.drawer.profile)}
        />
        <DrawerItem
          label="Notificaciones"
          focused={pathname === '/drawer/notifications'}
          onPress={() => router.push(Routes.drawer.notifications)}
        />
        <DrawerItem
          label="Configuración"
          focused={pathname === '/drawer/settings'}
          onPress={() => router.push(Routes.drawer.settings)}
        />
      </View>

      <View style={styles.footer}>
        <Pressable
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 20, paddingTop: 60, alignItems: 'center', gap: 8 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  name: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  email: { fontSize: 13, color: '#687076' },
  menu: { paddingTop: 8 },
  footer: { padding: 20, marginTop: 'auto' },
  signOutButton: { padding: 12, alignItems: 'center' },
  signOutText: { color: '#E53E3E', fontSize: 14 },
});