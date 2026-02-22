import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Image,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from 'react-native';
import { colors } from '../constants/theme';

const STORAGE_KEY = 'babyProfiles';

const FEEDING_TYPES = ['Amamentação', 'Mamadeira', 'Misto', 'Outro'];

interface BabyProfile {
  name: string;
  birthdate: string | null;
  weight: string;
  gender: 'M' | 'F';
  feeding: string;
  photoUri: string | null;
}

export default function BabyProfile() {
  const [profiles, setProfiles] = useState<BabyProfile[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [weight, setWeight] = useState('');
  const [genderMale, setGenderMale] = useState(true); // true = masculino
  const [feeding, setFeeding] = useState(FEEDING_TYPES[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) setProfiles(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }

  async function persistProfiles(nextProfiles: any[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfiles));
    } catch (e) {
      // ignore
    }
  }

  function openAddModal() {
    setEditingIndex(null);
    setName('');
    setBirthdate(null);
    setWeight('');
    setGenderMale(true);
    setFeeding(FEEDING_TYPES[0]);
    setPhotoUri(null);
    setModalVisible(true);
  }

  function openEditModal(idx: number) {
    const p = profiles[idx];
    setEditingIndex(idx);
    setName(p.name || '');
    setBirthdate(p.birthdate ? new Date(p.birthdate) : null);
    setWeight(p.weight || '');
    setGenderMale(p.gender === 'M');
    setFeeding(p.feeding || FEEDING_TYPES[0]);
    setPhotoUri(p.photoUri || null);
    setModalVisible(true);
  }

  async function pickImage() {
    try {
      const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const granted = (res as any).granted ?? (res as any).status === 'granted';
      if (!granted) {
        Alert.alert('Permissão necessária', 'Permita acesso às imagens.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        allowsEditing: true,
        aspect: [1, 1],
      });
      const cancelled = (result as any).canceled ?? (result as any).cancelled ?? false;
      if (!cancelled) {
        const uri = result.assets?.[0]?.uri ?? (result as any).uri ?? null;
        setPhotoUri(uri);
      }
    } catch (e) {
      // ignore
    }
  }

  function onChangeDate(event: any, selected?: Date) {
    // On Android the picker sends a 'dismissed' event; on selection selected is provided.
    const dismissed = event?.type === 'dismissed' || event?.nativeEvent?.action === 'dismissed';
    if (dismissed) {
      setShowDatePicker(false);
      return;
    }
    if (selected) setBirthdate(selected);
    if (Platform.OS !== 'ios') setShowDatePicker(false);
  }

  function saveProfile() {
    const payload: BabyProfile = {
      name,
      birthdate: birthdate ? birthdate.toISOString() : null,
      weight,
      gender: genderMale ? 'M' : 'F',
      feeding,
      photoUri,
    };

    let next = [...profiles];
    if (editingIndex === null) next.push(payload);
    else next[editingIndex] = payload;

    setProfiles(next);
    persistProfiles(next);
    setModalVisible(false);
    Alert.alert('Salvo', 'Perfil salvo com sucesso.');
  }

  function removeProfile(idx: number) {
    const next = profiles.filter((_: any, i: number) => i !== idx);
    setProfiles(next);
    persistProfiles(next);
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.list}>
        {profiles.map((p: any, idx: number) => (
          <View key={idx} style={styles.card}>
            <View style={styles.photoWrap}>
              {p.photoUri ? (
                <Image source={{ uri: p.photoUri }} style={styles.photo} />
              ) : (
                <View style={styles.photoPlaceholder} />
              )}
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.meta}>{p.birthdate ? new Date(p.birthdate).toLocaleDateString() : ''}</Text>
              <Text style={styles.meta}>{p.weight ? `${p.weight} kg` : ''}</Text>
              <Text style={styles.meta}>Sexo: {p.gender === 'M' ? 'Masculino' : 'Feminino'}</Text>
              <Text style={styles.meta}>Alimentação: {p.feeding}</Text>
            </View>
            <View style={styles.actions}>
              <Button title="Editar" onPress={() => openEditModal(idx)} />
              <View style={{ height: 8 }} />
              <Button color="#d9534f" title="Remover" onPress={() => removeProfile(idx)} />
            </View>
          </View>
        ))}
        <View style={styles.addButton}>
          <Button title="Adicionar perfil" onPress={openAddModal} color={colors.primary} />
        </View>
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingIndex === null ? 'Adicionar perfil' : 'Editar perfil'}</Text>

          <Pressable onPress={pickImage} style={styles.photoPicker}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoLarge} />
            ) : (
              <View style={styles.photoPickerPlaceholder}>
                <Text style={{ color: colors.textSecondary }}>Adicionar foto</Text>
              </View>
            )}
          </Pressable>

          <Text style={styles.label}>Nome</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />

          <Text style={styles.label}>Data de Nascimento</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text style={{ color: birthdate ? colors.text : colors.textSecondary }}>
              {birthdate ? birthdate.toLocaleDateString() : 'Selecionar data'}
            </Text>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker value={birthdate || new Date()} mode="date" display="default" onChange={onChangeDate} />
          )}

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" style={styles.input} />

          {/** Gênero: aparece apenas no modo de edição */}
          {editingIndex !== null && (
            <View style={styles.rowBetween}>
              <Text style={styles.label}>Masculino</Text>
              <Switch value={genderMale} onValueChange={setGenderMale} />
            </View>
          )}

          <Text style={styles.label}>Alimentação</Text>
          <View style={styles.feedRow}>
            {FEEDING_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => setFeeding(t)}
                style={[styles.feedButton, feeding === t && styles.feedButtonActive]}
              >
                <Text style={feeding === t ? styles.feedTextActive : styles.feedText}>{t}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.modalActions}>
            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
            <Button title="Salvar" onPress={saveProfile} color={colors.primary} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', alignItems: 'center' },
  list: { paddingVertical: 8, width: '100%', alignItems: 'center' },
  card: {
    width: '94%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoWrap: { marginRight: 12 },
  photo: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.background },
  photoPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.background },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textSecondary },
  actions: { marginLeft: 8, justifyContent: 'center' },
  addButton: { marginTop: 12, marginBottom: 40, width: '94%' },

  modalContainer: { flex: 1, padding: 20, backgroundColor: colors.background },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 12, textAlign: 'center' },
  photoPicker: { alignSelf: 'center', marginVertical: 8 },
  photoLarge: { width: 120, height: 120, borderRadius: 8 },
  photoPickerPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: { marginTop: 10, color: colors.textSecondary },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    marginTop: 6,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  feedRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  feedButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedButtonActive: { backgroundColor: colors.primary },
  feedText: { color: colors.textSecondary },
  feedTextActive: { color: '#fff' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
});
