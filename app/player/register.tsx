import { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import type { AsyncState } from '@/types';

/**
 * Formulario público de auto-registro del jugador.
 * Accedido vía link único generado por el rol Team:
 *   /player/register?token=<registration_token>
 *
 * Sin auth requerida — el token identifica al jugador en la DB.
 * La lógica de escritura se implementa en Fase 5 conectada a Supabase.
 */
export default function PlayerRegisterScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [name, setName]         = useState('');
  const [lastName, setLastName] = useState('');
  const [number, setNumber]     = useState('');
  const [submitState, setSubmitState] = useState<AsyncState<null>>({ status: 'idle' });

  const isLoading = submitState.status === 'loading';
  const isSuccess = submitState.status === 'success';

  async function handleSubmit() {
    if (!name.trim() || !lastName.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa tu nombre y apellido.');
      return;
    }
    if (!token) {
      Alert.alert('Link inválido', 'Este link de registro no es válido.');
      return;
    }

    setSubmitState({ status: 'loading' });

    // Fase 5 — aquí se conectará con Supabase usando el token
    // para identificar al jugador y actualizar sus datos.
    await new Promise((r) => setTimeout(r, 800)); // placeholder

    setSubmitState({ status: 'success', data: null });
  }

  if (isSuccess) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 }}>
        <Text style={{ fontSize: 32 }}>✅</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#11181C', textAlign: 'center' }}>
          ¡Datos registrados!
        </Text>
        <Text style={{ fontSize: 15, color: '#687076', textAlign: 'center' }}>
          Tu información ha sido guardada correctamente.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, padding: 32, gap: 32, justifyContent: 'center' }}
      >
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#11181C' }}>
            Registro de jugador
          </Text>
          <Text style={{ fontSize: 15, color: '#687076' }}>
            Completa tus datos para participar en el torneo.
          </Text>
        </View>

        <View style={{ gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={labelStyle}>Nombre</Text>
            <TextInput
              style={inputStyle}
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor="#9BA1A6"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={labelStyle}>Apellido</Text>
            <TextInput
              style={inputStyle}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Tu apellido"
              placeholderTextColor="#9BA1A6"
              autoCapitalize="words"
              editable={!isLoading}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text style={labelStyle}>Número de camiseta (opcional)</Text>
            <TextInput
              style={inputStyle}
              value={number}
              onChangeText={setNumber}
              placeholder="Ej: 10"
              placeholderTextColor="#9BA1A6"
              keyboardType="number-pad"
              maxLength={2}
              editable={!isLoading}
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={isLoading}
            style={{
              height: 52,
              backgroundColor: '#0a7ea4',
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isLoading ? 0.6 : 1,
              marginTop: 8,
            }}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Guardar datos</Text>
            }
          </Pressable>

          {submitState.status === 'error' && (
            <Text style={{ color: '#E53E3E', fontSize: 14, textAlign: 'center' }}>
              {submitState.message}
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const labelStyle = { fontSize: 14, fontWeight: '500' as const, color: '#11181C' };
const inputStyle = {
  height: 48,
  borderWidth: 1,
  borderColor: '#E2E8F0',
  borderRadius: 10,
  paddingHorizontal: 16,
  fontSize: 16,
  color: '#11181C',
  backgroundColor: '#F8FAFC',
};
