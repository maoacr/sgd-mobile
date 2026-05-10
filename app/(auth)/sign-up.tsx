import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { signUp } from '@/lib/auth';
import { router } from 'expo-router';
import { CountryPicker, type Country } from '@/components/country-picker';

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignUp() {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Completa todos los campos obligatorios.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    const fullPhone = phoneNumber.trim() ? `${countryCode} ${phoneNumber.trim()}` : undefined;

    const { data, error } = await signUp({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      phone: fullPhone,
      countryCode,
    });

    setIsLoading(false);

    if (error) {
      Alert.alert('Error al registrar', error.message);
      return;
    }

    Alert.alert(
      'Correo de verificación',
      'Te enviamos un enlace de verificación a tu correo. Haz clic en el link para activar tu cuenta.',
      [{ text: 'Entendido', onPress: () => router.replace('/(auth)/sign-in') }],
    );
  }

  function handleCountrySelect(country: Country) {
    setCountryCode(country.dialCode);
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Regístrate para comenzar</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.half]}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Tu nombre"
                placeholderTextColor="#9BA1A6"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
            <View style={[styles.fieldGroup, styles.half]}>
              <Text style={styles.label}>Apellido *</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Tu apellido"
                placeholderTextColor="#9BA1A6"
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo electrónico *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor="#9BA1A6"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Teléfono (opcional)</Text>
            <View style={styles.phoneRow}>
              <CountryPicker
                selectedDialCode={countryCode}
                onSelect={handleCountrySelect}
              />
              <TextInput
                style={[styles.input, styles.phoneInput]}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="300 123 4567"
                placeholderTextColor="#9BA1A6"
                keyboardType="phone-pad"
                editable={!isLoading}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9BA1A6"
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />
            <Text style={styles.hint}>
              Mín. 8 caracteres, 1 número, 1 mayúscula, 1 minúscula, 1 símbolo.
            </Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirmar contraseña *</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              placeholderTextColor="#9BA1A6"
              secureTextEntry
              autoComplete="new-password"
              editable={!isLoading}
            />
          </View>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </Pressable>

          <Pressable
            style={styles.linkButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 32,
  },
  header: { alignItems: 'center', gap: 8 },
  title: { fontSize: 32, fontWeight: '700', color: '#11181C' },
  subtitle: { fontSize: 15, color: '#687076' },
  form: { gap: 16 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  fieldGroup: { gap: 6 },
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
  hint: { fontSize: 12, color: '#9BA1A6' },
  phoneRow: { flexDirection: 'row', gap: 10 },
  phoneInput: { flex: 1 },
  button: {
    height: 52,
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#0a7ea4', fontSize: 14 },
});