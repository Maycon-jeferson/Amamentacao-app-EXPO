import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import BabyProfileSelector from '../../components/BabyProfileSelector';
import { colors } from '../../constants/theme';

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
});

export default function BreastFeeding() {
  const [savedTime, setSavedTime] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedSide, setSelectedSide] = useState<'L' | 'R' | null>(null);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [records, setRecords] = useState<any[]>([]);
  const [activeProfile, setActiveProfile] = useState<any | null>(null);


  useEffect(() => {
    let interval: number | undefined;

    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000) as unknown as number;
    }

    return () => {
      if (interval !== undefined) clearInterval(interval as number);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    loadRecords();
    loadActiveProfile();
  }, []);

  async function loadRecords() {
    try {
      const raw = await AsyncStorage.getItem('breastfeedingRecords');
      const loaded = raw ? JSON.parse(raw) : [];
      setRecords(loaded);
    } catch (e) {
      console.error(e);
    }
  }

  async function loadActiveProfile() {
    try {
      const profilesRaw = await AsyncStorage.getItem('babyProfiles');
      const activeRaw = await AsyncStorage.getItem('activeProfileIndex');
      if (profilesRaw) {
        const profiles = JSON.parse(profilesRaw);
        const idx = activeRaw ? parseInt(activeRaw, 10) : 0;
        const active = profiles[Math.min(idx, profiles.length - 1)];
        setActiveProfile(active ?? null);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const openModal = (side: 'L' | 'R') => {
    setSelectedSide(side);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedSide(null);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    setTimerStarted(false);
  };

  const handleStartTimer = () => {
    setTimerStarted(true);
    setIsTimerRunning(true);
  };

  const handleTogglePause = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const saveBreastfeedingData = async () => {
    if (selectedSide === null) return;

    const now = new Date();
    const breastfeedingRecord = {
      id: Date.now(),
      lado: selectedSide === 'L' ? 'Esquerdo' : 'Direito',
      tempo: timerSeconds,
      hora: now.toLocaleTimeString('pt-BR'),
      data: now.toLocaleDateString('pt-BR'),
      dataCompleta: now.toISOString(),
      babyName: activeProfile?.name ?? '—',
      feedingType: activeProfile?.feeding ?? '—',
    };

    try {
      const existingData = await AsyncStorage.getItem('breastfeedingRecords');
      const loaded = existingData ? JSON.parse(existingData) : [];
      loaded.push(breastfeedingRecord);
      await AsyncStorage.setItem('breastfeedingRecords', JSON.stringify(loaded));
      setRecords(loaded);
      setSavedTime(timerSeconds);
      closeModal();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados');
      console.error(error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={cardShadow}>
        <BabyProfileSelector />
      </View>

      {/* botoes para selecionar o seio esquerdo ou direito */}

      <Text style={styles.sectionLabel}>Selecione o seio</Text>
      <View style={styles.lrDirection}>
        <Pressable onPress={() => openModal('L')} style={({ pressed }) => [styles.lrBlock, cardShadow, pressed && styles.lrBlockPressed]}>
          <Text style={styles.lrText}>L</Text>
          <Text style={styles.lrSubtext}>Esquerdo</Text>
        </Pressable>

        <Pressable onPress={() => openModal('R')} style={({ pressed }) => [styles.lrBlock, cardShadow, pressed && styles.lrBlockPressed]}>
          <Text style={styles.lrText}>R</Text>
          <Text style={styles.lrSubtext}>Direito</Text>
        </Pressable>
      </View>

      {/* modal para mostrar o seio selecionado */}

      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, cardShadow]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seio {selectedSide === 'L' ? 'Esquerdo' : selectedSide === 'R' ? 'Direito' : ''}</Text>
              <Pressable onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
            
            {!timerStarted ? (
              <Pressable 
                onPress={handleStartTimer}
                style={({ pressed }) => [styles.playButtonLarge, pressed && { opacity: 0.8 }]}
              >
                <Text style={styles.playButtonText}>Iniciar</Text>
              </Pressable>
            ) : (
              <>
                <Pressable 
                  onPress={handleTogglePause}
                  style={styles.timerDisplay}
                >
                  <Text style={styles.timerText}>{formatTime(timerSeconds)}</Text>
                  <Text style={styles.timerSubtext}>
                    {isTimerRunning ? 'Toque para pausar' : 'Toque para retomar'}
                  </Text>
                </Pressable>

                <Pressable 
                  onPress={saveBreastfeedingData}
                  style={({ pressed }) => [styles.finalizeButton, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.finalizeButtonText}>Finalizar</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* <View style={[styles.timerSection, cardShadow]}>
        <Timer onSaveTime={setSavedTime} />
      </View> */}

      <View style={[styles.areaCard, cardShadow]}>
        <Text style={styles.areaLabel}>Tempo da última mamada</Text>
        <Text style={styles.areaValue}>
          {savedTime !== null ? formatTime(savedTime) : '—'}
        </Text>
      </View>

      {/* Separar registros por tipo de alimentação */}
      <View style={[styles.recordsContainer, cardShadow]}>
        <Text style={styles.recordsTitle}>Amamentação</Text>
        {records.filter(r => r.feedingType === 'Amamentação').length === 0 ? (
          <Text style={styles.noRecords}>Nenhum registro</Text>
        ) : (
          records.filter(r => r.feedingType === 'Amamentação').map(r => (
            <View key={r.id} style={styles.recordRow}>
              <Text style={styles.recordText}>{r.babyName} — {r.data} {r.hora} — {formatTime(r.tempo)}</Text>
            </View>
          ))
        )}
      </View>

      <View style={[styles.recordsContainer, cardShadow]}>
        <Text style={styles.recordsTitle}>Mamadeira</Text>
        {records.filter(r => r.feedingType === 'Mamadeira').length === 0 ? (
          <Text style={styles.noRecords}>Nenhum registro</Text>
        ) : (
          records.filter(r => r.feedingType === 'Mamadeira').map(r => (
            <View key={r.id} style={styles.recordRow}>
              <Text style={styles.recordText}>{r.babyName} — {r.data} {r.hora} — {formatTime(r.tempo)}</Text>
            </View>
          ))
        )}
      </View>

      {/* <View style={[styles.areaCard, cardShadow]}>
        <Text style={styles.areaLabel}>Próxima mamada em</Text>
        <CountdownTimer />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingHorizontal: 16,
  },

  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 16,
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
    marginLeft: 12,
    marginTop: 2,
  },

  perfilAvatar: {
    position: 'absolute',
    right: 12,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },

  perfilAvatarText: {
    fontSize: 12,
    color: colors.textOnPrimary,
    opacity: 0.9,
  },

  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 10,
  },

  lrDirection: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
    height: 240,
  },

  lrBlock: {
    flex: 1,
    backgroundColor: colors.accentLight,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  lrBlockPressed: {
    opacity: 0.9,
  },

  lrText: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  lrSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  timerSection: {
    marginBottom: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  areaCard: {
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  areaLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },

  areaValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  recordsContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  noRecords: {
    color: colors.textSecondary,
  },
  recordRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recordText: {
    color: colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  modalContent: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: 'center',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },

  playButtonLarge: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },

  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },

  timerDisplay: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.accentLight,
    borderWidth: 3,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  timerText: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  timerSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },

  finalizeButton: {
    width: '100%',
    paddingVertical: 12,
    backgroundColor: colors.accent,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  finalizeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
