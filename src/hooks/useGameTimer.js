import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime } from '../utils/commonUtils';

/**
 * Hook standard de gestion de chronomètre de jeu (DRY).
 * Gère le décompte en secondes, le démarrage/arrêt/réinitialisation,
 * et fournit la chaîne formatée "MM:SS".
 *
 * @param {boolean} [autoStart=false]
 * @returns {{
 *   seconds: number,
 *   formattedTime: string,
 *   isRunning: boolean,
 *   startTimer: () => void,
 *   stopTimer: () => void,
 *   resetTimer: () => void,
 *   setSeconds: import('react').Dispatch<import('react').SetStateAction<number>>
 * }}
 */
export function useGameTimer(autoStart = false) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef(null);

  const startTimer = useCallback(() => setIsRunning(true), []);
  const stopTimer = useCallback(() => setIsRunning(false), []);
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSeconds(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  return {
    seconds,
    formattedTime: formatTime(seconds),
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    setSeconds
  };
}
