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

const canPushTile = (tileId, dx, dy, currentTiles, allowedGroup) => {
  const tile = currentTiles.find(t => t.id === tileId);
  if (!tile) return false;
  if (allowedGroup && !allowedGroup.has(tileId)) return false;
  const nextX = tile.x + dx;
  const nextY = tile.y + dy;
  if (nextX < 1 || nextX > 6 || nextY < 1 || nextY > maxRows) return false;
  const obstacle = currentTiles.find(t => t.active && t.id !== tileId && t.x === nextX && t.y === nextY);
  if (obstacle) return canPushTile(obstacle.id, dx, dy, currentTiles, allowedGroup);
  return true;
};

const pushTile = (tileId, dx, dy, nextCoords, currentTiles) => {
  const tile = currentTiles.find(t => t.id === tileId);
  if (!tile) return;
  const nextX = tile.x + dx;
  const nextY = tile.y + dy;
  const obstacle = currentTiles.find(t => t.active && t.id !== tileId && t.x === nextX && t.y === nextY);
  if (obstacle) pushTile(obstacle.id, dx, dy, nextCoords, currentTiles);
  nextCoords.set(tileId, { x: nextX, y: nextY });
};

const hasAnyPossibleMovesSlider = (currentTiles) => {
  const active = currentTiles.filter(t => t.active);
  const symbolGroups = new Map();
  active.forEach(t => {
    if (!symbolGroups.has(t.sym)) symbolGroups.set(t.sym, []);
    symbolGroups.get(t.sym).push(t);
  });

  for (const [sym, list] of symbolGroups.entries()) {
    if (list.length < 2) continue;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const t1 = list[i];
        const t2 = list[j];
        if (findConnectionPath(t1, t2, active)) {
            console.log("Direct match", t1.sym);
            return true;
        }

        const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
        for (const [pushTileRef, targetTileRef] of [[t1, t2], [t2, t1]]) {
          for (const dir of directions) {
            let currentLayout = active.map(t => ({ ...t }));
            const allowedGroup = new Set();
            let currentTest = pushTileRef;
            while (currentTest) {
              allowedGroup.add(currentTest.id);
              currentTest = active.find(t => t.x === currentTest.x + dir.dx && t.y === currentTest.y + dir.dy);
            }

            for (let step = 1; step <= 6; step++) {
              const nextCoords = new Map();
              currentLayout.forEach(t => nextCoords.set(t.id, { x: t.x, y: t.y }));
              if (canPushTile(pushTileRef.id, dir.dx, dir.dy, currentLayout, allowedGroup)) {
                pushTile(pushTileRef.id, dir.dx, dir.dy, nextCoords, currentLayout);
                currentLayout = currentLayout.map(t => {
                  const coord = nextCoords.get(t.id);
                  return coord ? { ...t, x: coord.x, y: coord.y } : t;
                });
                const newT1 = currentLayout.find(t => t.id === pushTileRef.id);
                const newT2 = currentLayout.find(t => t.id === targetTileRef.id);
                if (newT1 && newT2 && findConnectionPath(newT1, newT2, currentLayout)) {
                  console.log(`Found move! Push ${pushTileRef.sym} at x:${pushTileRef.x},y:${pushTileRef.y} dir:${dir.dx},${dir.dy} steps:${step}`);
                  // Debug: print layout
                  currentLayout.forEach(t => console.log(`${t.sym}: x:${t.x}, y:${t.y}`));
                  
                  // Let's verify findConnectionPath manually
                  const pathClear = findConnectionPath(newT1, newT2, currentLayout);
                  console.log("Is path really clear?", pathClear);
                  if (pathClear) return true;
                }
              } else {
                break;
              }
            }
          }
        }
      }
    }
  }
  return false;
};

// Screenshot 1 board
const board1 = [
  {id:1, x:1, y:1, sym:'Deux', active:true},
  {id:2, x:2, y:1, sym:'Ouest', active:true},
  {id:3, x:3, y:1, sym:'6_bamboo', active:true},
  {id:4, x:4, y:1, sym:'Fleur', active:true},
  {id:5, x:5, y:1, sym:'Target', active:true},
  {id:6, x:6, y:1, sym:'9_bamboo', active:true},
  
  {id:7, x:5, y:2, sym:'H_bamboo', active:true},
  {id:8, x:6, y:2, sym:'Ouest', active:true},
  
  {id:9, x:1, y:3, sym:'Star', active:true},
  {id:10, x:2, y:3, sym:'Deux', active:true},
  {id:11, x:5, y:3, sym:'Star', active:true},
  {id:12, x:6, y:3, sym:'Target', active:true},
  
  {id:13, x:1, y:4, sym:'9_bamboo', active:true},
  {id:14, x:2, y:4, sym:'H_bamboo', active:true},
  {id:15, x:3, y:4, sym:'Fleur', active:true},
  {id:16, x:4, y:4, sym:'9_dots', active:true},
  {id:17, x:5, y:4, sym:'6_bamboo', active:true},
  {id:18, x:6, y:4, sym:'9_dots', active:true},
];

console.log("Testing Board 1 (Screenshot 1)");
console.log(hasAnyPossibleMovesSlider(board1));

