import { ScrollView, View, Text } from 'react-native';
export default function PlayersScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#687076' }}>Fase 3 — Jugadores (filtro por torneo y categoría)</Text>
      </View>
    </ScrollView>
  );
}
