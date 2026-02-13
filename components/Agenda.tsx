import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { colors } from '../theme';

const Agenda = () => {
  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day: { dateString: string }) => {
          console.log('Selected day: ', day);
        }}
        markedDates={{
          '2024-09-15': { selected: true, marked: true, selectedColor: colors.primary },
          '2024-09-16': { marked: true },
          '2024-09-17': { marked: true, dotColor: colors.accent, activeOpacity: 0 },
        }}
        theme={{
          backgroundColor: colors.surface,
          calendarBackground: colors.surface,
          selectedDayBackgroundColor: colors.primary,
          selectedDayTextColor: colors.textOnPrimary,
          todayTextColor: colors.primary,
          arrowColor: colors.primary,
          monthTextColor: colors.text,
          textSectionTitleColor: colors.textSecondary,
          textDayHeaderFontWeight: '600',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textMonthFontWeight: '700',
        }}
        style={styles.calendar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    marginBottom: 50,
    paddingHorizontal: 16,
  },
  calendar: {
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'android' && { elevation: 2 }),
  },
});

export default Agenda;
