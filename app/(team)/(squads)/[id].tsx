import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
export default function SquadDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#687076' }}>Fase 4 — Detalle sub-equipo {id}</Text>
      </View>
    </ScrollView>
  );
}
