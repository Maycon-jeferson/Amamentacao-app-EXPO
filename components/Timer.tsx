import React, { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type TimerProps = {
  onSaveTime: (time: number) => void;
};

const Timer: React.FC<TimerProps> = ({ onSaveTime }) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervaloRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervaloRef.current = setInterval(() => {
        setSeconds(prevSecond => prevSecond + 1);
      }, 1000);
    } else if (intervaloRef.current) {
      clearInterval(intervaloRef.current as number);
      intervaloRef.current = null;
    }

    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current as number);
      }
    };
  }, [isRunning]);

  const toggleTimer = () => {
    if (isRunning) {
      onSaveTime(seconds);
      setSeconds(0);
    }
    setIsRunning(prevState => !prevState);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timeText}>{formatTime(seconds)}</Text>
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
