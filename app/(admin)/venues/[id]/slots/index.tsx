import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { venueSlots, type VenueSlot } from '@/lib/venues';
import { bookings } from '@/lib/bookings';

export default function VenueSlotsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [slots, setSlots] = useState<VenueSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSlots() {
    try {
      const [slotsData, bookingsData] = await Promise.all([
        venueSlots.list(id!, selectedDate),
        bookings.listByVenueAndDate(id!, selectedDate),
      ]);
      setSlots(slotsData);
      setBookedSlots(bookingsData);
    } catch (err) {
      console.error('Error loading slots:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, [id, selectedDate]);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  function generateTimeSlots() {
    const times: string[] = [];
    for (let h = 8; h <= 22; h++) {
      times.push(`${h.toString().padStart(2, '0')}:00`);
    }
    return times;
  }

  async function handleGenerateSlots() {
    setSaving(true);
    try {
      const times = generateTimeSlots();
      const newSlots = times.map((startTime) => ({
        venue_id: id!,
        date: selectedDate,
        start_time: startTime,
        end_time: `${(parseInt(startTime) + 1).toString().padStart(2, '0')}:00`,
        is_available: true,
      }));
      await venueSlots.bulkCreate(newSlots);
      await loadSlots();
      Alert.alert('Listo', 'Slots generados para el día.');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleSlot(slot: VenueSlot) {
    try {
      await venueSlots.updateAvailability(slot.id, !slot.is_available);
      await loadSlots();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  }

  const isSlotBooked = (time: string) =>
    bookedSlots.some(
      (b) => b.start_time === time || (time >= b.start_time && time < b.end_time)
    );

  const getSlotStatus = (time: string) => {
    const slot = slots.find((s) => s.start_time === time);
    if (isSlotBooked(time)) return 'booked';
    if (slot?.is_available === false) return 'blocked';
    if (slot?.is_available === true) return 'available';
    return 'empty';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#11181C" />
        </Pressable>
        <Text style={styles.headerTitle}>Disponibilidad</Text>
      </View>

      <Text style={styles.sectionTitle}>Seleccionar fecha</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={dates}
        keyExtractor={(item) => item}
        renderItem={({ item }) => {
          const date = parseISO(item);
          const isSelected = item === selectedDate;
          return (
            <Pressable
              style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              onPress={() => setSelectedDate(item)}
            >
              <Text
                style={[styles.dateDayName, isSelected && styles.dateTextSelected]}
              >
                {format(date, 'EEE', { locale: es })}
              </Text>
              <Text
                style={[styles.dateDayNum, isSelected && styles.dateTextSelected]}
              >
                {format(date, 'd')}
              </Text>
            </Pressable>
          );
        }}
        contentContainerStyle={styles.datesList}
      />

      <View style={styles.legendContainer}>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: '#22C55E' }]} />
          <Text style={styles.legendText}>Disponible</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.legendText}>Bloqueado</Text>
        </View>
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: '#DC2626' }]} />
          <Text style={styles.legendText}>Reservado</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={styles.generateButton}
          onPress={handleGenerateSlots}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>Generar Horarios</Text>
          )}
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Horarios</Text>
      <View style={styles.slotsGrid}>
        {generateTimeSlots().map((time) => {
          const status = getSlotStatus(time);
          const statusColor =
            status === 'available'
              ? '#22C55E'
              : status === 'blocked'
                ? '#F59E0B'
                : status === 'booked'
                  ? '#DC2626'
                  : '#E2E8F0';
          const statusBg =
            status === 'available'
              ? '#DCFCE7'
              : status === 'blocked'
                ? '#FEF3C7'
                : status === 'booked'
                  ? '#FEE2E2'
                  : '#F8FAFC';
          return (
            <Pressable
              key={time}
              style={[styles.slot, { backgroundColor: statusBg }]}
              onPress={() => {
                const slot = slots.find((s) => s.start_time === time);
                if (slot && status !== 'booked') {
                  toggleSlot(slot);
                }
              }}
              disabled={status === 'booked'}
            >
              <Text style={[styles.slotText, { color: statusColor }]}>{time}</Text>
              <Ionicons
                name={
                  status === 'available'
                    ? 'checkmark-circle'
                    : status === 'blocked'
                      ? 'remove-circle'
                      : status === 'booked'
                        ? 'lock-closed'
                        : 'ellipse'
                }
                size={16}
                color={statusColor}
              />
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: { marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#11181C' },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', marginBottom: 12 },
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
  legendContainer: { flexDirection: 'row', gap: 16, marginVertical: 16 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: '#687076' },
  actions: { marginBottom: 16 },
  generateButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: { color: '#fff', fontWeight: '600' },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 40,
  },
  slot: {
    width: '23%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { fontSize: 14, fontWeight: '600' },
});