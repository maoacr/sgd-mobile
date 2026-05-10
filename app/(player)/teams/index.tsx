import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PlayerTeamsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis Equipos</Text>
        <Pressable
          style={styles.addButton}
          onPress={() => router.push('/(player)/teams/new')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
      <Text style={styles.empty}>Aún no tienes equipos.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 40 },
});