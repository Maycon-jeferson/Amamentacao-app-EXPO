import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
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

export default function Baby() {
  return (
    <View style={styles.container}>
      <View style={[styles.card, cardShadow]}>
        <Text style={styles.title}>Bebê</Text>
        <Text style={styles.subtitle}>Informações e perfil do bebê em breve.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
