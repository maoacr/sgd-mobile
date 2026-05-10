import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import {
  getTournament,
  updateTournament,
  deleteTournament,
  listTournamentTeams,
  listTournamentMatches,
  type Tournament,
} from '@/lib/tournaments';

const STATUS_COLORS: Record<string, string> = {
  draft: '#F59E0B',
  active: '#22C55E',
  finished: '#687076',
  cancelled: '#DC2626',
};

export default function TournamentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refereeMatches, setRefereeMatches] = useState<any[]>([]);
  const [availableReferees, setAvailableReferees] = useState<any[]>([]);
  const [showRefereeModal, setShowRefereeModal] = useState(false);
  const [selectedMatchReferee, setSelectedMatchReferee] = useState<string | null>(null);
  const [selectedReferee, setSelectedReferee] = useState<string>('');

  async function loadData() {
    if (!id) return;
    try {
      const [tData, teamsData] = await Promise.all([
        getTournament(id),
        listTournamentTeams(id),
      ]);
      setTournament(tData);
      setTeams(teamsData ?? []);
    } catch (err) {
      console.error('Error loading tournament:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [id]);

  useEffect(() => {
    async function loadRefereeData() {
      if (!id) return;
      const matches = await listTournamentMatches(id);
      setRefereeMatches(matches ?? []);

      const { data: referees } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'referee');
      setAvailableReferees(referees ?? []);
    }
    loadRefereeData();
  }, [id]);

  async function handleToggleStatus() {
    if (!tournament) return;
    const newStatus = tournament.status === 'draft' ? 'active' : 'draft';
    try {
      await updateTournament(tournament.id, { status: newStatus });
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  async function handleDelete() {
    Alert.alert('Eliminar torneo', '¿Estás seguro? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await deleteTournament(id!);
          router.back();
        } catch (err: any) {
          Alert.alert('Error', err.message);
        }
      }},
    ]);
  }

  async function handleAssignReferee(matchId: string) {
    if (!selectedReferee) {
      Alert.alert('Selecciona un árbitro');
      return;
    }
    try {
      await supabase.from('matches').update({ referee_id: selectedReferee }).eq('id', matchId);
      Alert.alert('Árbitro asignado');
      setSelectedReferee('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  if (loading || !tournament) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const statusColor = STATUS_COLORS[tournament.status] ?? '#687076';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{tournament.name}</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo</Text>
          <Text style={styles.infoValue}>{tournament.type.toUpperCase()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Categoría</Text>
          <Text style={styles.infoValue}>{tournament.category}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha inicio</Text>
          <Text style={styles.infoValue}>
            {new Date(tournament.start_date).toLocaleDateString('es-CO')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Equipos</Text>
          <Text style={styles.infoValue}>{tournament.max_teams}</Text>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Estado</Text>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{tournament.status}</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Equipos postulados ({teams.length})</Text>
      {teams.length === 0 ? (
        <Text style={styles.emptyText}>Sin postulaciones aún</Text>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.team_id}
          renderItem={({ item }) => (
            <View style={styles.teamRow}>
              <Text style={styles.teamName}>{item.team?.name ?? '—'}</Text>
              <View style={[styles.badge, {
                backgroundColor: item.status === 'confirmed' ? '#DCFCE720' : '#FEF3C720',
              }]}>
                <Text style={{
                  fontSize: 12,
                  color: item.status === 'confirmed' ? '#22C55E' : '#F59E0B',
                }}>
                  {item.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                </Text>
              </View>
            </View>
          )}
          style={styles.teamList}
        />
      )}

      {/* Arbitraje */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arbitraje</Text>

        <View style={styles.refereeSection}>
          <Text style={styles.refereeLabel}>Asignar árbitro a partido</Text>

          {refereeMatches.length === 0 ? (
            <Text style={styles.emptyText}>No hay partidos en este torneo</Text>
          ) : (
            refereeMatches.map((match: any) => (
              <View key={match.id} style={styles.refereeRow}>
                <View style={styles.refereeMatchInfo}>
                  <Text style={styles.refereeMatchText}>
                    {match.home_team?.name ?? 'Local'} vs {match.away_team?.name ?? 'Visitante'}
                  </Text>
                  <Text style={styles.refereeMatchRound}>
                    {match.group_name ? `${match.group_name} · ` : ''}Ronda {match.round ?? '—'}
                  </Text>
                </View>

                <Pressable
                  style={styles.assignButton}
                  onPress={() => {
                    setSelectedMatchReferee(match.id);
                    setShowRefereeModal(true);
                  }}
                >
                  <Text style={styles.assignButtonText}>
                    {match.referee_id ? 'Cambiar' : 'Asignar'}
                  </Text>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Referee Picker Modal */}
      {showRefereeModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Árbitro</Text>
            {availableReferees.length === 0 ? (
              <Text style={styles.modalEmpty}>No hay árbitros disponibles</Text>
            ) : (
              availableReferees.map((ref: any) => (
                <Pressable
                  key={ref.id}
                  style={styles.refereeOption}
                  onPress={async () => {
                    try {
                      // Direct match assignment — tournament_referees is for general tournament assignment,
                      // matches.referee_id is for specific match assignment (correct semantic here)
                      await supabase.from('matches').update({ referee_id: ref.id }).eq('id', selectedMatchReferee!);
                      setShowRefereeModal(false);
                      // Refresh
                      const matches = await listTournamentMatches(id);
                      setRefereeMatches(matches ?? []);
                    } catch (err: any) {
                      Alert.alert('Error', err.message);
                    }
                  }}
                >
                  <Text style={styles.refereeOptionText}>{ref.name}</Text>
                  <Text style={styles.refereeOptionEmail}>{ref.email}</Text>
                </Pressable>
              ))
            )}
            <Pressable style={styles.modalCancel} onPress={() => setShowRefereeModal(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.toggleButton} onPress={handleToggleStatus}>
          <Text style={styles.toggleButtonText}>
            {tournament.status === 'draft' ? 'Activar torneo' : 'Pasar a borrador'}
          </Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Eliminar torneo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#11181C' },
  infoCard: { backgroundColor: '#F8FAFC', marginHorizontal: 20, borderRadius: 12, padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  infoLabel: { fontSize: 14, color: '#687076' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#11181C' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', marginBottom: 12, paddingHorizontal: 20 },
  emptyText: { fontSize: 14, color: '#9BA1A6', textAlign: 'center', marginTop: 20, paddingHorizontal: 20 },
  teamList: { flex: 1, paddingHorizontal: 20 },
  teamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  teamName: { fontSize: 15, fontWeight: '500', color: '#11181C' },
  section: { marginTop: 24, paddingHorizontal: 20 },
  refereeSection: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16 },
  refereeLabel: { fontSize: 14, color: '#687076', marginBottom: 12 },
  refereeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 12 },
  refereeMatchInfo: { flex: 1 },
  refereeMatchText: { fontSize: 14, fontWeight: '600', color: '#11181C' },
  refereeMatchRound: { fontSize: 12, color: '#687076', marginTop: 2 },
  assignButton: { height: 36, paddingHorizontal: 14, backgroundColor: '#0a7ea4', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  assignButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  actions: { padding: 20, gap: 12 },
  toggleButton: { height: 48, backgroundColor: '#0a7ea4', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deleteButton: { alignItems: 'center', paddingVertical: 12 },
  deleteButtonText: { color: '#DC2626', fontSize: 14, fontWeight: '500' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContent: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '85%', maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#11181C', marginBottom: 16, textAlign: 'center' },
  modalEmpty: { fontSize: 14, color: '#687076', textAlign: 'center', paddingVertical: 20 },
  refereeOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  refereeOptionText: { fontSize: 15, fontWeight: '600', color: '#11181C' },
  refereeOptionEmail: { fontSize: 13, color: '#687076', marginTop: 2 },
  modalCancel: { marginTop: 16, height: 44, backgroundColor: '#F1F5F9', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '600', color: '#687076' },
});