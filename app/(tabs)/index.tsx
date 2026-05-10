import { ScrollView, View } from 'react-native';

/**
 * Placeholder raíz — se reemplaza en Fase 2 cuando el root layout
 * redirija automáticamente según el rol del usuario autenticado.
 */
export default function IndexScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <View />
    </ScrollView>
  );
}
