import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { listDraftTournaments, type Tournament } from '@/lib/tournaments';

const CATEGORY_LABELS: Record<string, string> = {
  amateur: 'Amateur',
  sub20: 'Sub-20',
  sub23: 'Sub-23',
  professional: 'Profesional',
  custom: 'Personalizado',
};

export default function PlayerTournamentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const data = await listDraftTournaments();
      setTournaments(data);
    } catch (err) {
      console.error('Error loading tournaments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  function renderItem({ item }: { item: Tournament }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/(player)/(tournaments)/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.infoItem}>
            <Ionicons name="trophy" size={16} color="#687076" />
            <Text style={styles.infoText}>{CATEGORY_LABELS[item.category] ?? item.category}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="people" size={16} color="#687076" />
            <Text style={styles.infoText}>Máx. {item.max_teams} equipos</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={16} color="#687076" />
            <Text style={styles.infoText}>
              {new Date(item.start_date).toLocaleDateString('es-CO')}
            </Text>
          </View>
        </View>
        <Pressable style={styles.applyButton}>
          <Text style={styles.applyButtonText}>Postularme</Text>
        </Pressable>
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
      <Text style={styles.title}>Torneos Abiertos</Text>
      <Text style={styles.subtitle}>Postúlate para participar</Text>

      {tournaments.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>No hay torneos abiertos</Text>
          <Text style={styles.emptyText}>Pronto habrá nuevos torneos disponibles</Text>
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
  title: { fontSize: 24, fontWeight: '700', color: '#11181C', paddingHorizontal: 20, paddingTop: 16 },
  subtitle: { fontSize: 14, color: '#687076', paddingHorizontal: 20, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#11181C', marginRight: 8 },
  typeBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', color: '#0a7ea4' },
  cardInfo: { gap: 6, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoText: { fontSize: 14, color: '#687076' },
  applyButton: { height: 40, backgroundColor: '#0a7ea4', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  applyButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
});