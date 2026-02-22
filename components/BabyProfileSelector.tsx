import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

interface BabyProfile {
  name: string;
  birthdate: string | null;
  weight: string;
  gender: 'M' | 'F';
  feeding: string;
  photoUri: string | null;
}

const PROFILES_KEY = 'babyProfiles';
const ACTIVE_PROFILE_KEY = 'activeProfileIndex';

function formatAge(birthDate: Date | null): string {
  if (!birthDate) return '';
  const now = new Date();
  const diffMs = now.getTime() - birthDate.getTime();
  const totalMonths = Math.floor(diffMs / (30.44 * 24 * 60 * 60 * 1000));
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  if (years === 0) {
    return months < 1 ? '< 1 mês' : months === 1 ? '1 mês' : `${months} meses`;
  }
  if (months === 0) {
    return years === 1 ? '1 ano' : `${years} anos`;
  }
  const yearLabel = years === 1 ? 'ano' : 'anos';
  const monthLabel = months === 1 ? 'mês' : 'meses';
  return `${years} ${yearLabel} e ${months} ${monthLabel}`;
}

export default function BabyProfileSelector() {
  const [profiles, setProfiles] = useState<BabyProfile[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const raw = await AsyncStorage.getItem(PROFILES_KEY);
      if (raw) {
        const loaded = JSON.parse(raw);
        setProfiles(loaded);
        
        const activeRaw = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
        const active = activeRaw ? parseInt(activeRaw, 10) : 0;
        setActiveIndex(Math.min(active, loaded.length - 1));
      }
    } catch (e) {
      // ignore
    }
  }

  async function setActiveProfile(idx: number) {
    try {
      await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, idx.toString());
      setActiveIndex(idx);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível trocar o perfil.');
    }
  }

  const active = activeIndex !== null && activeIndex < profiles.length ? profiles[activeIndex] : null;

  if (!active) {
    return (
      <View style={styles.perfil}>
        <Text style={styles.perfilNome}>Nenhum perfil</Text>
        <Text style={styles.perfilIdade}>Crie um perfil na aba Bebê</Text>
      </View>
    );
  }

  const birthDate = active.birthdate ? new Date(active.birthdate) : null;
  const ageLabel = formatAge(birthDate);

  return (
    <>
      <Pressable onPress={() => setModalVisible(true)} style={styles.perfil}>
        <View style={styles.infoContainer}>
          <Text style={styles.perfilNome}>{active.name}</Text>
          <Text style={styles.perfilIdade}>{ageLabel}</Text>
        </View>
        <View style={styles.perfilAvatar}>
          {active.photoUri ? (
            <Image source={{ uri: active.photoUri }} style={styles.photoImage} />
          ) : (
            <Text style={styles.perfilAvatarText}>👶</Text>
          )}
        </View>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecionar perfil do bebê</Text>
            <ScrollView contentContainerStyle={styles.profileList}>
              {profiles.map((p, idx) => {
                const bd = p.birthdate ? new Date(p.birthdate) : null;
                const al = formatAge(bd);
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setActiveProfile(idx)}
                    style={[styles.profileItem, activeIndex === idx && styles.profileItemActive]}
                  >
                    <View style={styles.profileItemAvatar}>
                      {p.photoUri ? (
                        <Image source={{ uri: p.photoUri }} style={styles.photoImageSmall} />
                      ) : (
                        <Text style={styles.photoPlaceholder}>👶</Text>
                      )}
                    </View>
                    <View style={styles.profileItemInfo}>
                      <Text style={styles.profileItemName}>{p.name}</Text>
                      <Text style={styles.profileItemAge}>{al}</Text>
                    </View>
                    {activeIndex === idx && <Text style={styles.checkmark}>✓</Text>}
                  </Pressable>
                );
              })}
            </ScrollView>
            <Pressable onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
  },

  infoContainer: {
    flex: 1,
  },

  perfilNome: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },

  perfilIdade: { 
    fontSize: 14,
    color: colors.textOnPrimary,
    opacity: 0.9,
    marginTop: 2,
  },

  perfilAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  perfilAvatarText: {
    fontSize: 28,
  },

  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
    paddingTop: 60,
  },

  modalContent: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },

  profileList: {
    paddingBottom: 16,
  },

  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  profileItemActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  profileItemAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },

  photoImageSmall: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  photoPlaceholder: {
    fontSize: 24,
  },

  profileItemInfo: {
    flex: 1,
  },

  profileItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },

  profileItemAge: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  checkmark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
  },

  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },

  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
