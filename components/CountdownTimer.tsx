import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

const CountdownTimer = () => {
  const [seconds, setSeconds] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervaloRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      intervaloRef.current = setInterval(() => {
        setSeconds(prev => prev - 1);
      }, 1000);
    } else if (seconds === 0 || !isRunning) {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current as number);
        intervaloRef.current = null;
      }
    }

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current as number);
      }
    };
  }, [isRunning, seconds]);

  const addTime = () => setSeconds(prev => prev + 600);
  const startTimer = () => setIsRunning(true);
  const stopAndResetTimer = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const displayTime = `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{displayTime}</Text>
      <View style={styles.buttonRow}>
        <Pressable
          onPress={addTime}
          style={({ pressed }) => [styles.smallButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.smallButtonText}>+ 10 min</Text>
        </Pressable>
        {seconds > 0 && !isRunning && (
          <Pressable
            onPress={startTimer}
            style={({ pressed }) => [styles.smallButton, styles.buttonStart, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>Iniciar</Text>
          </Pressable>
        )}
        {isRunning && (
          <Pressable
            onPress={stopAndResetTimer}
            style={({ pressed }) => [styles.smallButton, styles.buttonStop, pressed && styles.buttonPressed]}
          >
            <Text style={styles.primaryButtonText}>Parar e zerar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    fontVariant: ['tabular-nums'],
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    ...(Platform.OS === 'android' && { elevation: 1 }),
  },
  buttonStart: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonStop: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  smallButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
});

export default CountdownTimer;
