import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
export default function TeamTournamentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#687076' }}>Fase 4 — Dashboard torneo {id}</Text>
      </View>
    </ScrollView>
  );
}
