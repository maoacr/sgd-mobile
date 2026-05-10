import { View, Text, StyleSheet } from 'react-native';

export default function VerifyEmailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verifica tu correo</Text>
      <Text style={styles.subtitle}>
        Te enviamos un enlace de verificación a tu correo electrónico.
        Haz clic en el link para activar tu cuenta.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#11181C' },
  subtitle: { fontSize: 15, color: '#687076', textAlign: 'center' },
});