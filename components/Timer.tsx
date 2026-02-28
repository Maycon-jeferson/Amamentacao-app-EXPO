import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTimestampTimer } from '../hooks/useTimestampTimer';
import { colors } from '../theme';

type TimerProps = {
  onSaveTime: (time: number) => void;
};

const Timer: React.FC<TimerProps> = ({ onSaveTime }) => {
  const { elapsedSeconds, isRunning, startTimer, pauseTimer, stopTimer } =
    useTimestampTimer();

  const toggleTimer = () => {
    if (isRunning) {
      const finalSeconds = stopTimer();
      onSaveTime(finalSeconds);
    } else {
      startTimer();
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(elapsedSeconds)}</Text>
      <Pressable
        onPress={toggleTimer}
        style={({ pressed }) => [
          styles.button,
          isRunning ? styles.buttonStop : styles.buttonStart,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          {isRunning ? 'Parar' : 'Iniciar'}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    fontVariant: ['tabular-nums'],
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    ...(Platform.OS === 'android' && { elevation: 2 }),
  },
  buttonStart: {
    backgroundColor: colors.primary,
  },
  buttonStop: {
    backgroundColor: colors.error,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});

export default Timer;
