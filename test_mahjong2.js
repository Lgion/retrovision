const maxRows = 4;

const checkPathClear = (x1, y1, x2, y2, activeTiles, ignoreIds = []) => {
  if (x1 === x2) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY + 1; y < maxY; y++) {
      if (y < 1 || y > maxRows) continue;
      if (x1 < 1 || x1 > 6) continue;
      const hasTile = activeTiles.some(t => t.active && t.x === x1 && t.y === y && !ignoreIds.includes(t.id));
      if (hasTile) return false;
    }
    return true;
  }
  if (y1 === y2) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX + 1; x < maxX; x++) {
      if (x < 1 || x > 6) continue;
      if (y1 < 1 || y1 > maxRows) continue;
      const hasTile = activeTiles.some(t => t.active && t.x === x && t.y === y1 && !ignoreIds.includes(t.id));
      if (hasTile) return false;
    }
    return true;
  }
  return false;
};

const findConnectionPath = (t1, t2, activeTiles) => {
  const ignoreIds = [t1.id, t2.id];
  if (t1.x === t2.x && checkPathClear(t1.x, t1.y, t2.x, t2.y, activeTiles, ignoreIds)) return true;
  if (t1.y === t2.y && checkPathClear(t1.x, t1.y, t2.x, t2.y, activeTiles, ignoreIds)) return true;
  return false;
};

// ... Wait, the algorithm pushes the tile but DOES NOT allow wrapping around! Wait, in my game, tiles wrap when pushed... 
// Wait, the test algorithm canPushTile returned false if it hit the bounds (`if (nextX < 1 || nextX > 6 || nextY < 1 || nextY > maxRows) return false;`) but in the actual code `MahjongZen.jsx`:

// let's look at `canPushTile` in the actual code
