import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import MinesweeperCollection from './MinesweeperCollection';

export default function Minesweeper({ onBack, onScoreSave, isIntermission, intermissionDifficulty, onIntermissionComplete }) {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const [boardSize, setBoardSize] = useState(() => getGameConfig('mines', 'boardSize', 9)); // 9 or 12
  const [numMines, setNumMines] = useState(() => getGameConfig('mines', 'numMines', 10)); // 10 or 20
  
  const [grid, setGrid] = useState([]);
  const [flagMode, setFlagMode] = useState(false);
  const [firstClick, setFirstClick] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [victoryPhase, setVictoryPhase] = useState(0);
  const [minesLeft, setMinesLeft] = useState(0);
  const [moves, setMoves] = useState(0);
  const [showCollection, setShowCollection] = useState(false);
  const [customizations, setCustomizations] = useState(() => getGameConfig('mines', 'customizations', { difficulty: 'moyen', theme: 'classic' }));

  const getDifficultySettings = (diffId) => {
    switch(diffId) {
      case 'facile': return { size: 9, mines: 10 };
      case 'moyen': return { size: 12, mines: 25 };
      case 'difficile': return { size: 16, mines: 40 };
      default: return { size: 12, mines: 25 };
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState === 'playing' && victoryPhase === 0 && !gameOver && moves > 0) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, victoryPhase, gameOver, moves]);

  useEffect(() => {
    if (isIntermission && gameState === 'menu') {
      const diff = intermissionDifficulty || 'facile';
      const settings = getDifficultySettings(diff);
      setTimeout(() => startGame(settings.size, settings.mines), 100);
    }
  }, [isIntermission, gameState]);

  const handleBackWithConfirm = () => {
    if (gameState === 'playing' && victoryPhase === 0 && !gameOver && moves > 0) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  const createEmptyGrid = (size) => {
    const newGrid = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        row.push({
          r, c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  };

  const startGame = (size, mines) => {
    sound.playClick();
    setBoardSize(size);
    setNumMines(mines);
    updateGameConfig('mines', 'boardSize', size);
    updateGameConfig('mines', 'numMines', mines);
    setMinesLeft(mines);
    setGrid(createEmptyGrid(size));
    setFirstClick(true);
    setGameOver(false);
    setVictoryPhase(0);
    setMoves(0);
    setFlagMode(false);
    setGameState('playing');
    sound.startBGM();
  };

  const placeMines = (grid, firstR, firstC, size, minesCount) => {
    let placed = 0;
    while (placed < minesCount) {
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      // Don't place mine on first click or adjacent to it, to guarantee a good start
      if (!grid[r][c].isMine && (Math.abs(r - firstR) > 1 || Math.abs(c - firstC) > 1)) {
        grid[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbors
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (r+i >= 0 && r+i < size && c+j >= 0 && c+j < size) {
                if (grid[r+i][c+j].isMine) count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }
    return grid;
  };

  const revealCell = (r, c) => {
    if (gameOver || victoryPhase !== 0) return;
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    sound.playClick();
    let newGrid = [...grid.map(row => [...row])];
    
    if (firstClick) {
      newGrid = placeMines(newGrid, r, c, boardSize, numMines);
      setFirstClick(false);
    }

    setMoves(m => m + 1);

    if (newGrid[r][c].isMine) {
      // Game Over
      newGrid[r][c].isRevealed = true;
      setGrid(newGrid);
      handleGameOver();
      return;
    }

    // BFS to reveal empty cells
    const queue = [[r, c]];
    while (queue.length > 0) {
      const [currR, currC] = queue.shift();
      const currCell = newGrid[currR][currC];
      
      if (!currCell.isRevealed && !currCell.isFlagged) {
        currCell.isRevealed = true;
        if (currCell.neighborMines === 0) {
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              if (currR+i >= 0 && currR+i < boardSize && currC+j >= 0 && currC+j < boardSize) {
                if (!newGrid[currR+i][currC+j].isRevealed) {
                  queue.push([currR+i, currC+j]);
                }
              }
            }
          }
        }
      }
    }

    setGrid(newGrid);
    checkWin(newGrid);
  };

  const toggleFlag = (r, c) => {
    if (gameOver || victoryPhase !== 0 || firstClick) return;
    const cell = grid[r][c];
    if (cell.isRevealed) return;

    sound.playBallDrop(); // Small tick sound
    const newGrid = [...grid.map(row => [...row])];
    newGrid[r][c].isFlagged = !newGrid[r][c].isFlagged;
    setGrid(newGrid);
    
    setMinesLeft(prev => newGrid[r][c].isFlagged ? prev - 1 : prev + 1);
    checkWin(newGrid); // Technically you win by revealing, but just in case
  };

  const handleCellClick = (r, c) => {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  const checkWin = (currentGrid) => {
    let revealedCount = 0;
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (currentGrid[r][c].isRevealed) revealedCount++;
      }
    }

    if (revealedCount === boardSize * boardSize - numMines) {
      // Flag all remaining mines automatically
      const finalGrid = [...currentGrid.map(row => [...row])];
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          if (finalGrid[r][c].isMine) finalGrid[r][c].isFlagged = true;
        }
      }
      setGrid(finalGrid);
      setMinesLeft(0);
      handleVictory();
    }
  };

  const handleGameOver = () => {
    sound.stopBGM();
    setGameOver(true);
    sound.playShake();
    
    setTimeout(() => {
      // Reveal all mines after a short delay
      const finalGrid = [...grid.map(row => [...row])];
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          if (finalGrid[r][c].isMine) finalGrid[r][c].isRevealed = true;
        }
      }
      setGrid(finalGrid);
    }, 500);
  };

  const handleVictory = () => {
    if (isIntermission && onIntermissionComplete) {
      setTimeout(() => onIntermissionComplete(), 1000);
      return;
    }
    setVictoryPhase(-1);
    setTimeout(() => {
      sound.stopBGM();
      setVictoryPhase(1);
      sound.playPowerup();

      setTimeout(() => {
        setVictoryPhase(2);
        sound.playExplosion();
      }, 1500);

      setTimeout(() => {
        setVictoryPhase(3);
        sound.playScore();
        if (onScoreSave) {
          onScoreSave('Démineur', Math.max(1000 - moves * 5, 100));
        }
      }, 3500);
    }, 1500);
  };

  const getNumberColor = (num) => {
    const colors = [
      'rgba(255, 255, 255, 0)', // 0 (hidden)
      '#60a5fa', // 1 (bright neon blue)
      '#34d399', // 2 (bright emerald green)
      '#f87171', // 3 (bright coral red)
      '#c084fc', // 4 (bright purple/violet)
      '#fbbf24', // 5 (bright amber yellow)
      '#22d3ee', // 6 (bright electric cyan)
      '#f472b6', // 7 (bright neon pink)
      '#e2e8f0'  // 8 (bright cool silver)
    ];
    return colors[num];
  };

  if (showCollection) {
    return (
      <MinesweeperCollection
        onClose={() => {
          setShowCollection(false);
          const settings = getDifficultySettings(customizations.difficulty);
          startGame(settings.size, settings.mines);
        }}
        currentSelections={customizations}
        onSelect={(category, id) => {
          setCustomizations(prev => {
            const next = { ...prev, [category]: id };
            updateGameConfig('mines', 'customizations', next);
            return next;
          });
          if (category === 'difficulty') {
            setShowCollection(false);
            const settings = getDifficultySettings(id);
            startGame(settings.size, settings.mines);
          }
        }}
      />
    );
  }

  const getThemeStyles = () => {
    switch (customizations.theme) {
      case 'dark': return { bg: '#0f172a', cellRevealed: '#020617', cellHidden: '#1e293b', border: '#334155 #020617 #020617 #334155' };
      case 'neon': return { bg: '#000000', cellRevealed: '#111111', cellHidden: '#222222', border: '#00f0ff #000000 #000000 #00f0ff' };
      default: return { bg: '#0f172a', cellRevealed: '#020617', cellHidden: '#334155', border: '#475569 #0f172a #0f172a #475569' };
    }
  };
  const theme = getThemeStyles();

  return (
    <>
      {showIntro && !isIntermission && <GameIntro 
        gameName="DÉMINEUR" 
        icon="💣" 
        colors={['#ef4444', '#f59e0b', '#39FF14']} 
        particleType="mines" 
        onComplete={() => setShowIntro(false)} 
      />}
      
      {isIntermission && gameState === 'playing' && (
        <div className="entract-header">
          <div className="entract-header-text">
            Entracte ! Gagnez pour retourner au Mahjong.
          </div>
          <button
            onClick={() => { if (onIntermissionComplete) onIntermissionComplete(); }}
            className="entract-header-btn"
          >
            Passer l'entracte ⏭
          </button>
        </div>
      )}
      
      <div style={{ ...containerStyle, background: theme.bg === '#000000' ? '#111' : 'rgba(15, 23, 42, 0.85)' }}>
      {!isIntermission && (
        <GameHeader
          title="DÉMINEUR"
          onBack={handleBackWithConfirm}
          onRestart={gameState === 'playing' ? () => { const s = getDifficultySettings(customizations.difficulty); startGame(s.size, s.mines); } : undefined}
          onShop={() => setShowCollection(true)}
          showBgmToggle={false} // BGM handled elsewhere
          centerContent={
            gameState === 'playing' ? (
              <div style={mineCounterStyle}>
                💣 {minesLeft}
              </div>
            ) : null
          }
          extraControls={
            gameState === 'playing' ? (
              <button 
                onClick={() => { sound.playClick(); setFlagMode(!flagMode); }}
                className={`retro-btn ${flagMode ? 'pulse-glow' : ''}`}
                style={{
                  padding: '8px 16px', fontSize: '14px', 
                  backgroundColor: flagMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: `1px solid ${flagMode ? '#ef4444' : 'rgba(255, 255, 255, 0.2)'}`,
                  color: flagMode ? '#ef4444' : '#ffffff',
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {flagMode ? '🚩 Mode Drapeau' : '⛏️ Mode Creuser'}
              </button>
            ) : null
          }
        />
      )}

      {gameState === 'menu' && (
        <div style={menuStyle}>
          <div style={{fontSize: '5rem', marginBottom: '20px', filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'}}>💣</div>
          <h2 style={{color: '#fff', marginBottom: '30px', textAlign: 'center'}}>Nettoyez le champ de mines !</h2>
          
          <button 
            onClick={() => startGame(9, 10)} 
            className="retro-btn pulse-glow"
            style={{padding: '15px 40px', fontSize: '20px', borderColor: '#39FF14', color: '#39FF14', marginBottom: '15px', width: '250px'}}
          >
            Facile (9x9)
          </button>
          <button 
            onClick={() => startGame(12, 20)} 
            className="retro-btn"
            style={{padding: '15px 40px', fontSize: '20px', borderColor: '#F59E0B', color: '#F59E0B', width: '250px'}}
          >
            Moyen (12x12)
          </button>
          
          <div style={{marginTop: '30px', color: '#cbd5e1', textAlign: 'center', fontSize: '14px', maxWidth: '300px'}}>
            <strong>Contrôles :</strong> Touchez une case pour creuser. Utilisez le bouton "Mode Drapeau" pour marquer les mines sans risque de les faire exploser.
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={gameplayContainerStyle}>
          


          <div style={{...boardWrapperStyle, padding: boardSize === 9 ? '15px' : '10px'}}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
              gap: '2px',
              backgroundColor: '#0f172a',
              border: '4px solid #1e293b',
              borderRadius: '8px',
              width: '100%',
              maxWidth: '400px' // cap width so cells don't get too huge
            }}>
              {grid.map((row, r) => row.map((cell, c) => (
                <div 
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`minesweeper-cell ${cell.isRevealed ? 'revealed' : ''}`}
                  style={{
                    aspectRatio: '1/1',
                    backgroundColor: cell.isRevealed ? theme.cellRevealed : theme.cellHidden,
                    borderStyle: 'solid',
                    borderWidth: cell.isRevealed ? '1px' : '3px',
                    borderColor: cell.isRevealed 
                      ? '#1e293b' 
                      : theme.border,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    fontSize: boardSize === 9 ? '20px' : '14px',
                    fontWeight: 'bold', cursor: 'pointer',
                    color: getNumberColor(cell.neighborMines),
                    userSelect: 'none'
                  }}
                >
                  {cell.isRevealed && cell.isMine ? '💣' : ''}
                  {cell.isRevealed && !cell.isMine && cell.neighborMines > 0 ? cell.neighborMines : ''}
                  {!cell.isRevealed && cell.isFlagged ? '🚩' : ''}
                  {gameOver && !cell.isRevealed && cell.isMine && !cell.isFlagged ? (
                    <span style={{opacity: 0.5}}>💣</span>
                  ) : null}
                  {gameOver && !cell.isMine && cell.isFlagged ? '❌' : ''}
                </div>
              )))}
            </div>
          </div>

        </div>
      )}

      {/* Game Over Screen */}
      {gameOver && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(5px)',
          zIndex: 100, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s'
        }}>
          <h2 style={{ fontSize: '3rem', color: '#ef4444', margin: '0 0 20px 0', animation: 'popIn 0.5s' }}>BOUM !</h2>
          <button
            onClick={() => { setGameOver(false); setGameState('menu'); }}
            className="retro-btn"
            style={{ fontSize: '1.2rem', padding: '10px 30px', borderColor: '#ef4444', color: '#ef4444' }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Victory Overlays */}
      {victoryPhase > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: victoryPhase === 3 ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', animation: 'fadeIn 0.5s'
        }}>
          {victoryPhase >= 2 && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {Array.from({ length: 40 }, (_, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${Math.random() * 100}%`, top: '-20px',
                  width: '12px', height: '12px', background: ['#39FF14', '#00F0FF', '#FFD700'][i%3],
                  borderRadius: '50%', animation: `confettiFall ${2 + Math.random()*3}s linear ${Math.random()*2}s infinite`,
                  opacity: 0.8
                }} />
              ))}
            </div>
          )}

          {victoryPhase === 1 && (
            <h2 style={{ fontSize: '4rem', color: '#39FF14', margin: 0, animation: 'popIn 0.8s' }}>SÉCURISÉ !</h2>
          )}

          {victoryPhase === 3 && (
            <div style={{
              animation: 'popIn 0.5s', textAlign: 'center', background: 'white', padding: '50px',
              borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '4px solid #39FF14', zIndex: 10
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '10px' }}>🛡️</div>
              <h2 style={{ fontSize: '2.5rem', color: '#333', margin: '0 0 20px 0' }}>Zone Pacifiée</h2>
              <div style={{ fontSize: '1.5rem', color: '#666', marginBottom: '30px' }}>
                Score: <strong style={{ color: '#39FF14', fontSize: '2rem' }}>{Math.max(1000 - moves * 5, 100)}</strong>
              </div>
              <button
                onClick={() => {
                  if (isIntermission && onIntermissionComplete) onIntermissionComplete();
                  else { setVictoryPhase(0); setGameState('menu'); }
                }}
                className="retro-btn pulse-glow"
                style={{ fontSize: '1.2rem', padding: '10px 30px', borderColor: '#39FF14', color: '#39FF14' }}
              >
                {isIntermission ? "Retour au Mahjong" : "Super !"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '500px',
  background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)',
  borderRadius: '16px', padding: '20px', boxSizing: 'border-box',
  margin: '0 auto', flex: 1, position: 'relative', overflowX: 'hidden'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px'
};

const backBtnStyle = { padding: '8px 12px', fontSize: '14px' };

const titleStyle = {
  fontFamily: 'Orbitron, sans-serif', fontSize: '22px', color: '#ef4444',
  textShadow: '0 0 10px rgba(239, 68, 68, 0.5)', letterSpacing: '2px', fontWeight: 'bold'
};

const menuStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 };

const gameplayContainerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, width: '100%' };

const statusRowStyle = {
  width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '20px', padding: '0 10px', boxSizing: 'border-box'
};

const mineCounterStyle = {
  fontSize: '22px', fontWeight: 'bold', color: '#ef4444', 
  background: 'rgba(0,0,0,0.3)', padding: '5px 15px', borderRadius: '8px', border: '2px solid rgba(239,68,68,0.3)'
};

const boardWrapperStyle = {
  width: '100%', display: 'flex', justifyContent: 'center',
  background: 'rgba(0,0,0,0.2)', borderRadius: '8px'
};
