import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listTournaments, type Tournament } from '@/lib/tournaments';

const STATUS_COLORS: Record<string, string> = {
  draft: '#F59E0B',
  active: '#22C55E',
  finished: '#687076',
  cancelled: '#DC2626',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
};

export default function TournamentsScreen() {
  const insets = useSafeAreaInsets();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadTournaments() {
    try {
      const data = await listTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTournaments(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  };

  function renderItem({ item }: { item: Tournament }) {
    const statusColor = STATUS_COLORS[item.status] ?? '#687076';
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/(superadmin)/(tournaments)/${item.id}`)}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.type.toUpperCase()} • {item.category}
          </Text>
          <Text style={styles.cardDate}>
            Inicio: {new Date(item.start_date).toLocaleDateString('es-CO')}
          </Text>
        </View>
        <View style={styles.cardRight}>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {STATUS_LABELS[item.status] ?? item.status}
            </Text>
          </View>
          <Text style={styles.teamsCount}>
            {item.max_teams} equipos
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
        </View>
      </Pressable>
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Torneos</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(superadmin)/(tournaments)/new')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {tournaments.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Sin torneos</Text>
          <Text style={styles.emptyText}>Crea tu primer torneo para empezar</Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push('/(superadmin)/(tournaments)/new')}
          >
            <Text style={styles.emptyButtonText}>Crear torneo</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  addButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0a7ea4', alignItems: 'center', justifyContent: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  cardLeft: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  cardSubtitle: { fontSize: 13, color: '#687076', marginTop: 2 },
  cardDate: { fontSize: 13, color: '#9BA1A6', marginTop: 2 },
  cardRight: { alignItems: 'flex-end', gap: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  teamsCount: { fontSize: 12, color: '#9BA1A6' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
  emptyButton: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 14, backgroundColor: '#0a7ea4', borderRadius: 12 },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});