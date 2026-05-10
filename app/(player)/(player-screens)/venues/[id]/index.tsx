import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '@/features/auth/use-auth';
import { venues, venuePackages, type Venue, type VenuePackage } from '@/lib/venues';
import { bookings } from '@/lib/bookings';

export default function PlayerVenueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state: { user } } = useAuth();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [packages, setPackages] = useState<VenuePackage[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  async function loadVenue() {
    try {
      const [venueData, packagesData] = await Promise.all([
        venues.get(id!),
        venuePackages.list(id!),
      ]);
      setVenue(venueData);
      setPackages(packagesData);
    } catch (err) {
      console.error('Error loading venue:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVenue();
  }, [id]);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  async function handleBook(packageId?: string) {
    if (!user) {
      router.push('/(auth)/sign-in');
      return;
    }
    if (!venue) return;

    setBooking(true);
    try {
      const pkg = packageId
        ? packages.find((p) => p.id === packageId)
        : null;

      await bookings.create({
        venue_id: venue.id,
        user_id: user.id,
        package_id: packageId || null,
        booking_date: selectedDate,
        start_time: '10:00',
        end_time: pkg
          ? `${10 + Math.floor(pkg.duration_min / 60)}:00`
          : '11:00',
        type: 'open',
        status: 'pending',
      });

      Alert.alert(
        'Reserva solicitada',
        'El administrador confirmará tu reserva pronto.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo crear la reserva.');
    } finally {
      setBooking(false);
    }
  }

  if (loading || !venue) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
      </View>

      <View style={styles.venueHeader}>
        <View style={styles.venueIcon}>
          <Ionicons name="football" size={32} color="#0a7ea4" />
        </View>
        <Text style={styles.venueTitle}>{venue.name}</Text>
        <Text style={styles.venueSubtitle}>
          {venue.type.toUpperCase()} • {venue.surface}
        </Text>
      </View>

      {venue.address && (
        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color="#687076" />
          <Text style={styles.infoText}>{venue.address}</Text>
        </View>
      )}

      <View style={styles.infoRow}>
        <Ionicons name="time" size={20} color="#687076" />
        <Text style={styles.infoText}>
          Horario: {venue.opens_at} - {venue.closes_at}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="people" size={20} color="#687076" />
        <Text style={styles.infoText}>Capacidad: {venue.capacity} jugadores</Text>
      </View>

      <Text style={styles.sectionTitle}>Comodidades</Text>
      <View style={styles.amenitiesGrid}>
        {venue.has_roof && (
          <View style={styles.amenity}>
            <Ionicons name="water" size={20} color="#0a7ea4" />
            <Text style={styles.amenityText}>Techo</Text>
          </View>
        )}
        {venue.has_lights && (
          <View style={styles.amenity}>
            <Ionicons name="bulb" size={20} color="#0a7ea4" />
            <Text style={styles.amenityText}>Luces</Text>
          </View>
        )}
        {venue.has_graderia && (
          <View style={styles.amenity}>
            <Ionicons name="people" size={20} color="#0a7ea4" />
            <Text style={styles.amenityText}>Gradería</Text>
          </View>
        )}
        {venue.has_bathrooms && (
          <View style={styles.amenity}>
            <Ionicons name="water-outline" size={20} color="#0a7ea4" />
            <Text style={styles.amenityText}>Baños</Text>
          </View>
        )}
        {venue.has_parking && (
          <View style={styles.amenity}>
            <Ionicons name="car" size={20} color="#0a7ea4" />
            <Text style={styles.amenityText}>Parqueadero</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionTitle}>Seleccionar fecha</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.datesList}
      >
        {dates.map((date) => {
          const d = parseISO(date);
          const isSelected = date === selectedDate;
          return (
            <Pressable
              key={date}
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[styles.dateDayName, isSelected && styles.dateTextSelected]}
              >
                {format(d, 'EEE', { locale: es })}
              </Text>
              <Text
                style={[styles.dateDayNum, isSelected && styles.dateTextSelected]}
              >
                {format(d, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {packages.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Paquetes disponibles</Text>
          <View style={styles.packagesList}>
            {packages.map((pkg) => (
              <Pressable
                key={pkg.id}
                style={styles.packageCard}
                onPress={() => handleBook(pkg.id)}
                disabled={booking}
              >
                <View style={styles.packageHeader}>
                  <Text style={styles.packageName}>{pkg.name}</Text>
                  <Text style={styles.packagePrice}>
                    ${pkg.price.toLocaleString('es-CO')}
                  </Text>
                </View>
                <Text style={styles.packageDuration}>
                  {pkg.duration_min} minutos
                </Text>
                {pkg.description && (
                  <Text style={styles.packageDesc}>{pkg.description}</Text>
                )}
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Pressable
        style={[styles.bookButton, booking && styles.bookButtonDisabled]}
        onPress={() => handleBook()}
        disabled={booking}
      >
        {booking ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.bookButtonText}>Reservar</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', marginBottom: 16 },
  backButton: { padding: 8 },
  venueHeader: { alignItems: 'center', marginBottom: 24 },
  venueIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  venueTitle: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  venueSubtitle: { fontSize: 14, color: '#687076', marginTop: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  infoText: { fontSize: 15, color: '#687076' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', marginTop: 24, marginBottom: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  amenity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  amenityText: { fontSize: 14, color: '#0a7ea4' },
  datesList: { gap: 8, paddingVertical: 8 },
  dateCard: {
    width: 56,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  dateCardSelected: { backgroundColor: '#0a7ea4' },
  dateDayName: { fontSize: 12, color: '#687076', textTransform: 'capitalize' },
  dateDayNum: { fontSize: 20, fontWeight: '700', color: '#11181C', marginTop: 4 },
  dateTextSelected: { color: '#fff' },
  packagesList: { gap: 12, marginBottom: 24 },
  packageCard: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  packageHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  packageName: { fontSize: 16, fontWeight: '600', color: '#11181C' },
  packagePrice: { fontSize: 16, fontWeight: '700', color: '#0a7ea4' },
  packageDuration: { fontSize: 14, color: '#687076', marginTop: 4 },
  packageDesc: { fontSize: 13, color: '#9BA1A6', marginTop: 4 },
  bookButton: {
    height: 52,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  bookButtonDisabled: { opacity: 0.6 },
  bookButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});