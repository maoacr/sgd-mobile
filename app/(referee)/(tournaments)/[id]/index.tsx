import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTournament, listTournamentTeams } from '@/lib/tournaments';
import { listMatchesByTournament, updateMatchStatus } from '@/lib/matches';

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#F59E0B',
  in_progress: '#0a7ea4',
  finished: '#22C55E',
  postponed: '#9BA1A6',
  cancelled: '#DC2626',
};

export default function RefereeTournamentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!id) return;
    try {
      const [tData, matchesData] = await Promise.all([
        getTournament(id),
        listMatchesByTournament(id),
      ]);
      setTournament(tData);
      setMatches(matchesData ?? []);
    } catch (err) {
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleStartMatch(matchId: string) {
    try {
      await updateMatchStatus(matchId, 'in_progress');
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleFinishMatch(matchId: string) {
    Alert.prompt(
      'Resultado',
      'Ingresa el marcador como "HOME-AWAY" (ej: 2-1)',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Guardar',
          onPress: async (_score: string | undefined) => {
            try {
              const [homeScore, awayScore] = (_score ?? '0-0').split('-').map(Number);
              const { updateMatchScore } = await import('@/lib/matches');
              await updateMatchScore(matchId, homeScore, awayScore);
              await updateMatchStatus(matchId, 'finished');
              await loadData();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
      'plain-text',
      '0-0'
    );
  }

  function renderMatch({ item }: { item: any }) {
    const statusColor = STATUS_COLORS[item.status] ?? '#687076';
    return (
      <View style={styles.matchCard}>
        <View style={styles.matchHeader}>
          <Text style={styles.matchRound}>
            {item.group_name ? `${item.group_name} · ` : ''}
            Ronda {item.round ?? '—'}
          </Text>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {item.status === 'scheduled' ? 'Por jugar' :
               item.status === 'in_progress' ? 'En curso' :
               item.status === 'finished' ? 'Finalizado' : item.status}
            </Text>
          </View>
        </View>

        <View style={styles.teamsRow}>
          <Text style={styles.teamName}>{item.home_team?.name ?? 'Equipo local'}</Text>
          <Text style={styles.vs}>vs</Text>
          <Text style={styles.teamName}>{item.away_team?.name ?? 'Equipo visitante'}</Text>
        </View>

        <View style={styles.matchActions}>
          {item.status === 'scheduled' && (
            <Pressable style={styles.startButton} onPress={() => handleStartMatch(item.id)}>
              <Text style={styles.startButtonText}>Iniciar partido</Text>
            </Pressable>
          )}
          {item.status === 'in_progress' && (
            <Pressable style={styles.finishButton} onPress={() => handleFinishMatch(item.id)}>
              <Text style={styles.finishButtonText}>Registrar resultado</Text>
            </Pressable>
          )}
          {item.status === 'finished' && (
            <View style={styles.resultBadge}>
              <Text style={styles.resultText}>
                {item.match_results?.home_score ?? '?'} - {item.match_results?.away_score ?? '?'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  if (loading || !tournament) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{tournament.name}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>
          {tournament.type.toUpperCase()} • {tournament.category}
        </Text>
        <Text style={styles.infoText}>
          {new Date(tournament.start_date).toLocaleDateString('es-CO')}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Partidos ({matches.length})</Text>

      {matches.length === 0 ? (
        <Text style={styles.emptyText}>Sin partidos programados</Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={styles.matchList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#11181C' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 16 },
  infoText: { fontSize: 13, color: '#687076' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', paddingHorizontal: 20, marginBottom: 12 },
  matchList: { paddingHorizontal: 20, paddingBottom: 20 },
  matchCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 12 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  matchRound: { fontSize: 13, color: '#687076', fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  teamName: { flex: 1, fontSize: 15, fontWeight: '600', color: '#11181C', textAlign: 'center' },
  vs: { fontSize: 13, color: '#9BA1A6', paddingHorizontal: 12 },
  matchActions: { gap: 8 },
  startButton: { height: 40, backgroundColor: '#0a7ea4', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  startButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  finishButton: { height: 40, backgroundColor: '#22C55E', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  finishButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  resultBadge: { height: 40, backgroundColor: '#E0F2FE', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resultText: { fontSize: 16, fontWeight: '700', color: '#0a7ea4' },
  emptyText: { fontSize: 14, color: '#9BA1A6', textAlign: 'center', marginTop: 20, paddingHorizontal: 20 },
});