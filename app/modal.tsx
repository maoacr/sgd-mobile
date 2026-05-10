import { Link } from 'expo-router';
import { ScrollView } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

/**
 * Modal genérico de la app — se especializa por contexto en fases posteriores.
 */
export default function ModalScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <ThemedText type="title">SGD</ThemedText>
        <Link href="/" dismissTo style={{ marginTop: 15, paddingVertical: 15 }}>
          <ThemedText type="link">Volver</ThemedText>
        </Link>
      </ThemedView>
    </ScrollView>
  );
}
