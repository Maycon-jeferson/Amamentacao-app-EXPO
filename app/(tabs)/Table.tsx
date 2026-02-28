import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

interface BreastfeedingRecord {
  id: number;
  lado: string;
  tempo: number;
  hora: string;
  data: string;
  dataCompleta: string;
  babyName?: string;
  feedingType?: string;
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  android: { elevation: 3 },
});

export default function Table() {
  const [records, setRecords] = useState<BreastfeedingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BreastfeedingRecord | null>(null);
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  useFocusEffect(
    React.useCallback(() => {
      loadRecords();
    }, [])
  );

  const loadRecords = async () => {
    try {
      const existingData = await AsyncStorage.getItem('breastfeedingRecords');
      const recordsData = existingData ? JSON.parse(existingData) : [];
      // Ordena em ordem decrescente (mais recentes primeiro)
      setRecords(recordsData.reverse());
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const openMenu = (record: BreastfeedingRecord) => {
    setSelectedRecord(record);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedRecord(null);
  };

  const deleteRecord = async () => {
    if (!selectedRecord) return;

    Alert.alert(
      'Confirmar exclusão',
      `Deseja deletar o registro de mamada do seio ${selectedRecord.lado} em ${selectedRecord.hora}?`,
      [
        {
          text: 'Cancelar',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              const updatedRecords = records.filter(r => r.id !== selectedRecord.id);
              await AsyncStorage.setItem('breastfeedingRecords', JSON.stringify(updatedRecords));
              setRecords(updatedRecords);
              closeMenu();
              Alert.alert('Sucesso', 'Registro deletado com sucesso');
            } catch (error) {
              console.error('Erro ao deletar registro:', error);
              Alert.alert('Erro', 'Não foi possível deletar o registro');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderRecord = ({ item }: { item: BreastfeedingRecord }) => (
    <Pressable 
      onPress={() => openMenu(item)}
      style={({ pressed }) => [styles.recordCard, cardShadow, pressed && { opacity: 0.8 }]}
    >
      {/* Header do Card */}
      <View style={styles.recordHeader}>
        <View style={styles.recordDateTimeContainer}>
          <Text style={styles.recordDate}>{item.data}</Text>
          <Text style={styles.recordTime}>{item.hora}</Text>
        </View>
        <View style={[styles.recordSideBadge, item.lado === 'Esquerdo' ? styles.sideBadgeLeft : styles.sideBadgeRight]}>
          <Text style={styles.recordSideBadgeText}>{item.lado[0]}</Text>
        </View>
      </View>

      {/* Body do Card */}
      <View style={styles.recordBody}>
        <View style={styles.recordRow}>
          <View style={styles.recordField}>
            <Text style={styles.recordLabel}>Bebê</Text>
            <Text style={styles.recordValue}>{item.babyName || '—'}</Text>
          </View>
          <View style={styles.recordField}>
            <Text style={styles.recordLabel}>Tipo</Text>
            <Text style={styles.recordValue}>{item.feedingType || '—'}</Text>
          </View>
        </View>

        <View style={styles.recordRow}>
          <View style={styles.recordField}>
            <Text style={styles.recordLabel}>Duração</Text>
            <Text style={styles.recordDuration}>{formatTime(item.tempo)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Histórico de Mamadas</Text>

      {records.length === 0 ? (
        <View style={[styles.card, cardShadow]}>
          <Text style={styles.emptyText}>Nenhum registro de mamada ainda.</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderRecord}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.recordsListContent}
          scrollEnabled={true}
          showsVerticalScrollIndicator={true}
        />
      )}

      {/* Modal de opções */}
      <Modal visible={menuVisible} transparent animationType="fade" onRequestClose={closeMenu}>
        <Pressable style={styles.menuOverlay} onPress={closeMenu}>
          <View style={[styles.menuContent, cardShadow]}>
            <Text style={styles.menuTitle}>Opções</Text>
            
            <Pressable 
              onPress={deleteRecord}
              style={({ pressed }) => [styles.menuOption, styles.deleteOption, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.deleteOptionText}>🗑️ Deletar</Text>
            </Pressable>

            <Pressable 
              onPress={closeMenu}
              style={({ pressed }) => [styles.menuOption, pressed && { opacity: 0.8 }]}
            >
              <Text style={styles.menuOptionText}>Cancelar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  card: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  recordsListContent: {
    paddingVertical: 8,
    gap: 12,
  },
  recordCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 0,
    overflow: 'hidden',
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(200, 100, 150, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  recordDateTimeContainer: {
    flex: 1,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  recordTime: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  recordSideBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  sideBadgeLeft: {
    backgroundColor: 'rgba(100, 180, 200, 0.2)',
  },
  sideBadgeRight: {
    backgroundColor: 'rgba(200, 100, 150, 0.2)',
  },
  recordSideBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
  },
  recordBody: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recordRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  recordField: {
    flex: 1,
  },
  recordLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  recordValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  recordDuration: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  menuContent: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    gap: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuOption: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deleteOption: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderColor: '#FF3B30',
  },
  deleteOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
