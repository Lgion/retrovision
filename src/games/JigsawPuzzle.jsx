import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';

export default function JigsawPuzzle({ onBack, onScoreSave }) {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const [gridSize, setGridSize] = useState(() => getGameConfig('jigsaw', 'difficulty', 3)); // 3x3, 4x4
  const [selectedImage, setSelectedImage] = useState(null);
  
  const [pieces, setPieces] = useState([]);
  const [placedPieces, setPlacedPieces] = useState({}); // { "row-col": pieceId }
  const [selectedPieceId, setSelectedPieceId] = useState(null);
  const [moves, setMoves] = useState(0);
  const [victoryPhase, setVictoryPhase] = useState(0);

  const images = [
    { id: 'sunset', url: '/puzzles/sunset.png', name: 'Coucher de Soleil' },
    { id: 'forest', url: '/puzzles/forest.png', name: 'Forêt Magique' },
    { id: 'cat', url: '/puzzles/cat.png', name: 'Chat Zen' },
  ];

  // Protection against leaving during game
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState === 'playing' && victoryPhase === 0 && moves > 0) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter la partie en cours ?";
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, victoryPhase, moves]);

  const handleBackWithConfirm = () => {
    if (gameState === 'playing' && victoryPhase === 0 && moves > 0) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  const startGame = (img, size) => {
    sound.playClick();
    setSelectedImage(img);
    setGridSize(size);
    
    // Generate pieces
    const newPieces = [];
    let idCounter = 0;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        newPieces.push({
          id: `p_${idCounter++}`,
          correctRow: r,
          correctCol: c,
        });
      }
    }
    
    // Shuffle pieces for the pool
    const shuffled = [...newPieces].sort(() => Math.random() - 0.5);
    
    setPieces(shuffled);
    setPlacedPieces({});
    setSelectedPieceId(null);
    setMoves(0);
    setVictoryPhase(0);
    setGameState('playing');
    
    // Start ambient background music
    sound.startBGM();
  };

  const handlePieceSelect = (pieceId) => {
    if (victoryPhase !== 0) return;
    sound.playClick();
    setSelectedPieceId(pieceId);
  };

  const handleGridSlotClick = (row, col) => {
    if (victoryPhase !== 0 || !selectedPieceId) return;
    
    // Prevent placing on already filled slot
    if (placedPieces[`${row}-${col}`]) {
      sound.playShake();
      return;
    }

    const piece = pieces.find(p => p.id === selectedPieceId);
    setMoves(m => m + 1);

    // Auto-reject for zero frustration (accessibility constraint)
    // The piece ONLY locks if it's the exact correct spot.
    if (piece.correctRow === row && piece.correctCol === col) {
      // Correct!
      setPlacedPieces(prev => {
        const next = { ...prev, [`${row}-${col}`]: piece.id };
        checkWin(next);
        return next;
      });
      setSelectedPieceId(null);
      sound.playProgressChime(Object.keys(placedPieces).length / (gridSize * gridSize));
    } else {
      // Wrong!
      sound.playShake();
      setSelectedPieceId(null); // Deselect to force player to try again
    }
  };

  const checkWin = (currentPlaced) => {
    const totalPieces = gridSize * gridSize;
    if (Object.keys(currentPlaced).length === totalPieces) {
      if (victoryPhase === 0) {
        setVictoryPhase(-1);
        sound.playPowerup();

        setTimeout(() => {
          setVictoryPhase(1);
          sound.stopBGM();

          setTimeout(() => {
            setVictoryPhase(2);
            sound.playExplosion();
          }, 2000);

          setTimeout(() => {
            setVictoryPhase(3);
            sound.playScore();
            if (onScoreSave) {
              const score = Math.max(1000 - moves * 5, 100);
              onScoreSave('Puzzle Magique', score);
            }
          }, 4500);
        }, 1500);
      }
    }
  };

  // Rendering Constants
  const BOARD_SIZE = 300; // Fixed size in px for simplicity
  const pieceSize = BOARD_SIZE / gridSize;

  return (
    <>
      {showIntro && <GameIntro 
        gameName="JIGSAW PUZZLE" 
        icon="🧩" 
        colors={['#00F0FF', '#39FF14', '#FFD700']} 
        particleType="puzzle" 
        onComplete={() => setShowIntro(false)} 
      />}
      <div style={containerStyle}>
      <GameHeader
        title="PUZZLE MAGIQUE"
        onBack={handleBackWithConfirm}
        onRestart={gameState === 'playing' ? () => setGameState('menu') : undefined}
        showBgmToggle={false} // bgm global
        centerContent={
          gameState === 'playing' ? (
            <div style={statusRowStyle}>
              <span style={{color: '#8e8a9f'}}>Coups: </span>
              <span style={{color: '#fff', fontWeight: 'bold'}}>{moves}</span>
            </div>
          ) : null
        }
      />

      {gameState === 'menu' && (
        <div style={menuStyle}>
          <h2 style={menuTitleStyle}>Choisissez une image</h2>
          <div style={imageGridStyle}>
            {images.map(img => (
              <div key={img.id} style={imageCardStyle} onClick={() => startGame(img, gridSize)}>
                <img src={img.url} alt={img.name} style={thumbnailStyle} />
                <div style={imageNameStyle}>{img.name}</div>
              </div>
            ))}
          </div>

          <h2 style={menuTitleStyle}>Difficulté</h2>
          <div style={difficultyRowStyle}>
            <button 
              className="retro-btn" 
              style={{...diffBtnStyle, borderColor: gridSize === 3 ? '#00F0FF' : '#cbd5e1', color: gridSize === 3 ? '#00F0FF' : '#475569'}}
              onClick={() => { setGridSize(3); updateGameConfig('jigsaw', 'difficulty', 3); sound.playClick(); }}
            >
              Facile (9 pièces)
            </button>
            <button 
              className="retro-btn" 
              style={{...diffBtnStyle, borderColor: gridSize === 4 ? '#39FF14' : '#cbd5e1', color: gridSize === 4 ? '#39FF14' : '#475569'}}
              onClick={() => { setGridSize(4); updateGameConfig('jigsaw', 'difficulty', 4); sound.playClick(); }}
            >
              Moyen (16 pièces)
            </button>
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div style={gameplayContainerStyle}>
          


          {/* Target Board */}
          <div style={{...boardWrapperStyle, width: BOARD_SIZE, height: BOARD_SIZE}}>
            {/* Background hint (faint) */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: `url(${selectedImage.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.15,
              zIndex: 0,
              borderRadius: '8px'
            }} />
            
            {/* Grid lines */}
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
              zIndex: 1,
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              {Array.from({ length: gridSize * gridSize }).map((_, i) => {
                const r = Math.floor(i / gridSize);
                const c = i % gridSize;
                const placedPieceId = placedPieces[`${r}-${c}`];
                const piece = placedPieceId ? pieces.find(p => p.id === placedPieceId) : null;

                return (
                  <div 
                    key={i} 
                    onClick={() => handleGridSlotClick(r, c)}
                    style={{
                      borderRight: c < gridSize - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none',
                      borderBottom: r < gridSize - 1 ? '1px dashed rgba(255,255,255,0.1)' : 'none',
                      backgroundColor: selectedPieceId && !placedPieceId ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                      cursor: selectedPieceId ? 'pointer' : 'default',
                      position: 'relative'
                    }}
                  >
                    {/* Placed Piece inside the slot */}
                    {piece && (
                      <div style={{
                        width: '100%', height: '100%',
                        backgroundImage: `url(${selectedImage.url})`,
                        backgroundSize: `${BOARD_SIZE}px ${BOARD_SIZE}px`,
                        backgroundPosition: `-${piece.correctCol * pieceSize}px -${piece.correctRow * pieceSize}px`,
                        boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2)',
                        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Piece Pool */}
          <div style={poolContainerStyle}>
            <div style={poolTitleStyle}>PIÈCES DISPONIBLES (Tap pour sélectionner)</div>
            <div style={poolGridStyle}>
              {pieces.filter(p => !Object.values(placedPieces).includes(p.id)).map(piece => {
                const isSelected = selectedPieceId === piece.id;
                return (
                  <div 
                    key={piece.id}
                    onClick={() => handlePieceSelect(piece.id)}
                    style={{
                      width: '60px', 
                      height: '60px',
                      backgroundImage: `url(${selectedImage.url})`,
                      backgroundSize: `${60 * gridSize}px ${60 * gridSize}px`, // Scale the background size to match the thumbnail dimension
                      backgroundPosition: `-${piece.correctCol * 60}px -${piece.correctRow * 60}px`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 0 0 4px #00F0FF, 0 10px 20px rgba(0,240,255,0.4)' : '0 4px 6px rgba(0,0,0,0.3)',
                      transform: isSelected ? 'scale(1.1) translateY(-4px)' : 'scale(1)',
                      transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      border: '1px solid rgba(255,255,255,0.4)'
                    }}
                  />
                )
              })}
              {pieces.filter(p => !Object.values(placedPieces).includes(p.id)).length === 0 && (
                <div style={{color: '#39FF14', fontStyle: 'italic', width: '100%', textAlign: 'center', marginTop: '20px'}}>
                  Aucune pièce restante !
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Victory Overlays */}
      {victoryPhase > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: victoryPhase === 3 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          zIndex: 100, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
          animation: 'fadeIn 0.5s', overflow: 'hidden'
        }}>
          {/* Confetti Particles */}
          {victoryPhase >= 2 && (
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              {Array.from({ length: 40 }, (_, i) => {
                const confettiColors = ['#FFD700', '#FF3366', '#33CCFF', '#39FF14', '#FF00FF', '#FF8800', '#00FFCC'];
                const color = confettiColors[i % confettiColors.length];
                const left = Math.random() * 100;
                const delay = Math.random() * 3;
                const duration = 2 + Math.random() * 3;
                const size = 6 + Math.random() * 8;
                const rotation = Math.random() * 360;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute', left: `${left}%`, top: '-20px',
                      width: `${size}px`, height: `${size * 0.6}px`,
                      background: color, borderRadius: i % 3 === 0 ? '50%' : '2px',
                      animation: `confettiFall ${duration}s linear ${delay}s infinite`,
                      transform: `rotate(${rotation}deg)`, opacity: 0.8
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Stage 1: Initial WOW */}
          {victoryPhase === 1 && (
            <div style={{ animation: 'popIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
              <h2 style={{ fontSize: '4rem', color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.8), 2px 2px 0px white', margin: 0, transform: 'rotate(-5deg)' }}>MAGNIFIQUE !</h2>
            </div>
          )}

          {/* Stage 2: Stats */}
          {victoryPhase === 2 && (
            <div style={{
              animation: 'slideUpFade 0.6s ease-out',
              background: 'rgba(255,255,255,0.9)', padding: '40px',
              borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              textAlign: 'center', zIndex: 10
            }}>
              <h3 style={{ fontSize: '2.5rem', color: '#33CCFF', margin: '0 0 20px 0' }}>Analyse de la création...</h3>
              <div style={{ fontSize: '1.8rem', color: '#666', margin: '10px 0' }}>
                Coups : <strong style={{ color: '#FF3366' }}>{moves}</strong>
              </div>
            </div>
          )}

          {/* Stage 3: Final Master Screen */}
          {victoryPhase === 3 && (
            <div style={{
              animation: 'popIn 0.5s', textAlign: 'center',
              background: 'white', padding: '50px',
              borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
              border: '4px solid #39FF14', zIndex: 10
            }}>
              <div style={{ fontSize: '5rem', marginBottom: '10px' }}>🖼️</div>
              <h2 style={{ fontSize: '3rem', color: '#333', margin: '0 0 20px 0' }}>Œuvre Complétée !</h2>
              <div style={{ fontSize: '1.5rem', color: '#666', marginBottom: '30px' }}>
                Score: <strong style={{ color: '#00F0FF', fontSize: '2rem' }}>{Math.max(1000 - moves * 5, 100)}</strong>
              </div>
              <button
                onClick={() => { setVictoryPhase(0); setGameState('menu'); }}
                className="retro-btn pulse-glow"
                style={{ fontSize: '1.5rem', padding: '15px 40px', borderRadius: '50px', borderColor: '#39FF14', color: '#39FF14', background: 'transparent' }}
              >
                Continuer
              </button>
            </div>
          )}
        </div>
      )}

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes popIn {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes slideUpFade {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.3; }
        }
      `}} />
      </div>
    </>
  );
}

// Inline Styles
const containerStyle = {
  display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '600px',
  background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)',
  borderRadius: '16px', padding: '20px', boxSizing: 'border-box',
  margin: '0 auto', flex: 1, position: 'relative'
};

const headerStyle = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px'
};

const backBtnStyle = { padding: '8px 16px', fontSize: '14px' };

const titleStyle = {
  fontFamily: 'Orbitron, sans-serif', fontSize: '22px', color: '#00F0FF',
  textShadow: '0 0 10px rgba(0,240,255,0.5)', letterSpacing: '1px', fontWeight: 'bold'
};

const menuStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1
};

const menuTitleStyle = {
  color: '#fff', fontSize: '18px', marginBottom: '15px', marginTop: '20px'
};

const imageGridStyle = {
  display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center'
};

const imageCardStyle = {
  background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '10px',
  cursor: 'pointer', border: '2px solid transparent', transition: 'all 0.2s',
  display: 'flex', flexDirection: 'column', alignItems: 'center', width: '140px'
};

const thumbnailStyle = {
  width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover',
  marginBottom: '10px'
};

const imageNameStyle = {
  color: '#cbd5e1', fontSize: '14px', fontWeight: '600', textAlign: 'center'
};

const difficultyRowStyle = {
  display: 'flex', gap: '15px', marginBottom: '30px'
};

const diffBtnStyle = {
  padding: '10px 20px', background: 'transparent'
};

const gameplayContainerStyle = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1
};

const statusRowStyle = {
  width: '100%', display: 'flex', justifyContent: 'space-between', 
  marginBottom: '15px', fontSize: '16px', padding: '0 10px', boxSizing: 'border-box'
};

const boardWrapperStyle = {
  position: 'relative', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
  backgroundColor: '#0f172a'
};

const poolContainerStyle = {
  marginTop: '30px', width: '100%', background: 'rgba(255,255,255,0.03)',
  borderRadius: '12px', padding: '15px', boxSizing: 'border-box',
  border: '1px solid rgba(255,255,255,0.05)'
};

const poolTitleStyle = {
  color: '#8e8a9f', fontSize: '12px', marginBottom: '10px', textAlign: 'center',
  textTransform: 'uppercase', letterSpacing: '1px'
};

const poolGridStyle = {
  display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center',
  minHeight: '80px', maxHeight: '160px', overflowY: 'auto', padding: '5px'
};
