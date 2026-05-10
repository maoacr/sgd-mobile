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

import { router } from 'expo-router';
import { signIn } from '@/lib/supabase-auth';
import type { AsyncState } from '@/types';

export default function SignInScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authState, setAuthState] = useState<AsyncState<null>>({ status: 'idle' });

  const isLoading = authState.status === 'loading';

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu correo y contraseña.');
      return;
    }

    setAuthState({ status: 'loading' });

    const { error } = await signIn({ email: email.trim(), password });

    if (error) {
      setAuthState({ status: 'error', message: error.message });
      Alert.alert('Error al ingresar', error.message);
      return;
    }

    setAuthState({ status: 'success', data: null });
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SGD</Text>
          <Text style={styles.subtitle}>Sistema de Gestión Deportiva</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Correo</Text>
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
            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#9BA1A6"
              secureTextEntry
              autoComplete="current-password"
              editable={!isLoading}
            />
          </View>

          <Pressable
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </Pressable>

          {authState.status === 'error' && (
            <Text style={styles.errorText}>{authState.message}</Text>
          )}
        </View>

        <Pressable
          style={styles.linkButton}
          onPress={() => router.push('/(auth)/sign-up')}
          disabled={isLoading}
        >
          <Text style={styles.linkText}>¿No tienes cuenta? Regístrate</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 32,
    paddingBottom: 48,
    gap: 40,
  },
  header: { alignItems: 'center', gap: 8 },
  title: { fontSize: 48, fontWeight: '700', letterSpacing: -1, color: '#11181C' },
  subtitle: { fontSize: 15, color: '#687076', textAlign: 'center' },
  form: { gap: 20 },
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
  errorText: { color: '#E53E3E', fontSize: 14, textAlign: 'center' },
  linkButton: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: '#0a7ea4', fontSize: 14 },
});