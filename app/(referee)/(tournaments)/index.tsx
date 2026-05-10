import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function RefereeTournamentsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    try {
      // Resolve referee from auth (Phase 5 PR #1)
      const { data: { user } } = await supabase.auth.getUser();
      let refereeId: string | null = null;
      if (user) {
        const { data: referee } = await supabase
          .from('referees')
          .select('id')
          .eq('user_id', user.id)
          .single();
        refereeId = referee?.id ?? null;
      }

      if (!refereeId) {
        setData([]);
        setLoading(false);
        return;
      }

      // Get tournaments where this referee is assigned
      const { data: refsData, error: refsError } = await supabase
        .from('tournament_referees')
        .select('tournament_id, tournaments(*)')
        .eq('referee_id', refereeId);

      if (refsError) throw refsError;
      setData(refsData ?? []);
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
    const tournament = item.tournaments;
    return (
      <Pressable
        style={styles.card}
        onPress={() => router.push(`/(referee)/(tournaments)/${tournament.id}/index`)}
      >
        <View style={styles.cardIcon}>
          <Ionicons name="trophy" size={24} color="#0a7ea4" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{tournament?.name ?? '—'}</Text>
          <Text style={styles.cardSubtitle}>
            {tournament?.type?.toUpperCase()} • {tournament?.category}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
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
      <Text style={styles.title}>Torneos Asignados</Text>

      {data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="trophy-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Sin torneos asignados</Text>
          <Text style={styles.emptyText}>
            Un superadmin debe asignarte a un torneo para comenzar
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.tournament_id}
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
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  cardSubtitle: { fontSize: 13, color: '#687076', marginTop: 2 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
});