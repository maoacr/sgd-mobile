import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMatch } from '@/lib/tournaments';
import { listMatchEvents } from '@/lib/matches';

const STATUS_COLORS: Record<string, string> = {
  scheduled: '#F59E0B',
  in_progress: '#0a7ea4',
  finished: '#22C55E',
};

const EVENT_ICONS: Record<string, string> = {
  goal: 'football',
  own_goal: 'football-outline',
  yellow_card: 'square',
  red_card: 'square',
  substitution: 'swap-horizontal',
  penalty_scored: 'football',
  penalty_missed: 'close-circle',
};

export default function MatchDetailScreen() {
  const insets = useSafeAreaInsets();
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!matchId) return;
    try {
      const [m, e] = await Promise.all([getMatch(matchId), listMatchEvents(matchId)]);
      setMatch(m);
      setEvents(e ?? []);
    } catch (err) {
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [matchId]);

  if (loading || !match) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  const statusColor = STATUS_COLORS[match.status] ?? '#687076';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.headerTitle}>Detalle del Partido</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <View style={[styles.badge, { backgroundColor: `${statusColor}20` }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {match.status === 'scheduled' ? 'Programado' :
               match.status === 'in_progress' ? 'En curso' :
               match.status === 'finished' ? 'Finalizado' : match.status}
            </Text>
          </View>
        </View>

        <View style={styles.teamsCard}>
          <View style={styles.teamColumn}>
            <View style={styles.teamIcon}>
              <Ionicons name="shield" size={28} color="#0a7ea4" />
            </View>
            <Text style={styles.teamName}>{match.home_team?.name ?? 'Equipo Local'}</Text>
          </View>

          <View style={styles.scoreColumn}>
            {match.status === 'finished' && match.match_results ? (
              <Text style={styles.scoreText}>
                {match.match_results.home_score} - {match.match_results.away_score}
              </Text>
            ) : (
              <Text style={styles.vsText}>vs</Text>
            )}
          </View>

          <View style={styles.teamColumn}>
            <View style={styles.teamIcon}>
              <Ionicons name="shield" size={28} color="#8B5CF6" />
            </View>
            <Text style={styles.teamName}>{match.away_team?.name ?? 'Equipo Visitante'}</Text>
          </View>
        </View>

        {match.scheduled_at && (
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={16} color="#687076" />
            <Text style={styles.infoText}>
              {new Date(match.scheduled_at).toLocaleDateString('es-CO', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
        )}

        {match.venue?.name && (
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={16} color="#687076" />
            <Text style={styles.infoText}>{match.venue.name}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Línea de Eventos ({events.length})</Text>

        {events.length === 0 ? (
          <Text style={styles.emptyEvents}>Sin eventos registrados</Text>
        ) : (
          events.map((evt: any) => (
            <View key={evt.id} style={styles.eventRow}>
              <Text style={styles.eventMinute}>{evt.minute}'</Text>
              <View style={[styles.eventIcon, { backgroundColor: getEventColor(evt.event_type) }]}>
                <Ionicons name={getEventIcon(evt.event_type) as any} size={14} color="#fff" />
              </View>
              <Text style={styles.eventLabel}>{formatEventLabel(evt.event_type)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function getEventColor(type: string): string {
  switch (type) {
    case 'goal': case 'penalty_scored': return '#22C55E';
    case 'own_goal': case 'penalty_missed': return '#F59E0B';
    case 'yellow_card': return '#EAB308';
    case 'red_card': return '#DC2626';
    case 'substitution': return '#8B5CF6';
    default: return '#687076';
  }
}

function getEventIcon(type: string): string {
  return EVENT_ICONS[type] ?? 'football';
}

function formatEventLabel(type: string): string {
  const labels: Record<string, string> = {
    goal: 'Gol',
    own_goal: 'Gol en contra',
    yellow_card: 'Tarjeta amarilla',
    red_card: 'Tarjeta roja',
    substitution: 'Cambio',
    penalty_scored: 'Penal convertido',
    penalty_missed: 'Penal fallado',
  };
  return labels[type] ?? type;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#11181C' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  statusRow: { marginBottom: 16 },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  teamsCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, padding: 20, marginBottom: 16 },
  teamColumn: { flex: 1, alignItems: 'center' },
  teamIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  teamName: { fontSize: 14, fontWeight: '600', color: '#11181C', textAlign: 'center' },
  scoreColumn: { paddingHorizontal: 16 },
  scoreText: { fontSize: 28, fontWeight: '800', color: '#11181C' },
  vsText: { fontSize: 20, fontWeight: '600', color: '#9BA1A6' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: 14, color: '#687076' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', marginTop: 16, marginBottom: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  eventMinute: { fontSize: 13, fontWeight: '600', color: '#687076', width: 32 },
  eventIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  eventLabel: { flex: 1, fontSize: 14, color: '#11181C' },
  emptyEvents: { fontSize: 14, color: '#9BA1A6', textAlign: 'center', marginTop: 12 },
});