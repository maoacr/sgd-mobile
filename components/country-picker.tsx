import { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';

export interface Country {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  { code: 'CO', dialCode: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: 'AR', dialCode: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: 'MX', dialCode: '+52', name: 'México', flag: '🇲🇽' },
  { code: 'PE', dialCode: '+51', name: 'Perú', flag: '🇵🇪' },
  { code: 'CL', dialCode: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: 'EC', dialCode: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'VE', dialCode: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: 'BR', dialCode: '+55', name: 'Brasil', flag: '🇧🇷' },
  { code: 'US', dialCode: '+1', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'ES', dialCode: '+34', name: 'España', flag: '🇪🇸' },
  { code: 'UY', dialCode: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: 'PA', dialCode: '+507', name: 'Panamá', flag: '🇵🇦' },
  { code: 'CR', dialCode: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: 'GT', dialCode: '+502', name: 'Guatemala', flag: '🇬🇹' },
  { code: 'DO', dialCode: '+1', name: 'República Dominicana', flag: '🇩🇴' },
];

interface CountryPickerProps {
  selectedDialCode: string;
  onSelect: (country: Country) => void;
}

export function CountryPicker({ selectedDialCode, onSelect }: CountryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selectedCountry =
    COUNTRIES.find((c) => c.dialCode === selectedDialCode) ?? COUNTRIES[0];

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setIsOpen(true)}>
        <Text style={styles.flag}>{selectedCountry.flag}</Text>
        <Text style={styles.dialCode}>{selectedDialCode}</Text>
        <Text style={styles.chevron}>▼</Text>
      </Pressable>

      <Modal visible={isOpen} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar país</Text>
              <Pressable onPress={() => setIsOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.search}
              placeholder="Buscar país..."
              placeholderTextColor="#9BA1A6"
              value={search}
              onChangeText={setSearch}
            />

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.countryRow}
                  onPress={() => {
                    onSelect(item);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <Text style={styles.flag}>{item.flag}</Text>
                  <Text style={styles.countryName}>{item.name}</Text>
                  <Text style={styles.dialCodeRow}>{item.dialCode}</Text>
                </Pressable>
              )}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F8FAFC',
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 15,
    color: '#11181C',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 10,
    color: '#687076',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#11181C',
  },
  close: {
    fontSize: 20,
    color: '#687076',
  },
  search: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#11181C',
    backgroundColor: '#F8FAFC',
  },
  list: {
    marginTop: 8,
  },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: '#11181C',
  },
  dialCodeRow: {
    fontSize: 14,
    color: '#687076',
  },
});