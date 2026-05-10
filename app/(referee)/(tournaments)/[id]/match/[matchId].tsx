import { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { getMatch } from '@/lib/tournaments';
import { listMatchEvents, addMatchEvent, updateMatchScore, updateMatchStatus, type MatchEvent } from '@/lib/matches';

export default function RefereeMatchScreen() {
  const { id, matchId } = useLocalSearchParams<{ id: string; matchId: string }>();
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');
  const [savingScore, setSavingScore] = useState(false);

  async function loadData() {
    if (!matchId) return;
    try {
      const [m, e] = await Promise.all([
        getMatch(matchId),
        listMatchEvents(matchId),
      ]);
      setMatch(m);
      setEvents(e ?? []);
      if (m?.match_results) {
        setHomeScore(String(m.match_results.home_score));
        setAwayScore(String(m.match_results.away_score));
      }
    } catch (err) {
      console.error('Error loading:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [matchId]);

  async function handleSaveScore() {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    if (isNaN(home) || isNaN(away) || home < 0 || home > 99 || away < 0 || away > 99) {
      Alert.alert('Resultado inválido', 'Los goles deben ser entre 0 y 99.');
      return;
    }
    setSavingScore(true);
    try {
      const { updateMatchScore } = await import('@/lib/matches');
      await updateMatchScore(matchId!, home, away);
      await updateMatchStatus(matchId!, 'finished');
      Alert.alert('Resultado guardado', `${home} - ${away}`);
      await loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSavingScore(false);
    }
  }

  if (loading || !match) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {match.home_team?.name ?? 'Local'} vs {match.away_team?.name ?? 'Visitante'}
      </Text>

      {/* Score entry */}
      <View style={styles.scoreSection}>
        <Text style={styles.scoreSectionTitle}>Registrar Resultado</Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreInput}>
            <Text style={styles.scoreLabel}>{match?.home_team?.name ?? 'Local'}</Text>
            <Pressable style={styles.minusBtn} onPress={() => setHomeScore(prev => String(Math.max(0, parseInt(prev || '0') - 1)))}>
              <Ionicons name="remove" size={20} color="#11181C" />
            </Pressable>
            <Text style={styles.scoreValue}>{homeScore}</Text>
            <Pressable style={styles.plusBtn} onPress={() => setHomeScore(prev => String(parseInt(prev || '0') + 1))}>
              <Ionicons name="add" size={20} color="#11181C" />
            </Pressable>
          </View>

          <Text style={styles.scoreSeparator}>—</Text>

          <View style={styles.scoreInput}>
            <Text style={styles.scoreLabel}>{match?.away_team?.name ?? 'Visitante'}</Text>
            <Pressable style={styles.minusBtn} onPress={() => setAwayScore(prev => String(Math.max(0, parseInt(prev || '0') - 1)))}>
              <Ionicons name="remove" size={20} color="#11181C" />
            </Pressable>
            <Text style={styles.scoreValue}>{awayScore}</Text>
            <Pressable style={styles.plusBtn} onPress={() => setAwayScore(prev => String(parseInt(prev || '0') + 1))}>
              <Ionicons name="add" size={20} color="#11181C" />
            </Pressable>
          </View>
        </View>

        <Pressable style={[styles.saveScoreButton, savingScore && styles.saveScoreDisabled]} onPress={handleSaveScore} disabled={savingScore}>
          <Text style={styles.saveScoreText}>Guardar Resultado</Text>
        </Pressable>
      </View>

      <Text style={styles.eventsTitle}>Eventos del partido ({events.length})</Text>
      {events.length === 0 ? (
        <Text style={styles.emptyEvents}>Sin eventos registrados</Text>
      ) : (
        events.map((evt) => (
          <View key={evt.id} style={styles.eventRow}>
            <Text style={styles.eventMinute}>{evt.minute}'</Text>
            <Text style={styles.eventType}>{evt.event_type}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#11181C', marginBottom: 16, textAlign: 'center' },
  scoreSection: { padding: 16, backgroundColor: '#F8FAFC', borderRadius: 12, marginBottom: 24 },
  scoreSectionTitle: { fontSize: 16, fontWeight: '600', color: '#11181C', marginBottom: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  scoreInput: { alignItems: 'center', gap: 8 },
  scoreLabel: { fontSize: 12, color: '#687076' },
  minusBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  plusBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' },
  scoreValue: { fontSize: 28, fontWeight: '800', color: '#11181C' },
  scoreSeparator: { fontSize: 24, fontWeight: '600', color: '#9BA1A6' },
  saveScoreButton: { marginTop: 16, height: 48, backgroundColor: '#22C55E', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  saveScoreDisabled: { opacity: 0.6 },
  saveScoreText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  eventsTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', marginBottom: 12 },
  eventRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', gap: 12 },
  eventMinute: { fontSize: 13, fontWeight: '600', color: '#687076', width: 32 },
  eventType: { fontSize: 14, color: '#11181C', textTransform: 'capitalize' },
  emptyEvents: { fontSize: 14, color: '#9BA1A6', textAlign: 'center', marginTop: 12 },
});