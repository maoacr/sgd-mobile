import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/use-auth';
import { useRouter } from 'expo-router';
import { getTeamTournaments } from '@/lib/tournaments';

export default function TeamTournamentsScreen() {
  const insets = useSafeAreaInsets();
  const { state: { user } } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      // Resolve team from auth (Phase 5 PR #1)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData([]);
        setLoading(false);
        return;
      }

      const { data: team } = await supabase
        .from('teams')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!team) {
        setData([]);
        setLoading(false);
        return;
      }

      const result = await getTeamTournaments(team.id);
      setData(result ?? []);
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

  function getStatusColor(status: string) {
    switch (status) {
      case 'confirmed': return '#22C55E';
      case 'pending': return '#F59E0B';
      default: return '#687076';
    }
  }

  function renderItem({ item }: { item: any }) {
    const tournament = item.tournament;
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/(team)/(tournaments)/${tournament.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{tournament?.name ?? '—'}</Text>
          <View style={[styles.badge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>
              {item.status === 'confirmed' ? 'Inscrito' : 'Postulación pendiente'}
            </Text>
          </View>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardType}>{tournament?.type?.toUpperCase()}</Text>
          <Text style={styles.cardDate}>
            Inicio: {tournament?.start_date ? new Date(tournament.start_date).toLocaleDateString('es-CO') : '—'}
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
      <Text style={styles.title}>Mis Torneos</Text>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Sin torneos</Text>
          <Text style={styles.emptyText}>Tu equipo aún no está inscrito en ningún torneo</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => `${item.tournament_id}-${item.team_id}`}
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
  card: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#11181C', marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cardInfo: { gap: 4 },
  cardType: { fontSize: 13, color: '#687076', fontWeight: '500' },
  cardDate: { fontSize: 13, color: '#9BA1A6' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
});