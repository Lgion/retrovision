/**
 * Pure functions for Sort puzzle games (WaterSort & BallSort).
 */

export const DEFAULT_CAPACITY = 4;

export const COLOR_KEYS = ['R', 'B', 'G', 'Y', 'P', 'O', 'W', 'D', 'M'];

/**
 * Tube capacity: extra tube has capacity 1, regular tubes have defaultCap.
 */
export function getTubeCapacity(index, totalTubes, extraTubesCount, defaultCap = DEFAULT_CAPACITY) {
  if (extraTubesCount > 0 && index === totalTubes - 1) {
    return 1;
  }
  return defaultCap;
}

/**
 * Count consecutive identical items from the top of the tube.
 */
export function getTopColorGroupCount(tube) {
  if (!tube || tube.length === 0) return 0;
  const topColor = tube[tube.length - 1];
  let count = 0;
  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === topColor) count++;
    else break;
  }
  return count;
}

/**
 * Check if an item can be moved from srcIdx to destIdx.
 */
export function canMove(tubes, srcIdx, destIdx, extraTubesCount = 0, defaultCap = DEFAULT_CAPACITY) {
  if (srcIdx === destIdx) return false;
  const src = tubes[srcIdx];
  const dest = tubes[destIdx];
  if (!src || src.length === 0) return false;
  if (!dest) return false;

  const destCap = getTubeCapacity(destIdx, tubes.length, extraTubesCount, defaultCap);
  if (dest.length >= destCap) return false;

  // An empty tube can receive any item
  if (dest.length === 0) {
    // Optimization/rule: don't move into empty tube if src is already pure and full
    const srcCap = getTubeCapacity(srcIdx, tubes.length, extraTubesCount, defaultCap);
    if (src.length === srcCap && src.every(c => c === src[0])) return false;
    return true;
  }

  // Top color must match
  const topSrc = src[src.length - 1];
  const topDest = dest[dest.length - 1];
  return topSrc === topDest;
}

/**
 * Execute a move and return the new tubes array + how many items moved.
 */
export function executeMove(tubes, srcIdx, destIdx, extraTubesCount = 0, defaultCap = DEFAULT_CAPACITY, moveSingle = false) {
  if (!canMove(tubes, srcIdx, destIdx, extraTubesCount, defaultCap)) {
    return { newTubes: tubes, movedCount: 0 };
  }

  const newTubes = tubes.map(t => [...t]);
  const destCap = getTubeCapacity(destIdx, tubes.length, extraTubesCount, defaultCap);
  const spaceLeft = destCap - newTubes[destIdx].length;
  const topCount = getTopColorGroupCount(newTubes[srcIdx]);

  const countToMove = moveSingle ? 1 : Math.min(spaceLeft, topCount);
  if (countToMove <= 0) return { newTubes: tubes, movedCount: 0 };

  const movedItems = newTubes[srcIdx].splice(newTubes[srcIdx].length - countToMove, countToMove);
  newTubes[destIdx].push(...movedItems);

  return { newTubes, movedCount: countToMove };
}

/**
 * Check victory: every tube is either empty or full with all identical items.
 */
export function checkVictory(tubes, extraTubesCount = 0, defaultCap = DEFAULT_CAPACITY) {
  if (!tubes || tubes.length === 0) return false;
  return tubes.every((tube, idx) => {
    if (tube.length === 0) return true;
    const cap = getTubeCapacity(idx, tubes.length, extraTubesCount, defaultCap);
    if (tube.length === cap) {
      return tube.every(item => item === tube[0]);
    }
    return false;
  });
}

/**
 * Calculate completion progress between 0 and 1.
 */
export function calculateProgress(tubes, numFilled, extraTubesCount = 0, defaultCap = DEFAULT_CAPACITY) {
  if (!tubes || numFilled <= 0) return 0;
  let completedTubes = 0;
  tubes.forEach((t, idx) => {
    const cap = getTubeCapacity(idx, tubes.length, extraTubesCount, defaultCap);
    if (t.length === cap && t.every(item => item === t[0])) {
      completedTubes++;
    }
  });
  return Math.min(1, completedTubes / numFilled);
}

/**
 * Find a valid move for a hint. Returns [srcIdx, destIdx] or null.
 */
export function findHint(tubes, extraTubesCount = 0, defaultCap = DEFAULT_CAPACITY) {
  for (let s = 0; s < tubes.length; s++) {
    if (tubes[s].length === 0) continue;
    const sCap = getTubeCapacity(s, tubes.length, extraTubesCount, defaultCap);
    if (tubes[s].length === sCap && tubes[s].every(c => c === tubes[s][0])) continue;

    for (let d = 0; d < tubes.length; d++) {
      if (s === d) continue;
      if (canMove(tubes, s, d, extraTubesCount, defaultCap)) {
        return [s, d];
      }
    }
  }
  return null;
}

/**
 * State key for solver hashing (canonical ordering to avoid permutations).
 */
function serializeState(tubes) {
  return tubes
    .map(t => t.join(''))
    .sort()
    .join('|');
}

/**
 * Fast DFS solver to verify solvability.
 */
export function isSolvable(initialTubes, defaultCap = DEFAULT_CAPACITY, maxDepth = 60, maxVisited = 5000) {
  const visited = new Set();
  let visitedCount = 0;

  function dfs(tubes, depth) {
    if (checkVictory(tubes, 0, defaultCap)) return true;
    if (depth >= maxDepth || visitedCount >= maxVisited) return false;

    const stateKey = serializeState(tubes);
    if (visited.has(stateKey)) return false;
    visited.add(stateKey);
    visitedCount++;

    for (let s = 0; s < tubes.length; s++) {
      if (tubes[s].length === 0) continue;
      for (let d = 0; d < tubes.length; d++) {
        if (s === d) continue;
        if (canMove(tubes, s, d, 0, defaultCap)) {
          const { newTubes, movedCount } = executeMove(tubes, s, d, 0, defaultCap, false);
          if (movedCount > 0) {
            if (dfs(newTubes, depth + 1)) return true;
          }
        }
      }
    }
    return false;
  }

  return dfs(initialTubes, 0);
}

/**
 * Generate a new game setup with empty tubes rule:
 * Rule: >= 5 colors => 2 empty tubes; < 5 colors => 1 empty tube.
 */
export function generatePuzzle(numFilledOrConfig, defaultCapParam = DEFAULT_CAPACITY, maxAttemptsParam = 30) {
  let numFilled = 4;
  let defaultCap = defaultCapParam;
  let maxAttempts = maxAttemptsParam;

  if (typeof numFilledOrConfig === 'object' && numFilledOrConfig !== null) {
    numFilled = numFilledOrConfig.numFilled || 4;
    defaultCap = numFilledOrConfig.capacity || numFilledOrConfig.defaultCap || defaultCapParam;
    maxAttempts = numFilledOrConfig.maxAttempts || maxAttemptsParam;
  } else if (typeof numFilledOrConfig === 'number') {
    numFilled = numFilledOrConfig;
  }

  // Empty tubes rule: starting from 5 filled tubes, exactly 2 empty tubes; otherwise 1
  const numEmpty = numFilled >= 5 ? 2 : 1;
  const activeKeys = COLOR_KEYS.slice(0, numFilled);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const liquidPool = [];
    activeKeys.forEach(col => {
      for (let i = 0; i < defaultCap; i++) liquidPool.push(col);
    });

    // Fisher-Yates shuffle
    for (let i = liquidPool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [liquidPool[i], liquidPool[j]] = [liquidPool[j], liquidPool[i]];
    }

    const tubes = [];
    for (let i = 0; i < numFilled; i++) {
      tubes.push(liquidPool.slice(i * defaultCap, (i + 1) * defaultCap));
    }
    for (let i = 0; i < numEmpty; i++) {
      tubes.push([]);
    }

    // Verify it is not already won and is solvable
    if (!checkVictory(tubes, 0, defaultCap)) {
      if (isSolvable(tubes, defaultCap)) {
        return { tubes, numFilled, numEmpty, baseTubesCount: numFilled + numEmpty };
      }
    }
  }

  // Fallback if solver hits max attempts
  const liquidPool = [];
  activeKeys.forEach(col => {
    for (let i = 0; i < defaultCap; i++) liquidPool.push(col);
  });
  for (let i = liquidPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [liquidPool[i], liquidPool[j]] = [liquidPool[j], liquidPool[i]];
  }
  const tubes = [];
  for (let i = 0; i < numFilled; i++) {
    tubes.push(liquidPool.slice(i * defaultCap, (i + 1) * defaultCap));
  }
  for (let i = 0; i < numEmpty; i++) {
    tubes.push([]);
  }

  return { tubes, numFilled, numEmpty, baseTubesCount: numFilled + numEmpty };
}
