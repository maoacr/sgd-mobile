import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/use-auth';
import { venues, type Venue } from '@/lib/venues';

export default function AdminVenuesScreen() {
  const insets = useSafeAreaInsets();
  const { state: { user } } = useAuth();
  const [venueList, setVenueList] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadVenues() {
    if (!user) return;
    try {
      const data = await venues.listByAdmin(user.id);
      setVenueList(data);
    } catch (err) {
      console.error('Error loading venues:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVenues();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVenues();
    setRefreshing(false);
  };

  const renderVenue = ({ item }: { item: Venue }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(admin)/venues/${item.id}`)}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="football" size={24} color="#0a7ea4" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.type.toUpperCase()} • {item.surface}
        </Text>
        <Text style={styles.cardAddress} numberOfLines={1}>
          {item.address || 'Sin dirección'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9BA1A6" />
    </Pressable>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Canchas</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(admin)/venues/new')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {venueList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="football-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Sin canchas aún</Text>
          <Text style={styles.emptyText}>
            Agrega tu primera cancha para empezar a recibir reservas
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push('/(admin)/venues/new')}
          >
            <Text style={styles.emptyButtonText}>Agregar Cancha</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={venueList}
          keyExtractor={(item) => item.id}
          renderItem={renderVenue}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  cardSubtitle: { fontSize: 13, color: '#687076', marginTop: 2 },
  cardAddress: { fontSize: 13, color: '#9BA1A6', marginTop: 2 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: {
    fontSize: 15,
    color: '#687076',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
  },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});