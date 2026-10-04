import { useState, useCallback } from 'react';
import { storage } from '../utils/storage';

/**
 * Universal hook for game high scores.
 * Uses storage utility with fallback and handles both higher-is-better and lower-is-better (e.g. moves/timer).
 */
export function useHighScore(storageKey, defaultValue = 0, isLowerBetter = false) {
  const [highScore, setHighScore] = useState(() => {
    return storage.getNumber(storageKey, defaultValue);
  });

  const recordScore = useCallback((newScore) => {
    if (newScore === null || newScore === undefined || isNaN(newScore)) return false;

    setHighScore((prev) => {
      let isBetter = false;
      if (prev === 0 || prev === defaultValue) {
        isBetter = true;
      } else if (isLowerBetter) {
        isBetter = newScore < prev;
      } else {
        isBetter = newScore > prev;
      }

      if (isBetter) {
        storage.setNumber(storageKey, newScore);
        return newScore;
      }
      return prev;
    });
  }, [storageKey, defaultValue, isLowerBetter]);

  const resetHighScore = useCallback(() => {
    storage.removeItem(storageKey);
    setHighScore(defaultValue);
  }, [storageKey, defaultValue]);

  return [highScore, recordScore, resetHighScore];
}
