import re

with open('/home/nihongo/Bureau/CASCADE/retrovision/src/games/ArrowPuzzle.jsx', 'r') as f:
    code = f.read()

# Add wires state
code = code.replace("  const [arrowsLeft, setArrowsLeft] = useState(0);", "  const [arrowsLeft, setArrowsLeft] = useState(0);\n  const [wires, setWires] = useState([]);")

# Add generateWireBoard
wire_board_func = """
  const generateWireBoard = (size, numWires) => {
    let newGrid = Array(size).fill(null).map(() => Array(size).fill(null));
    let newWires = [];
    const dirKeys = Object.keys(DIRS);
    let attempts = 0;

    while (newWires.length < numWires && attempts < 3000) {
      attempts++;
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      if (newGrid[r][c] !== null) continue;

      const dirName = dirKeys[Math.floor(Math.random() * dirKeys.length)];
      const dir = DIRS[dirName];

      const isRayClear = (startR, startC) => {
        let currR = startR + dir.dr;
        let currC = startC + dir.dc;
        while (currR >= 0 && currR < size && currC >= 0 && currC < size) {
          if (newGrid[currR][currC] !== null) return false;
          currR += dir.dr;
          currC += dir.dc;
        }
        return true;
      };

      if (!isRayClear(r, c)) continue;

      let currentWire = [{r, c}];
      let currentCells = new Set([`${r},${c}`]);
      const targetLength = 2 + Math.floor(Math.random() * 6);

      let growAttempts = 0;
      while (currentWire.length < targetLength && growAttempts < 30) {
        growAttempts++;
        const tail = currentWire[currentWire.length - 1];
        
        const neighbors = [
          {dr: -1, dc: 0}, {dr: 1, dc: 0}, {dr: 0, dc: -1}, {dr: 0, dc: 1}
        ].sort(() => Math.random() - 0.5);

        let grown = false;
        for (let n of neighbors) {
          const nr = tail.r + n.dr;
          const nc = tail.c + n.dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
            if (newGrid[nr][nc] === null && !currentCells.has(`${nr},${nc}`)) {
              if (isRayClear(nr, nc)) {
                currentWire.push({r: nr, c: nc});
                currentCells.add(`${nr},${nc}`);
                grown = true;
                break;
              }
            }
          }
        }
        if (!grown) break;
      }

      const wireId = `wire_${newWires.length}`;
      const color = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#06b6d4', '#f43f5e'][Math.floor(Math.random() * 7)];
      
      for (let cell of currentWire) {
        newGrid[cell.r][cell.c] = wireId;
      }

      newWires.push({
        id: wireId,
        path: currentWire,
        dir: dirName,
        color: color
      });
    }

    return { grid: newGrid, placed: newWires.length, wires: newWires };
  };
"""
code = code.replace("  const startGame = (size, arrows) => {", wire_board_func + "\n  const startGame = (size, arrows) => {")

# Update startGame
start_game_orig = """  const startGame = (size, arrows) => {
    sound.playClick();
    setBoardSize(size);
    const { grid: newGrid, placed } = mode === 'dense' ? generateDenseBoard(size) : generateBoard(size, arrows);
    setGrid(newGrid);
    setArrowsLeft(placed);
    setMoves(0);
    setVictoryPhase(0);
    setFlyingArrows([]);
    setGameState('playing');
    sound.startBGM();
  };"""

start_game_new = """  const startGame = (size, arrows) => {
    sound.playClick();
    setBoardSize(size);
    if (mode === 'wire') {
      const { grid: newGrid, placed, wires: newWires } = generateWireBoard(size, arrows);
      setGrid(newGrid);
      setWires(newWires);
      setArrowsLeft(placed);
    } else {
      const { grid: newGrid, placed } = mode === 'dense' ? generateDenseBoard(size) : generateBoard(size, arrows);
      setGrid(newGrid);
      setWires([]);
      setArrowsLeft(placed);
    }
    setMoves(0);
    setVictoryPhase(0);
    setFlyingArrows([]);
    setGameState('playing');
    sound.startBGM();
  };"""
code = code.replace(start_game_orig, start_game_new)

# Add handleWireTap
wire_tap_func = """
  const handleWireTap = (wire) => {
    if (victoryPhase > 0) return;

    const dir = DIRS[wire.dir];
    let canFly = true;
    for (let cell of wire.path) {
      let currR = cell.r + dir.dr;
      let currC = cell.c + dir.dc;
      while (currR >= 0 && currR < boardSize && currC >= 0 && currC < boardSize) {
        const hit = grid[currR][currC];
        if (hit !== null && hit !== wire.id) {
          canFly = false;
          break;
        }
        currR += dir.dr;
        currC += dir.dc;
      }
      if (!canFly) break;
    }

    if (canFly) {
      sound.playBallDrop();
      const newGrid = [...grid.map(row => [...row])];
      for (let cell of wire.path) {
        newGrid[cell.r][cell.c] = null;
      }
      setGrid(newGrid);
      setMoves(m => m + 1);

      const el = document.getElementById(wire.id);
      if (el) {
        const dx = dir.dc * 600;
        const dy = dir.dr * 600;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
        el.style.opacity = '0';
      }

      setTimeout(() => {
        setWires(prev => prev.filter(w => w.id !== wire.id));
      }, 400);

      const newLeft = arrowsLeft - 1;
      setArrowsLeft(newLeft);
      if (newLeft === 0) handleVictory();

    } else {
      sound.playShake();
      const el = document.getElementById(wire.id);
      if (el) {
        el.classList.remove('shake-anim');
        void el.offsetWidth;
        el.classList.add('shake-anim');
      }
    }
  };
"""
code = code.replace("  const handleVictory = () => {", wire_tap_func + "\n  const handleVictory = () => {")

# Update Mode Toggle buttons
buttons_orig = """          <div style={{display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '30px'}}>
            <button 
              onClick={() => { setMode('scattered'); localStorage.setItem('retrovision_arrow_mode', 'scattered'); sound.playClick(); }}
              style={{
                background: mode === 'scattered' ? '#3b82f6' : 'transparent',
                color: mode === 'scattered' ? 'white' : '#cbd5e1',
                border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Éparpillé
            </button>
            <button 
              onClick={() => { setMode('dense'); localStorage.setItem('retrovision_arrow_mode', 'dense'); sound.playClick(); }}
              style={{
                background: mode === 'dense' ? '#10b981' : 'transparent',
                color: mode === 'dense' ? 'white' : '#cbd5e1',
                border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Bloc Dense
            </button>
          </div>"""

buttons_new = """          <div style={{display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '30px', flexWrap: 'wrap', justifyContent: 'center'}}>
            <button 
              onClick={() => { setMode('scattered'); localStorage.setItem('retrovision_arrow_mode', 'scattered'); sound.playClick(); }}
              style={{
                background: mode === 'scattered' ? '#3b82f6' : 'transparent',
                color: mode === 'scattered' ? 'white' : '#cbd5e1',
                border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Éparpillé
            </button>
            <button 
              onClick={() => { setMode('dense'); localStorage.setItem('retrovision_arrow_mode', 'dense'); sound.playClick(); }}
              style={{
                background: mode === 'dense' ? '#10b981' : 'transparent',
                color: mode === 'dense' ? 'white' : '#cbd5e1',
                border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Bloc Dense
            </button>
            <button 
              onClick={() => { setMode('wire'); localStorage.setItem('retrovision_arrow_mode', 'wire'); sound.playClick(); }}
              style={{
                background: mode === 'wire' ? '#ec4899' : 'transparent',
                color: mode === 'wire' ? 'white' : '#cbd5e1',
                border: 'none', padding: '10px 20px', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold'
              }}
            >
              Filaires
            </button>
          </div>"""
code = code.replace(buttons_orig, buttons_new)

# Update Rendering to support wire mode
grid_orig = """          <div style={{
            position: 'relative', width: boardSize * CELL_SIZE, height: boardSize * CELL_SIZE,
            backgroundColor: '#1e293b', borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', margin: '0 auto', overflow: 'visible'
          }}>
            {/* Grid Lines */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'grid', gridTemplateColumns: `repeat(${boardSize}, 1fr)`, zIndex: 0
            }}>
              {Array.from({length: boardSize * boardSize}).map((_, i) => (
                <div key={i} style={{ border: '1px dashed rgba(255,255,255,0.05)' }} />
              ))}
            </div>

            {/* Static Arrows */}
            {grid.map((row, r) => row.map((arrow, c) => {"""

grid_new = """          <div style={{
            position: 'relative', width: boardSize * CELL_SIZE, height: boardSize * CELL_SIZE,
            backgroundColor: mode === 'wire' ? '#f8fafc' : '#1e293b', 
            borderRadius: '12px', border: '2px solid rgba(255,255,255,0.1)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)', margin: '0 auto', overflow: mode === 'wire' ? 'hidden' : 'visible'
          }}>
            {/* Grid Lines */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'grid', gridTemplateColumns: `repeat(${boardSize}, 1fr)`, zIndex: 0
            }}>
              {Array.from({length: boardSize * boardSize}).map((_, i) => (
                <div key={i} style={{ border: `1px ${mode === 'wire' ? 'solid #e2e8f0' : 'dashed rgba(255,255,255,0.05)'}` }} />
              ))}
            </div>

            {mode === 'wire' ? (
              <svg width={boardSize * CELL_SIZE} height={boardSize * CELL_SIZE} style={{position: 'absolute', top: 0, left: 0, zIndex: 10, overflow: 'visible'}}>
                {wires.map(wire => {
                  const points = wire.path.map(p => `${p.c * CELL_SIZE + CELL_SIZE/2},${p.r * CELL_SIZE + CELL_SIZE/2}`).join(' ');
                  const head = wire.path[0];
                  const cx = head.c * CELL_SIZE + CELL_SIZE/2;
                  const cy = head.r * CELL_SIZE + CELL_SIZE/2;
                  let arrowPoly = "";
                  const size = 10;
                  if (wire.dir === 'up') arrowPoly = `${cx-size},${cy+size} ${cx},${cy-size} ${cx+size},${cy+size}`;
                  if (wire.dir === 'down') arrowPoly = `${cx-size},${cy-size} ${cx},${cy+size} ${cx+size},${cy-size}`;
                  if (wire.dir === 'left') arrowPoly = `${cx+size},${cy-size} ${cx-size},${cy} ${cx+size},${cy+size}`;
                  if (wire.dir === 'right') arrowPoly = `${cx-size},${cy-size} ${cx+size},${cy} ${cx-size},${cy+size}`;

                  return (
                    <g 
                      key={wire.id} 
                      id={wire.id}
                      onClick={() => handleWireTap(wire)}
                      style={{ cursor: 'pointer', transition: 'transform 0.4s ease-in, opacity 0.4s ease-in' }}
                    >
                      <polyline 
                        points={points} 
                        fill="none" 
                        stroke={wire.color} 
                        strokeWidth="8" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                      />
                      <polygon 
                        points={arrowPoly} 
                        fill={wire.color} 
                      />
                    </g>
                  );
                })}
              </svg>
            ) : (
              <React.Fragment>
            {/* Static Arrows */}
            {grid.map((row, r) => row.map((arrow, c) => {"""

code = code.replace(grid_orig, grid_new)

# Close the fragment
code = code.replace("            {/* Flying Arrows */}", "            </React.Fragment>\n            )}\n\n            {/* Flying Arrows */}")

# Remove flying arrows for wire mode (they fly via CSS on the SVG group)
code = code.replace("{/* Flying Arrows */}", "{/* Flying Arrows */}\n            {mode !== 'wire' && ")
code = code.replace("            })}","            })}\n            }")

with open('/home/nihongo/Bureau/CASCADE/retrovision/src/games/ArrowPuzzle.jsx', 'w') as f:
    f.write(code)

