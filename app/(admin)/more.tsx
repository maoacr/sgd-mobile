import { useState } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/features/auth/use-auth';

const MORE_ITEMS = [
  { icon: 'calendar-outline', label: 'Reservas', route: '/(admin)/bookings/index' },
  { icon: 'grid-outline', label: 'Calendario', route: '/(admin)/calendar/index' },
];

export default function AdminMoreScreen() {
  const insets = useSafeAreaInsets();
  const { actions } = useAuth();

  async function handleLogout() {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: async () => {
        await actions.signOut();
        router.replace('/(auth)/sign-in');
      }},
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: insets.top }}>
      <View style={styles.header}>
        <Text style={styles.title}>Más opciones</Text>
      </View>

      <View style={styles.section}>
        {MORE_ITEMS.map((item) => (
          <Pressable key={item.route} style={styles.menuItem} onPress={() => router.push(item.route as any)}>
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon as any} size={22} color="#0a7ea4" />
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Pressable style={[styles.menuItem, styles.logout]} onPress={handleLogout}>
          <View style={[styles.menuIcon, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="log-out-outline" size={22} color="#DC2626" />
          </View>
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#11181C' },
  section: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, gap: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#F0F9FF', alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 16, color: '#11181C' },
  logout: { borderBottomWidth: 0 },
  logoutText: { flex: 1, fontSize: 16, color: '#DC2626', fontWeight: '500' },
});