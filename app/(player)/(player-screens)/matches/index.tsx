import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { listMatchesByTournament } from '@/lib/matches';

export default function OpenMatchesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      const { data: tournaments, error: tErr } = await supabase
        .from('tournaments')
        .select('id, name, type, category')
        .eq('status', 'active');

      if (tErr) throw tErr;

      const allMatches: any[] = [];
      for (const t of tournaments ?? []) {
        const m = await listMatchesByTournament(t.id);
        allMatches.push(...(m ?? []).map((match: any) => ({ ...match, tournament_name: t.name })));
      }

      setMatches(allMatches);
    } catch (err) {
      console.error('Error loading:', err);
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

  function renderItem({ item }: { item: any }) {
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/(player)/(player-screens)/matches/${item.id}`)}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="football" size={24} color="#0a7ea4" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.tournament_name}</Text>
          <Text style={styles.cardSubtitle}>
            {item.home_team?.name ?? 'Local'} vs {item.away_team?.name ?? 'Visitante'}
          </Text>
          {item.scheduled_at && (
            <Text style={styles.cardDate}>
              {new Date(item.scheduled_at).toLocaleDateString('es-CO')}
            </Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'finished' ? '#22C55E20' : '#F59E0B20' }]}>
          <Text style={[styles.statusText, { color: item.status === 'finished' ? '#22C55E' : '#F59E0B' }]}>
            {item.status === 'finished' ? 'Finalizado' : item.status === 'in_progress' ? 'En curso' : 'Programado'}
          </Text>
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
      <Text style={styles.title}>Partidos Abiertos</Text>
      {matches.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="football-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Sin partidos disponibles</Text>
          <Text style={styles.emptyText}>No hay torneos activos en este momento</Text>
        </View>
      ) : (
        <FlatList
          data={matches}
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
  title: { fontSize: 24, fontWeight: '700', color: '#11181C', paddingHorizontal: 20, paddingTop: 16, marginBottom: 16 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 12, gap: 12 },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E0F2FE', alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#687076' },
  cardSubtitle: { fontSize: 16, fontWeight: '600', color: '#11181C', marginTop: 2 },
  cardDate: { fontSize: 13, color: '#9BA1A6', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
});