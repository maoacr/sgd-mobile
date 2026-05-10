import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { venues, type Venue } from '@/lib/venues';

export default function ExploreScreen() {
  const [venueList, setVenueList] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  async function loadVenues() {
    try {
      const data = await venues.list();
      setVenueList(data);
    } catch (err) {
      console.error('Error loading venues:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVenues();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVenues();
    setRefreshing(false);
  };

  const filteredVenues = search
    ? venueList.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.address?.toLowerCase().includes(search.toLowerCase())
      )
    : venueList;

  const renderVenue = ({ item }: { item: Venue }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(player)/venues/${item.id}`)}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="football" size={24} color="#0a7ea4" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle}>
          {item.type.toUpperCase()} • {item.surface}
        </Text>
        {item.address && (
          <Text style={styles.cardAddress} numberOfLines={1}>
            <Ionicons name="location" size={12} color="#9BA1A6" /> {item.address}
          </Text>
        )}
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Canchas</Text>
        <Text style={styles.subtitle}>
          {venueList.length} {venueList.length === 1 ? 'cancha' : 'canchas'}{' '}
          disponibles
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9BA1A6" />
        <TextInput
          style={styles.search}
          placeholder="Buscar canchas..."
          placeholderTextColor="#9BA1A6"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9BA1A6" />
          </Pressable>
        )}
      </View>

      {filteredVenues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="football-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>
            {search ? 'Sin resultados' : 'Sin canchas'}
          </Text>
          <Text style={styles.emptyText}>
            {search
              ? 'Intenta con otros términos de búsqueda'
              : 'No hay canchas disponibles aún'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVenues}
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
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  subtitle: { fontSize: 14, color: '#687076', marginTop: 4 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    gap: 12,
  },
  search: { flex: 1, fontSize: 16, color: '#11181C' },
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
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
});
