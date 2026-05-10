import { View, Text, StyleSheet } from 'react-native';

export default function PlayerTournamentsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Torneos</Text>
      <Text style={styles.empty}>No estás inscrito en ningún torneo.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C', marginBottom: 20 },
  empty: { fontSize: 15, color: '#687076', textAlign: 'center', marginTop: 40 },
});