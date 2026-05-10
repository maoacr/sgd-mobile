import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { venues, type Venue } from '@/lib/venues';
import { bookings } from '@/lib/bookings';

export default function VenueDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [venueBookings, setVenueBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVenue(); }, [id]);

  async function loadVenue() {
    try {
      const [venueData, bookingsData] = await Promise.all([
        venues.get(id!),
        bookings.listByVenue(id!),
      ]);
      setVenue(venueData);
      setVenueBookings(bookingsData);
    } catch (err) {
      console.error('Error loading venue:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Eliminar Cancha',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await venues.delete(id!);
              router.back();
            } catch (err: any) {
              Alert.alert('Error', err.message);
            }
          },
        },
      ],
    );
  }

  if (loading || !venue) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.headerTitle}>{venue.name}</Text>
        <Pressable onPress={() => router.push(`/(admin)/venues/${id}/slots`)} style={styles.editBtn}>
          <Ionicons name="time-outline" size={24} color="#0a7ea4" />
        </Pressable>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tipo</Text>
          <Text style={styles.infoValue}>{venue.type.toUpperCase()} • {venue.surface}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Capacidad</Text>
          <Text style={styles.infoValue}>{venue.capacity} jugadores</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Horario</Text>
          <Text style={styles.infoValue}>{venue.opens_at} - {venue.closes_at}</Text>
        </View>
        {venue.address && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dirección</Text>
            <Text style={styles.infoValue}>{venue.address}</Text>
          </View>
        )}
        {venue.contact_phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono</Text>
            <Text style={styles.infoValue}>{venue.contact_phone}</Text>
          </View>
        )}
        {venue.contact_email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{venue.contact_email}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Comodidades</Text>
      <View style={styles.amenitiesGrid}>
        {venue.has_roof && <Amenity icon="water" label="Techo" />}
        {venue.has_lights && <Amenity icon="bulb" label="Luces" />}
        {venue.has_graderia && <Amenity icon="people" label="Gradería" />}
        {venue.has_bathrooms && <Amenity icon="water-outline" label="Baños" />}
        {venue.has_parking && <Amenity icon="car" label="Parqueadero" />}
      </View>

      {venue.description && (
        <>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>{venue.description}</Text>
        </>
      )}

      <Text style={styles.sectionTitle}>Próximas Reservas</Text>
      {venueBookings.length === 0 ? (
        <Text style={styles.emptyText}>No hay reservas programadas.</Text>
      ) : (
        <View style={styles.bookingsList}>
          {venueBookings.slice(0, 5).map((b) => (
            <View key={b.id} style={styles.bookingItem}>
              <Text style={styles.bookingDate}>{new Date(b.booking_date).toLocaleDateString('es-CO')}</Text>
              <Text style={styles.bookingTime}>{b.start_time} - {b.end_time}</Text>
              <Text style={styles.bookingStatus}>{b.status}</Text>
            </View>
          ))}
        </View>
      )}

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Eliminar Cancha</Text>
      </Pressable>
    </ScrollView>
  );
}

function Amenity({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.amenity}>
      <Ionicons name={icon as any} size={20} color="#0a7ea4" />
      <Text style={styles.amenityText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 12 },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', color: '#11181C' },
  editBtn: { padding: 8 },
  infoCard: { backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  infoLabel: { fontSize: 14, color: '#687076' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#11181C' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', marginBottom: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  amenity: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#E0F2FE', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  amenityText: { fontSize: 14, color: '#0a7ea4' },
  description: { fontSize: 15, color: '#687076', lineHeight: 22, marginBottom: 24 },
  bookingsList: { gap: 8, marginBottom: 24 },
  bookingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#F8FAFC', borderRadius: 8 },
  bookingDate: { flex: 1, fontSize: 14, color: '#11181C' },
  bookingTime: { fontSize: 14, fontWeight: '600', color: '#11181C' },
  bookingStatus: { fontSize: 12, color: '#687076', marginLeft: 8 },
  emptyText: { fontSize: 14, color: '#9BA1A6', marginBottom: 24 },
  deleteButton: { marginTop: 24, marginBottom: 40, padding: 16, alignItems: 'center' },
  deleteButtonText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
});