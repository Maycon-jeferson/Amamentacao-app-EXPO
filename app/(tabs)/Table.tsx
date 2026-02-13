import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

interface BreastfeedingRecord {
  id: number;
  lado: string;
  tempo: number;
  hora: string;
  data: string;
  dataCompleta: string;
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
      style={({ pressed }) => [styles.tableRow, pressed && { opacity: 0.7 }]}
    >
      <Text style={[styles.tableCell, styles.dateCell]}>{item.data}</Text>
      <Text style={[styles.tableCell, styles.timeCell]}>{item.hora}</Text>
      <Text style={[styles.tableCell, styles.sideCell]}>{item.lado}</Text>
      <Text style={[styles.tableCell, styles.durationCell]}>{formatTime(item.tempo)}</Text>
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
        <ScrollView style={styles.tableContainer} horizontal={false}>
          {/* Cabeçalho da tabela */}
          <View style={[styles.tableHeader, cardShadow]}>
            <Text style={[styles.tableHeaderCell, styles.dateCell]}>Data</Text>
            <Text style={[styles.tableHeaderCell, styles.timeCell]}>Hora</Text>
            <Text style={[styles.tableHeaderCell, styles.sideCell]}>Lado</Text>
            <Text style={[styles.tableHeaderCell, styles.durationCell]}>Tempo</Text>
          </View>

          {/* Linhas da tabela */}
          <FlatList
            data={records}
            renderItem={renderRecord}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        </ScrollView>
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
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  card: {
    width: '100%',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  tableContainer: {
    flex: 1,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginBottom: 2,
  },
  tableHeaderCell: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 1,
  },
  tableCell: {
    fontSize: 12,
    color: colors.text,
  },
  dateCell: {
    flex: 1.2,
    fontWeight: '500',
  },
  timeCell: {
    flex: 1,
    textAlign: 'center',
  },
  sideCell: {
    flex: 0.8,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.accent,
  },
  durationCell: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '700',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  menuContent: {
    width: '100%',
    maxWidth: 300,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
  },
  menuOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  deleteOption: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  deleteOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF3B30',
  },
});
