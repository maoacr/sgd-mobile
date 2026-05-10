import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { getTournament, listTournamentTeams, applyToTournament } from '@/lib/tournaments';

const CATEGORY_LABELS: Record<string, string> = {
  amateur: 'Amateur',
  sub20: 'Sub-20',
  sub23: 'Sub-23',
  professional: 'Profesional',
  custom: 'Personalizado',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  active: 'Activo',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
};

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed': return '#22C55E';
    case 'pending': return '#F59E0B';
    default: return '#687076';
  }
}

export default function TeamTournamentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);

  async function resolveTeamId() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: team } = await supabase
      .from('teams')
      .select('id')
      .eq('user_id', user.id)
      .single();
    setMyTeamId(team?.id ?? null);
  }

  async function loadData() {
    if (!id) return;
    try {
      await resolveTeamId();
      const [tData, teamsData] = await Promise.all([
        getTournament(id),
        listTournamentTeams(id),
      ]);
      setTournament(tData);
      setTeams(teamsData ?? []);
    } catch (err) {
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleApply() {
    if (!id || !myTeamId) return;
    setApplying(true);
    try {
      await applyToTournament(myTeamId, id);
      Alert.alert('Postulación enviada', 'Tu equipo se ha postulado para este torneo.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo enviar la postulación.');
    } finally {
      setApplying(false);
    }
  }

  function renderTeam({ item }: { item: any }) {
    return (
      <View style={styles.teamCard}>
        <Text style={styles.teamName}>{item.team?.name ?? '—'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status === 'confirmed' ? 'Inscrito' : 'Pendiente'}
          </Text>
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

  const showApplyButton = tournament.status === 'draft';

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
          {tournament.type.toUpperCase()} • {CATEGORY_LABELS[tournament.category] ?? tournament.category}
        </Text>
        <Text style={styles.infoText}>
          {new Date(tournament.start_date).toLocaleDateString('es-CO')}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons name="people" size={18} color="#687076" />
          <Text style={styles.metaText}>{teams.length} / {tournament.max_teams} equipos</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaText}>{STATUS_LABELS[tournament.status] ?? tournament.status}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Equipos inscritos ({teams.length})</Text>

      {teams.length === 0 ? (
        <Text style={styles.emptyText}>Sin equipos inscritos aún</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => `${item.tournament_id}-${item.team_id}`}
          renderItem={renderTeam}
          contentContainerStyle={styles.teamList}
        />
      )}

      {showApplyButton && (
        <Pressable
          style={[styles.applyButton, applying && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={applying}
        >
          {applying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.applyButtonText}>Postularse</Text>
          )}
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#11181C' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  infoText: { fontSize: 13, color: '#687076' },
  metaRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 20, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: '#11181C', fontWeight: '500' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', paddingHorizontal: 20, marginBottom: 12 },
  teamList: { paddingHorizontal: 20, paddingBottom: 20 },
  teamCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 8 },
  teamName: { fontSize: 15, fontWeight: '600', color: '#11181C' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '600' },
  emptyText: { fontSize: 14, color: '#9BA1A6', textAlign: 'center', marginTop: 12, paddingHorizontal: 20 },
  applyButton: { marginHorizontal: 20, marginBottom: 40, height: 52, backgroundColor: '#0a7ea4', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  applyButtonDisabled: { opacity: 0.6 },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});