import { useState, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { listMatchEvents, addMatchEvent } from '@/lib/matches';
import type { MatchEvent } from '@/lib/matches';
import { getMatch } from '@/lib/tournaments';

const EVENT_TYPES: { type: MatchEvent['event_type']; label: string; icon: string }[] = [
  { type: 'goal', label: 'Gol', icon: 'football' },
  { type: 'own_goal', label: 'Gol en contra', icon: 'football-outline' },
  { type: 'yellow_card', label: 'Tarjeta amarilla', icon: 'square' },
  { type: 'red_card', label: 'Tarjeta roja', icon: 'square' },
  { type: 'substitution', label: 'Cambio', icon: 'swap-horizontal' },
  { type: 'penalty_scored', label: 'Penal convertido', icon: 'football' },
  { type: 'penalty_missed', label: 'Penal fallado', icon: 'close-circle' },
];

export default function MatchEventScreen() {
  const insets = useSafeAreaInsets();
  const { id: tournamentId, matchId } = useLocalSearchParams<{ id: string; matchId: string }>();
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [minute, setMinute] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<MatchEvent['event_type'] | null>(null);
  const [matchData, setMatchData] = useState<any>(null);

  async function loadEvents() {
    if (!matchId) return;
    try {
      // Phase 5 PR #1: get match to resolve team_id for events
      const match = await getMatch(matchId);
      setMatchData(match);

      const data = await listMatchEvents(matchId);
      setEvents(data);
    } catch (err) {
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, [matchId]);

  async function handleAddEvent() {
    if (!selectedEvent || !minute.trim()) {
      Alert.alert('Campo requerido', 'Selecciona el tipo de evento y el minuto.');
      return;
    }
    // Phase 5 PR #1: use home_team_id from match record
    const team_id = matchData?.home_team_id;
    if (!team_id) {
      Alert.alert('Error', 'No se pudo determinar el equipo.');
      return;
    }
    setSaving(true);
    try {
      await addMatchEvent({
        match_id: matchId!,
        team_id,
        event_type: selectedEvent,
        minute: parseInt(minute) || 0,
      });
      setMinute('');
      setSelectedEvent(null);
      await loadEvents();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  }

  function getEventIcon(type: string) {
    const def = EVENT_TYPES.find((e) => e.type === type);
    return def?.icon ?? 'football';
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
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.headerTitle}>Registrar Evento</Text>
      </View>

      <View style={styles.eventSelector}>
        <Text style={styles.selectorLabel}>Tipo de evento</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventTypes}>
          {EVENT_TYPES.map((evt) => (
            <Pressable
              key={evt.type}
              style={[styles.eventType, selectedEvent === evt.type && styles.eventTypeSelected]}
              onPress={() => setSelectedEvent(evt.type)}
            >
              <Ionicons
                name={getEventIcon(evt.type) as any}
                size={20}
                color={selectedEvent === evt.type ? '#fff' : '#687076'}
              />
              <Text style={[styles.eventTypeText, selectedEvent === evt.type && styles.eventTypeTextSelected]}>
                {evt.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.minuteInput}>
        <Text style={styles.minuteLabel}>Minuto</Text>
        <View style={styles.minuteRow}>
          <Pressable style={styles.minuteButton} onPress={() => setMinute(prev => String(Math.max(0, parseInt(prev || '0') - 1)))}>
            <Ionicons name="remove" size={20} color="#11181C" />
          </Pressable>
          <View style={styles.minuteValue}>
            <Text style={styles.minuteText}>{minute || '0'}</Text>
          </View>
          <Pressable style={styles.minuteButton} onPress={() => setMinute(prev => String(parseInt(prev || '0') + 1))}>
            <Ionicons name="add" size={20} color="#11181C" />
          </Pressable>
        </View>
      </View>

      <Pressable style={[styles.addButton, saving && styles.addButtonDisabled]} onPress={handleAddEvent} disabled={saving}>
        <Text style={styles.addButtonText}>Agregar evento</Text>
      </Pressable>

      <Text style={styles.eventsTitle}>Eventos registrados ({events.length})</Text>
      <ScrollView style={styles.eventsList}>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>Sin eventos registrados</Text>
        ) : (
          events.map((evt) => (
            <View key={evt.id} style={styles.eventRow}>
              <View style={[styles.eventIcon, { backgroundColor: getEventColor(evt.event_type) }]}>
                <Ionicons name={getEventIcon(evt.event_type) as any} size={16} color="#fff" />
              </View>
              <Text style={styles.eventLabel}>
                {EVENT_TYPES.find((e) => e.type === evt.event_type)?.label ?? evt.event_type}
              </Text>
              <Text style={styles.eventMinute}>{evt.minute}'</Text>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#11181C' },
  eventSelector: { paddingHorizontal: 20, marginBottom: 16 },
  selectorLabel: { fontSize: 14, fontWeight: '500', color: '#11181C', marginBottom: 8 },
  eventTypes: { gap: 8, paddingBottom: 4 },
  eventType: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  eventTypeSelected: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  eventTypeText: { fontSize: 13, color: '#687076' },
  eventTypeTextSelected: { color: '#fff', fontWeight: '600' },
  minuteInput: { paddingHorizontal: 20, marginBottom: 16 },
  minuteLabel: { fontSize: 14, fontWeight: '500', color: '#11181C', marginBottom: 8 },
  minuteRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  minuteButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  minuteValue: { width: 64, height: 44, backgroundColor: '#F8FAFC', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  minuteText: { fontSize: 20, fontWeight: '700', color: '#11181C' },
  addButton: { marginHorizontal: 20, height: 48, backgroundColor: '#0a7ea4', borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  addButtonDisabled: { opacity: 0.6 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  eventsTitle: { fontSize: 16, fontWeight: '600', color: '#11181C', paddingHorizontal: 20, marginBottom: 12 },
  eventsList: { flex: 1, paddingHorizontal: 20 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  eventIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  eventLabel: { flex: 1, fontSize: 14, color: '#11181C' },
  eventMinute: { fontSize: 14, fontWeight: '600', color: '#687076' },
  emptyText: { fontSize: 14, color: '#9BA1A6', textAlign: 'center', marginTop: 20 },
});