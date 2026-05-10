import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { createTournament, type TournamentType, type TournamentCategory } from '@/lib/tournaments';

const TYPES: { value: TournamentType; label: string }[] = [
  { value: 'league', label: 'Liga (todos contra todos)' },
  { value: 'knockout', label: 'Eliminación directa' },
  { value: 'groups', label: 'Grupos + Eliminación' },
  { value: 'mixed', label: 'Mixto' },
];

const CATEGORIES: { value: TournamentCategory; label: string }[] = [
  { value: 'amateur', label: 'Amateur' },
  { value: 'sub20', label: 'Sub-20' },
  { value: 'sub23', label: 'Sub-23' },
  { value: 'professional', label: 'Profesional' },
];

export default function CreateTournamentScreen() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [type, setType] = useState<TournamentType>('league');
  const [category, setCategory] = useState<TournamentCategory>('amateur');
  const [maxTeams, setMaxTeams] = useState('8');
  const [startDate, setStartDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre del torneo es obligatorio.');
      return;
    }
    if (!startDate.trim()) {
      Alert.alert('Campo requerido', 'La fecha de inicio es obligatoria.');
      return;
    }

    setIsLoading(true);
    try {
      await createTournament({
        name: name.trim(),
        type,
        category,
        max_teams: parseInt(maxTeams) || 8,
        start_date: startDate,
        created_by: 'placeholder',
      });
      Alert.alert('Torneo creado', 'El torneo se creó correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo crear el torneo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Nuevo Torneo</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nombre del torneo *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Copa Colombia 2026"
          placeholderTextColor="#9BA1A6"
          autoCapitalize="words"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Tipo de torneo</Text>
        <View style={styles.options}>
          {TYPES.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, type === opt.value && styles.optionSelected]}
              onPress={() => setType(opt.value)}
            >
              <Text style={[styles.optionText, type === opt.value && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Categoría</Text>
        <View style={styles.options}>
          {CATEGORIES.map((opt) => (
            <Pressable
              key={opt.value}
              style={[styles.option, category === opt.value && styles.optionSelected]}
              onPress={() => setCategory(opt.value)}
            >
              <Text style={[styles.optionText, category === opt.value && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Máx. equipos</Text>
          <TextInput
            style={styles.input}
            value={maxTeams}
            onChangeText={setMaxTeams}
            placeholder="8"
            placeholderTextColor="#9BA1A6"
            keyboardType="number-pad"
            editable={!isLoading}
          />
        </View>
        <View style={[styles.field, styles.half]}>
          <Text style={styles.label}>Fecha de inicio *</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9BA1A6"
            editable={!isLoading}
          />
        </View>
      </View>

      <Pressable
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Crear Torneo</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C', marginBottom: 8 },
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
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  optionSelected: { borderColor: '#0a7ea4', backgroundColor: '#E0F2FE' },
  optionText: { fontSize: 14, color: '#687076' },
  optionTextSelected: { color: '#0a7ea4', fontWeight: '600' },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
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