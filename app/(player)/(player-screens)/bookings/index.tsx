import { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/features/auth/use-auth';
import { venues, type Venue } from '@/lib/venues';
import { bookings, type Booking } from '@/lib/bookings';
import { format, parseISO, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function PlayerBookingsScreen() {
  const { state: { user } } = useAuth();
  const [bookingList, setBookingList] = useState<Booking[]>([]);
  const [venueMap, setVenueMap] = useState<Record<string, Venue>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadBookings() {
    if (!user) return;
    try {
      const data = await bookings.listByUser(user.id);
      setBookingList(data);

      const venueIds = [...new Set(data.map((b) => b.venue_id))];
      const venuesData = await Promise.all(
        venueIds.map((id) => venues.get(id))
      );
      const map: Record<string, Venue> = {};
      venuesData.forEach((v) => {
        if (v) map[v.id] = v;
      });
      setVenueMap(map);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const formatDate = (date: string) => {
    const d = parseISO(date);
    if (isToday(d)) return 'Hoy';
    if (isTomorrow(d)) return 'Mañana';
    return format(d, 'dd MMM', { locale: es });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#22C55E';
      case 'pending': return '#F59E0B';
      case 'cancelled': return '#DC2626';
      case 'completed': return '#687076';
      default: return '#687076';
    }
  };

  const renderBooking = ({ item }: { item: Booking }) => {
    const venue = venueMap[item.venue_id];
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{venue?.name || 'Cancha'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status === 'pending' ? 'Pendiente' :
               item.status === 'confirmed' ? 'Confirmada' :
               item.status === 'cancelled' ? 'Cancelada' : 'Completada'}
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
            <Text style={styles.cardText}>{item.start_time} - {item.end_time}</Text>
          </View>
          {item.type !== 'open' && (
            <View style={styles.cardRow}>
              <Ionicons name="football" size={16} color="#687076" />
              <Text style={styles.cardText}>
                {item.type === 'tournament' ? 'Torneo' : item.opponent_team || 'Privado'}
              </Text>
            </View>
          )}
        </View>
        {item.status === 'pending' && (
          <View style={styles.cardActions}>
            <Text style={styles.cancelHint}>Esperando confirmación del administrador</Text>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Reservas</Text>
      </View>

      {bookingList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={64} color="#E2E8F0" />
          <Text style={styles.emptyTitle}>Sin reservas</Text>
          <Text style={styles.emptyText}>
            Reserva una cancha para jugar con tu equipo
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookingList}
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
  statusText: { fontSize: 12, fontWeight: '600' },
  cardBody: { gap: 8 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardText: { fontSize: 14, color: '#687076' },
  cardActions: { marginTop: 12 },
  cancelHint: { fontSize: 13, color: '#9BA1A6', fontStyle: 'italic' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#11181C', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 8 },
});