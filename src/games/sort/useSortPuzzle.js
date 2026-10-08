import { useState, useRef, useCallback, useEffect } from 'react';
import {
  DEFAULT_CAPACITY,
  getTubeCapacity,
  canMove,
  executeMove,
  checkVictory,
  calculateProgress,
  findHint,
  generatePuzzle
} from './sortLogic';
import { sound } from '../../utils/sound';

export function useSortPuzzle({
  isIntermission = false,
  intermissionDifficulty = 'facile',
  defaultDifficulty = 5,
  defaultCap = DEFAULT_CAPACITY,
  onVictory = null,
  onIntermissionComplete = null,
  replaySameIntermission = false,
  onToggleReplaySameIntermission = null
}) {
  const [tubes, setTubes] = useState([]);
  const [selectedTube, setSelectedTube] = useState(null);
  const [extraTubesCount, setExtraTubesCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [moves, setMoves] = useState(0);
  const [victoryPhase, setVictoryPhase] = useState(0);
  const [completedTubeIndex, setCompletedTubeIndex] = useState(null);
  const [hintTubes, setHintTubes] = useState(null);
  const [numFilled, setNumFilled] = useState(defaultDifficulty);

  const baseTubesCountRef = useRef(0);
  const lastNumFilledRef = useRef(0);

  const initGame = useCallback((overrideDiff = null) => {
    let targetNumFilled;
    if (isIntermission) {
      let min = 3, max = 4;
      if (intermissionDifficulty === 'facile') { min = 3; max = 4; }
      else if (intermissionDifficulty === 'moyen') { min = 5; max = 6; }
      else if (intermissionDifficulty === 'difficile') { min = 7; max = 9; }
      do {
        targetNumFilled = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (targetNumFilled === lastNumFilledRef.current && (max - min) > 0);
    } else {
      targetNumFilled = parseInt(overrideDiff || defaultDifficulty) || 5;
    }

    lastNumFilledRef.current = targetNumFilled;
    setNumFilled(targetNumFilled);

    const puzzle = generatePuzzle(targetNumFilled, defaultCap);
    baseTubesCountRef.current = puzzle.baseTubesCount;

    setTubes(puzzle.tubes);
    setSelectedTube(null);
    setExtraTubesCount(0);
    setHistory([]);
    setMoves(0);
    setVictoryPhase(0);
    setCompletedTubeIndex(null);
    setHintTubes(null);
  }, [isIntermission, intermissionDifficulty, defaultDifficulty, defaultCap]);

  // Initial mount
  useEffect(() => {
    initGame();
  }, [initGame]);

  const tubeCapacity = useCallback((index) => {
    return getTubeCapacity(index, tubes.length, extraTubesCount, defaultCap);
  }, [tubes.length, extraTubesCount, defaultCap]);

  const progress = calculateProgress(tubes, numFilled, extraTubesCount, defaultCap);

  // Undo move
  const undo = useCallback(() => {
    if (history.length === 0 || victoryPhase !== 0) return;
    const prev = history[history.length - 1];
    const prevTubes = JSON.parse(prev);

    setTubes(prevTubes);
    // Properly reset extra tube if previous state did not have the extra tube
    if (prevTubes.length === baseTubesCountRef.current) {
      setExtraTubesCount(0);
    }

    setHistory(prevHist => prevHist.slice(0, -1));
    setSelectedTube(null);
    setHintTubes(null);
    sound.playClick();
  }, [history, victoryPhase]);

  // Add extra tube bonus
  const addExtraTube = useCallback(() => {
    if (victoryPhase !== 0 || extraTubesCount >= 1) return;
    sound.playBonus();
    setHistory(prev => [...prev, JSON.stringify(tubes)]);
    setExtraTubesCount(1);
    setTubes(prev => [...prev, []]);
  }, [victoryPhase, extraTubesCount, tubes]);

  // Show a hint
  const triggerHint = useCallback(() => {
    if (victoryPhase !== 0) return;
    const hint = findHint(tubes, extraTubesCount, defaultCap);
    if (hint) {
      sound.playBonus();
      setHintTubes(hint);
      setSelectedTube(null);
      setTimeout(() => setHintTubes(null), 3000);
    }
  }, [victoryPhase, tubes, extraTubesCount, defaultCap]);

  // Check victory after state update
  const checkAndHandleVictory = useCallback((nextTubes) => {
    const isWon = checkVictory(nextTubes, extraTubesCount, defaultCap);
    if (isWon && victoryPhase === 0) {
      sound.playVictory();
      setVictoryPhase(1);

      if (onVictory) {
        onVictory();
      }
    }
  }, [extraTubesCount, defaultCap, victoryPhase, onVictory, initGame]);

  return {
    tubes,
    setTubes,
    selectedTube,
    setSelectedTube,
    extraTubesCount,
    setExtraTubesCount,
    baseTubesCount: baseTubesCountRef.current,
    history,
    setHistory,
    moves,
    setMoves,
    victoryPhase,
    setVictoryPhase,
    completedTubeIndex,
    setCompletedTubeIndex,
    hintTubes,
    setHintTubes,
    numFilled,
    initGame,
    tubeCapacity,
    progress,
    undo,
    addExtraTube,
    triggerHint,
    checkAndHandleVictory,
    canMove: (src, dest) => canMove(tubes, src, dest, extraTubesCount, defaultCap),
    executeMove: (src, dest, moveSingle = false) => executeMove(tubes, src, dest, extraTubesCount, defaultCap, moveSingle)
  };
}
