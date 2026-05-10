import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  ActivityIndicator, Alert, StyleSheet, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/features/auth/use-auth';
import { venues, type VenueType, type SurfaceType } from '@/lib/venues';

const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: 'futsal', label: 'Futsal (5)' },
  { value: 'fut7', label: 'Fútbol 7' },
  { value: 'fut9', label: 'Fútbol 9' },
  { value: 'fut11', label: 'Fútbol 11' },
];

const SURFACE_TYPES: { value: SurfaceType; label: string }[] = [
  { value: 'sintetica', label: 'Sintética' },
  { value: 'híbrida', label: 'Híbrida' },
  { value: 'natural', label: 'Natural' },
];

export default function NewVenueScreen() {
  const insets = useSafeAreaInsets();
  const { state: { user } } = useAuth();

  const [name, setName] = useState('');
  const [type, setType] = useState<VenueType>('fut7');
  const [surface, setSurface] = useState<SurfaceType>('sintetica');
  const [address, setAddress] = useState('');
  const [capacity, setCapacity] = useState('14');
  const [opensAt, setOpensAt] = useState('08:00');
  const [closesAt, setClosesAt] = useState('23:00');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');

  const [hasRoof, setHasRoof] = useState(false);
  const [hasLights, setHasLights] = useState(true);
  const [hasGraderia, setHasGraderia] = useState(false);
  const [hasBathrooms, setHasBathrooms] = useState(true);
  const [hasParking, setHasParking] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre de la cancha es obligatorio.');
      return;
    }
    if (!user) return;

    setIsLoading(true);
    try {
      await venues.create({
        admin_id: user.id,
        name: name.trim(),
        type,
        surface,
        address: address.trim() || null,
        capacity: parseInt(capacity) || 14,
        opens_at: opensAt,
        closes_at: closesAt,
        contact_phone: contactPhone.trim() || null,
        contact_email: contactEmail.trim() || null,
        description: description.trim() || null,
        has_roof: hasRoof,
        has_lights: hasLights,
        has_graderia: hasGraderia,
        has_bathrooms: hasBathrooms,
        has_parking: hasParking,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo crear la cancha.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Nueva Cancha</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nombre de la cancha *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Cancha Principal"
          placeholderTextColor="#9BA1A6"
          autoCapitalize="words"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tipo de fútbol</Text>
        <View style={styles.options}>
          {VENUE_TYPES.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, type === opt.value && styles.optionSelected]}
              onPress={() => setType(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  type === opt.value && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tipo de superficie</Text>
        <View style={styles.options}>
          {SURFACE_TYPES.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.option,
                surface === opt.value && styles.optionSelected,
              ]}
              onPress={() => setSurface(opt.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  surface === opt.value && styles.optionTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
          placeholder="Calle 123, Ciudad"
          placeholderTextColor="#9BA1A6"
          editable={!isLoading}
        />
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Capacidad</Text>
          <TextInput
            style={styles.input}
            value={capacity}
            onChangeText={setCapacity}
            placeholder="14"
            placeholderTextColor="#9BA1A6"
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Abre</Text>
          <TextInput
            style={styles.input}
            value={opensAt}
            onChangeText={setOpensAt}
            placeholder="08:00"
            placeholderTextColor="#9BA1A6"
            editable={!isLoading}
          />
        </View>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Cierre</Text>
          <TextInput
            style={styles.input}
            value={closesAt}
            onChangeText={setClosesAt}
            placeholder="23:00"
            placeholderTextColor="#9BA1A6"
            editable={!isLoading}
          />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Comodidades</Text>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Techo / Cubierta</Text>
        <Switch value={hasRoof} onValueChange={setHasRoof} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Iluminación</Text>
        <Switch value={hasLights} onValueChange={setHasLights} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Gradería</Text>
        <Switch value={hasGraderia} onValueChange={setHasGraderia} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Baños</Text>
        <Switch value={hasBathrooms} onValueChange={setHasBathrooms} />
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>Parqueadero</Text>
        <Switch value={hasParking} onValueChange={setHasParking} />
      </View>

      <Text style={styles.sectionTitle}>Contacto</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
          placeholder="+57 300 123 4567"
          placeholderTextColor="#9BA1A6"
          keyboardType="phone-pad"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={contactEmail}
          onChangeText={setContactEmail}
          placeholder="cancha@correo.com"
          placeholderTextColor="#9BA1A6"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Descripción adicional de la cancha..."
          placeholderTextColor="#9BA1A6"
          multiline
          numberOfLines={4}
          editable={!isLoading}
        />
      </View>

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear Cancha</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#11181C', marginTop: 8 },
  field: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: '#11181C' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#F8FAFC',
  },
  textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  optionSelected: {
    borderColor: '#0a7ea4',
    backgroundColor: '#E0F2FE',
  },
  optionText: { fontSize: 14, color: '#687076' },
  optionTextSelected: { color: '#0a7ea4', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  switchLabel: { fontSize: 16, color: '#11181C' },
  button: {
    height: 52,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 40,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});