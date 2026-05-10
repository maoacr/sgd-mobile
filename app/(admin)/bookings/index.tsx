import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/use-auth';
import { venues, type Venue } from '@/lib/venues';
import { bookings, type Booking } from '@/lib/bookings';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AdminBookingsScreen() {
  const insets = useSafeAreaInsets();
  const { state: { user } } = useAuth();
  const [venueList, setVenueList] = useState<Venue[]>([]);
  const [bookingList, setBookingList] = useState<Booking[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    if (!user) return;
    try {
      const [venuesData, allBookings] = await Promise.all([
        venues.listByAdmin(user.id),
        bookings.list(),
      ]);
      setVenueList(venuesData);
      setBookingList(allBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredBookings = selectedVenue
    ? bookingList.filter((b) => b.venue_id === selectedVenue)
    : bookingList;

  const formatDate = (date: string) => {
    const d = parseISO(date);
    if (isToday(d)) return 'Hoy';
    if (isTomorrow(d)) return 'Mañana';
    return format(d, 'dd MMM', { locale: es });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#22C55E';
      case 'pending':
        return '#F59E0B';
      case 'cancelled':
        return '#DC2626';
      case 'completed':
        return '#687076';
      default:
        return '#687076';
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const venue = venueList.find((v) => v.id === item.venue_id);
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{venue?.name || 'Cancha'}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(item.status) }]}
            >
              {item.status}
            </Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.cardRow}>
            <Ionicons name="calendar" size={16} color="#687076" />
            <Text style={styles.cardText}>{formatDate(item.booking_date)}</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="time" size={16} color="#687076" />
            <Text style={styles.cardText}>
              {item.start_time} - {item.end_time}
            </Text>
          </View>
          {item.type !== 'open' && (
            <View style={styles.cardRow}>
              <Ionicons name="football" size={16} color="#687076" />
              <Text style={styles.cardText}>
                {item.type === 'tournament'
                  ? 'Torneo'
                  : item.opponent_team || 'Partido privado'}
              </Text>
            </View>
          )}
        </View>
        {item.status === 'pending' && (
          <View style={styles.cardActions}>
            <Pressable
              style={[styles.actionButton, styles.confirmButton]}
              onPress={async () => {
                try {
                  await bookings.confirm(item.id);
                  await loadData();
                } catch (err: any) {
                  Alert.alert('Error', err.message);
                }
              }}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </Pressable>
            <Pressable
              style={[styles.actionButton, styles.cancelButton]}
              onPress={async () => {
                try {
                  await bookings.cancel(item.id);
                  await loadData();
                } catch (err: any) {
                  Alert.alert('Error', err.message);
                }
              }}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

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
        <Text style={styles.title}>Reservas</Text>
      </View>

      {venueList.length > 1 && (
        <View style={styles.filter}>
          <Pressable
            style={[
              styles.filterChip,
              !selectedVenue && styles.filterChipActive,
            ]}
            onPress={() => setSelectedVenue(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                !selectedVenue && styles.filterChipTextActive,
              ]}
            >
              Todas
            </Text>
          </Pressable>
          {venueList.map((v) => (
            <Pressable
              key={v.id}
              style={[
                styles.filterChip,
                selectedVenue === v.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedVenue(v.id)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedVenue === v.id && styles.filterChipTextActive,
                ]}
              >
                {v.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {filteredBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Sin reservas</Text>
          <Text style={styles.emptyText}>
            Las reservas aparecerán aquí cuando los clientes reserven
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
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
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  filter: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },
  filterChipActive: { backgroundColor: '#0a7ea4' },
  filterChipText: { fontSize: 14, color: '#687076' },
  filterChipTextActive: { color: '#fff', fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  cardBody: { gap: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardText: { fontSize: 14, color: '#687076' },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  confirmButton: { backgroundColor: '#22C55E' },
  confirmButtonText: { color: '#fff', fontWeight: '600' },
  cancelButton: { backgroundColor: '#FEE2E2' },
  cancelButtonText: { color: '#DC2626', fontWeight: '600' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
});