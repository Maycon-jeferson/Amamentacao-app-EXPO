import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

interface TimerState {
  startTime: number | null; // timestamp em ms quando o timer iniciou
  resumeTime: number | null; // timestamp em ms quando foi retomado após pausa
  totalPausedTime: number; // tempo total em ms que ficou pausado
}

const TIMER_STATE_KEY = 'timerState';

export const useTimestampTimer = () => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timerStateRef = useRef<TimerState>({
    startTime: null,
    resumeTime: null,
    totalPausedTime: 0,
  });

  // Inicializar estado ao montar o componente
  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const saved = await AsyncStorage.getItem(TIMER_STATE_KEY);
        if (saved) {
          const state: TimerState = JSON.parse(saved);
          timerStateRef.current = state;

          // Se havia um timer em execução, recalcular o tempo decorrido
          if (state.startTime) {
            const now = Date.now();
            const elapsedMs = now - state.startTime - state.totalPausedTime;
            const elapsedSecs = Math.floor(elapsedMs / 1000);
            setElapsedSeconds(Math.max(0, elapsedSecs));
            setIsRunning(true);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar estado do timer:', error);
      }
    };

    loadTimerState();
  }, []);

  // Atualizar timer a cada 100ms para exibição suave
  useEffect(() => {
    if (isRunning && timerStateRef.current.startTime) {
      const updateTimer = () => {
        const now = Date.now();
        const elapsedMs =
          now -
          timerStateRef.current.startTime! -
          timerStateRef.current.totalPausedTime;
        const elapsedSecs = Math.floor(elapsedMs / 1000);
        setElapsedSeconds(Math.max(0, elapsedSecs));
      };

      // Atualizar imediatamente
      updateTimer();

      // Depois a cada 100ms para não sobrecarregar
      intervalRef.current = setInterval(updateTimer, 100) as unknown as number;
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as number);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current as number);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Salvar estado do timer no AsyncStorage a cada mudança
  useEffect(() => {
    const saveState = async () => {
      try {
        await AsyncStorage.setItem(
          TIMER_STATE_KEY,
          JSON.stringify(timerStateRef.current)
        );
      } catch (error) {
        console.error('Erro ao salvar estado do timer:', error);
      }
    };

    saveState();
  }, [elapsedSeconds, isRunning]);

  const startTimer = () => {
    if (!isRunning && timerStateRef.current.startTime === null) {
      // Iniciar um novo timer
      timerStateRef.current.startTime = Date.now();
      timerStateRef.current.resumeTime = Date.now();
      timerStateRef.current.totalPausedTime = 0;
      setElapsedSeconds(0);
    } else if (!isRunning && timerStateRef.current.startTime !== null) {
      // Retomar um timer pausado
      const now = Date.now();
      if (timerStateRef.current.resumeTime) {
        const pausedTime = now - timerStateRef.current.resumeTime;
        timerStateRef.current.totalPausedTime += pausedTime;
      }
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (timerStateRef.current.startTime) {
      timerStateRef.current.resumeTime = Date.now();
    }
  };

  const stopTimer = (): number => {
    setIsRunning(false);
    const finalSeconds = elapsedSeconds;
    
    // Limpar estado
    timerStateRef.current = {
      startTime: null,
      resumeTime: null,
      totalPausedTime: 0,
    };
    setElapsedSeconds(0);

    // Limpar AsyncStorage
    AsyncStorage.removeItem(TIMER_STATE_KEY).catch((error: Error) => {
      console.error('Erro ao limpar estado do timer:', error);
    });

    return finalSeconds;
  };

  const resetTimer = () => {
    setIsRunning(false);
    timerStateRef.current = {
      startTime: null,
      resumeTime: null,
      totalPausedTime: 0,
    };
    setElapsedSeconds(0);
    AsyncStorage.removeItem(TIMER_STATE_KEY).catch((error: Error) => {
      console.error('Erro ao limpar estado do timer:', error);
    });
  };

  const getTimestamps = () => ({
    startTime: timerStateRef.current.startTime,
    endTime: Date.now(),
  });

  return {
    elapsedSeconds,
    isRunning,
    startTimer,
    pauseTimer,
    stopTimer,
    resetTimer,
    getTimestamps,
  };
};
