import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { inviteMember } from '@/lib/teams';

export default function InviteMemberScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    if (!email.trim() && !phone.trim()) {
      Alert.alert('Campo requerido', 'Ingresa email o teléfono.');
      return;
    }

    setLoading(true);
    try {
      await inviteMember({
        teamId: id,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        channel,
      });
      Alert.alert('Invitación enviada', 'Se ha enviado la invitación.', [{ text: 'OK', onPress: router.back }]);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo enviar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Invitar miembro</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="#9BA1A6"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>O WhatsApp</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="+57 300 123 4567"
          placeholderTextColor="#9BA1A6"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.channelField}>
        <Text style={styles.label}>Canal de invitación</Text>
        <View style={styles.channelOptions}>
          {(['email', 'whatsapp', 'both'] as const).map((c) => (
            <Pressable
              key={c}
              style={[styles.channelOption, channel === c && styles.channelOptionActive]}
              onPress={() => setChannel(c)}
            >
              <Text style={[styles.channelText, channel === c && styles.channelTextActive]}>
                {c === 'email' ? 'Email' : c === 'whatsapp' ? 'WhatsApp' : 'Ambos'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleInvite}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Enviar invitación</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C' },
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
  channelField: { gap: 8 },
  channelOptions: { flexDirection: 'row', gap: 8 },
  channelOption: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  channelOptionActive: { backgroundColor: '#0a7ea4', borderColor: '#0a7ea4' },
  channelText: { fontSize: 14, color: '#11181C' },
  channelTextActive: { color: '#fff' },
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