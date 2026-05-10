import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/use-auth';
import { getTeamWithMembers, getTeamInvitations, removeMember, promoteToAdmin, deleteTeam } from '@/lib/teams';

export default function TeamDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state: { user } } = useAuth();
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);

  const isAdmin = user?.id === team?.created_by ||
    members.some((m: any) => m.user_id === user?.id && m.role === 'admin');

  useEffect(() => { loadTeam(); }, [id]);

  async function loadTeam() {
    const data = await getTeamWithMembers(id);
    if (data) {
      setTeam(data.team);
      setMembers(data.members);
      const invs = await getTeamInvitations(id);
      setInvitations(invs);
    }
    setLoading(false);
  }

  async function handleRemove(userId: string) {
    Alert.alert('Expulsar miembro', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Expulsar', style: 'destructive',
        onPress: async () => {
          await removeMember(userId, id);
          loadTeam();
        },
      },
    ]);
  }

  async function handlePromote(userId: string) {
    await promoteToAdmin(userId, id);
    loadTeam();
  }

  async function handleDelete() {
    if (members.length > 1) {
      Alert.alert('Error', 'No puedes eliminar un equipo con miembros.');
      return;
    }
    Alert.alert('Eliminar equipo', '¿Eliminar definitivamente?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          await deleteTeam(id);
          router.back();
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center' }} />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.teamName}>{team?.name}</Text>
      </View>

      {team?.tagline && <Text style={styles.tagline}>{team.tagline}</Text>}
      {team?.email && <Text style={styles.info}>{team.email}</Text>}
      {team?.phone && <Text style={styles.info}>WhatsApp: {team.phone}</Text>}

      <Text style={styles.sectionTitle}>Miembros ({members.length})</Text>
      <FlatList
        data={members}
        keyExtractor={(item) => item.user_id}
        renderItem={({ item }) => (
          <View style={styles.memberRow}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {item.user?.first_name} {item.user?.last_name}
              </Text>
              <Text style={styles.memberRole}>{item.role}</Text>
            </View>
            {isAdmin && item.role !== 'admin' && (
              <View style={styles.memberActions}>
                <Pressable onPress={() => handlePromote(item.user_id)}>
                  <Ionicons name="arrow-up" size={20} color="#0a7ea4" />
                </Pressable>
                <Pressable onPress={() => handleRemove(item.user_id)}>
                  <Ionicons name="close" size={20} color="#E53E3E" />
                </Pressable>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Sin miembros</Text>}
        style={styles.list}
      />

      {invitations.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Invitaciones ({invitations.length})</Text>
          <FlatList
            data={invitations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.inviteRow}>
                <Text style={styles.inviteText}>{item.email || item.phone}</Text>
                <Text style={styles.inviteStatus}>{item.status}</Text>
              </View>
            )}
            style={styles.list}
          />
        </>
      )}

      {isAdmin && (
        <View style={styles.footer}>
          <Pressable
            style={styles.inviteButton}
            onPress={() => router.push(`/player/teams/${id}/invite`)}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.inviteButtonText}>Invitar</Text>
          </Pressable>
          {team?.created_by === user?.id && (
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteText}>Eliminar equipo</Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  backBtn: { padding: 4 },
  teamName: { fontSize: 22, fontWeight: '700', color: '#11181C' },
  tagline: { fontSize: 15, color: '#687076', marginBottom: 8 },
  info: { fontSize: 14, color: '#0a7ea4', marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#11181C', marginBottom: 12, marginTop: 16 },
  list: { flex: 1 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 15, fontWeight: '500', color: '#11181C' },
  memberRole: { fontSize: 13, color: '#687076' },
  memberActions: { flexDirection: 'row', gap: 16 },
  inviteRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  inviteText: { fontSize: 14, color: '#11181C' },
  inviteStatus: { fontSize: 12, color: '#687076' },
  empty: { fontSize: 14, color: '#687076', textAlign: 'center', marginTop: 20 },
  footer: { marginTop: 24, gap: 12, paddingBottom: 40 },
  inviteButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, backgroundColor: '#0a7ea4', borderRadius: 10 },
  inviteButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deleteButton: { alignItems: 'center', paddingVertical: 12 },
  deleteText: { color: '#E53E3E', fontSize: 14 },
});