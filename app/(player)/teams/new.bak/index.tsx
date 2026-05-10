import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/features/auth/use-auth';
import { createTeam } from '@/lib/teams';

export default function CreateTeamScreen() {
  const insets = useSafeAreaInsets();
  const { state: { user } } = useAuth();
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('Campo requerido', 'El nombre del equipo es obligatorio.');
      return;
    }

    setIsLoading(true);
    try {
      await createTeam(user!.id, {
        name: name.trim(),
        tagline: tagline.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo crear el equipo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Crear equipo</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Nombre del equipo *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ej: Los Teros FC"
          placeholderTextColor="#9BA1A6"
          autoCapitalize="words"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Lema / Insignia (opcional)</Text>
        <TextInput
          style={styles.input}
          value={tagline}
          onChangeText={setTagline}
          placeholder="Ej: Jugar, disfrutar, ganar"
          placeholderTextColor="#9BA1A6"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email del equipo (opcional)</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="equipo@correo.com"
          placeholderTextColor="#9BA1A6"
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>WhatsApp del equipo (opcional)</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+57 300 123 4567"
          placeholderTextColor="#9BA1A6"
          keyboardType="phone-pad"
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
          <Text style={styles.buttonText}>Crear equipo</Text>
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
  button: {
    height: 52,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});