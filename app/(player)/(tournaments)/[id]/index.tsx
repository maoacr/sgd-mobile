import { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTournament } from '@/lib/tournaments';
import { applyToTournament } from '@/lib/tournaments';
import { getPlayerFromAuth } from '@/lib/players';
import { supabase } from '@/lib/supabase';

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

export default function PlayerTournamentDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);

  async function loadData() {
    if (!id) return;
    try {
      // Phase 5 PR #1: resolve player from auth
      const player = await getPlayerFromAuth();
      if (!player) {
        Alert.alert('Sin registro', 'No estás registrado como jugador. Contacta al admin.');
        setLoading(false);
        return;
      }
      setMyPlayerId(player.id);

      const data = await getTournament(id);
      setTournament(data);
    } catch (err) {
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [id]);

  async function handleApply() {
    if (!id || !myPlayerId) return;
    setApplying(true);
    try {
      // Player applies via their squad's team — get team_id from player
      const { data: player } = await supabase
        .from('players')
        .select('team_id')
        .eq('id', myPlayerId)
        .single();

      if (!player?.team_id) {
        Alert.alert('Error', 'No tienes equipo asociado para postulación.');
        setApplying(false);
        return;
      }

      await applyToTournament(player.team_id, id);
      Alert.alert('Postulación enviada', 'Tu equipo se ha postulado para este torneo.');
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo enviar la postulación.');
    } finally {
      setApplying(false);
    }
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
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Tipo</Text>
          <Text style={styles.infoValue}>{tournament.type.toUpperCase()}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Categoría</Text>
          <Text style={styles.infoValue}>{CATEGORY_LABELS[tournament.category] ?? tournament.category}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Máx. equipos</Text>
          <Text style={styles.infoValue}>{tournament.max_teams}</Text>
        </View>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha de inicio</Text>
          <Text style={styles.detailValue}>
            {new Date(tournament.start_date).toLocaleDateString('es-CO')}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estado</Text>
          <Text style={styles.detailValue}>
            {STATUS_LABELS[tournament.status] ?? tournament.status}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Creado</Text>
          <Text style={styles.detailValue}>
            {new Date(tournament.created_at).toLocaleDateString('es-CO')}
          </Text>
        </View>
      </View>

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
  infoRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12 },
  infoItem: { flex: 1, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, alignItems: 'center' },
  infoLabel: { fontSize: 11, color: '#687076', marginBottom: 4 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#11181C' },
  detailCard: { marginHorizontal: 20, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, gap: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 14, color: '#687076' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#11181C' },
  applyButton: { marginHorizontal: 20, marginTop: 24, height: 52, backgroundColor: '#0a7ea4', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  applyButtonDisabled: { opacity: 0.6 },
  applyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});