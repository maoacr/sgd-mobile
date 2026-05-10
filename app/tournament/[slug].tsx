import { ScrollView, View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

/**
 * Landing pública del torneo — acceso sin autenticación.
 * URL: /tournament/<slug>
 *
 * Visible para cualquier persona (redes sociales, jugadores, hinchas).
 * Fase 5 — se conecta a Supabase con queries de solo lectura.
 * RLS permite SELECT en torneos activos/finalizados sin sesión.
 */
export default function TournamentPublicScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View style={{ padding: 16, gap: 24 }}>
        {/* Cabecera del torneo */}
        <View style={{ gap: 4, paddingTop: 16 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: '#11181C' }}>
            Torneo
          </Text>
          <Text style={{ fontSize: 14, color: '#687076' }}>
            {slug}
          </Text>
        </View>

        {/* Secciones — placeholders para Fase 5 */}
        <SectionPlaceholder title="Tabla de posiciones" />
        <SectionPlaceholder title="Fixture" />
        <SectionPlaceholder title="Goleadores" />
        <SectionPlaceholder title="Estadísticas" />
      </View>
    </ScrollView>
  );
}

/** Placeholder de sección — se reemplaza en Fase 5 con datos reales */
function SectionPlaceholder({ title }: { title: string }) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={{ fontSize: 13, color: '#687076', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ color: '#9BA1A6', fontSize: 13 }}>Fase 5 — {title}</Text>
      </View>
    </View>
  );
}
