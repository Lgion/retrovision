import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import hangmanData from '../utils/hangmanData.json';

export default function Hangman({ onBack, onScoreSave }) {
  const [showIntro, setShowIntro] = useState(true);
  
  // Random order logic
  const [riddleOrder, setRiddleOrder] = useState(() => {
    const savedOrder = localStorage.getItem('retrovision_hangman_order');
    if (savedOrder) {
      try {
        return JSON.parse(savedOrder);
      } catch(e) {}
    }
    const order = Array.from({ length: hangmanData.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    localStorage.setItem('retrovision_hangman_order', JSON.stringify(order));
    return order;
  });

  const [currentOrderIdx, setCurrentOrderIdx] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_hangman_idx') || '0', 10);
  });

  const [coins, setCoins] = useState(() => getGameConfig('hangman', 'coins', 100)); // Stars/coins
  const [lives, setLives] = useState(7);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost'
  
  // Powerups logic
  const [magnifyUsed, setMagnifyUsed] = useState(false);
  const [bombUsed, setBombUsed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  // Current Level Data
  const currentRiddleIdx = riddleOrder[currentOrderIdx % riddleOrder.length];
  const currentData = hangmanData[currentRiddleIdx];
  const targetWord = currentData.answer.toUpperCase();

  const handleBeforeUnload = (e) => {
    if (gameState === 'playing' && guessedLetters.length > 0) {
      e.preventDefault();
      e.returnValue = "Voulez-vous vraiment quitter ?";
      return e.returnValue;
    }
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [gameState, guessedLetters]);

  const handleBackWithConfirm = () => {
    if (gameState === 'playing' && guessedLetters.length > 0) {
      if (window.confirm("Voulez-vous vraiment quitter la partie en cours ?")) {
        sound.stopBGM();
        onBack();
      }
    } else {
      sound.stopBGM();
      onBack();
    }
  };

  // Keyboard
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');

  const guessLetter = (letter) => {
    if (gameState !== 'playing' || guessedLetters.includes(letter)) return;
    
    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    if (targetWord.includes(letter)) {
      sound.playBallDrop(); // Correct guess sound
      checkWin(newGuessed);
    } else {
      sound.playShake(); // Wrong guess sound
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        handleLoss();
      }
    }
  };

  const checkWin = (currentGuessed) => {
    const isWon = targetWord.split('').every(char => char === ' ' || currentGuessed.includes(char));
    if (isWon) {
      handleWin();
    }
  };

  const handleWin = () => {
    sound.playPowerup();
    setGameState('won');
    setCoins(c => {
      const nc = c + 15;
      updateGameConfig('hangman', 'coins', nc);
      return nc;
    });
    if (onScoreSave) onScoreSave('Le Pendu', 100 + (lives * 10));
  };

  const handleLoss = () => {
    sound.playExplosion();
    setGameState('lost');
  };

  const nextLevel = () => {
    const nextIdx = currentOrderIdx + 1;
    setCurrentOrderIdx(nextIdx);
    localStorage.setItem('retrovision_hangman_idx', nextIdx.toString());
    resetLevel();
  };

  const resetLevel = () => {
    setLives(7);
    setGuessedLetters([]);
    setGameState('playing');
    setMagnifyUsed(false);
    setBombUsed(false);
    setHintUsed(false);
    sound.playClick();
  };

  // Powerups Functions
  const useMagnify = () => {
    // Reveal one correct letter that hasn't been guessed
    if (gameState !== 'playing' || magnifyUsed || coins < 30) return;
    const unrevealed = targetWord.split('').filter(c => c !== ' ' && !guessedLetters.includes(c));
    if (unrevealed.length > 0) {
      const letterToReveal = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      setCoins(c => c - 30);
      setMagnifyUsed(true);
      sound.playPowerup();
      guessLetter(letterToReveal);
    }
  };

  const useBomb = () => {
    // Eliminate 3 wrong letters
    if (gameState !== 'playing' || bombUsed || coins < 20) return;
    const wrongLetters = alphabet.filter(c => !targetWord.includes(c) && !guessedLetters.includes(c));
    const toEliminate = wrongLetters.sort(() => 0.5 - Math.random()).slice(0, 3);
    if (toEliminate.length > 0) {
      setCoins(c => c - 20);
      setBombUsed(true);
      setGuessedLetters(prev => [...prev, ...toEliminate]);
      sound.playExplosion();
    }
  };

  const useHint = () => {
    // Reveal a hint (for now just reveal a letter, or give an extra life)
    if (gameState !== 'playing' || hintUsed || coins < 10) return;
    setLives(l => Math.min(7, l + 2)); // Give 2 extra lives as a "hint/help"
    setCoins(c => c - 10);
    setHintUsed(true);
    sound.playPowerup();
  };

  // Render Word
  const renderWord = () => {
    return targetWord.split('').map((char, index) => {
      if (char === ' ') return <span key={index} style={{ width: '20px' }}></span>;
      const isRevealed = guessedLetters.includes(char) || gameState === 'lost';
      const isMissed = gameState === 'lost' && !guessedLetters.includes(char);
      return (
        <div key={index} style={{
          ...letterSlotStyle,
          color: isMissed ? '#ef4444' : '#1e293b'
        }}>
          {isRevealed ? char : ''}
        </div>
      );
    });
  };

  // Render SVG Drawing (Stickman + Balloons + Shark)
  const renderDrawing = () => {
    // Balloons logic
    const balloonPositions = [
      {cx: 60, cy: 30, r: 12, color: '#ef4444'},
      {cx: 40, cy: 35, r: 10, color: '#3b82f6'},
      {cx: 80, cy: 35, r: 11, color: '#f59e0b'},
      {cx: 50, cy: 20, r: 13, color: '#10b981'},
      {cx: 70, cy: 22, r: 10, color: '#8b5cf6'},
      {cx: 35, cy: 50, r: 11, color: '#ec4899'},
      {cx: 85, cy: 50, r: 12, color: '#06b6d4'}
    ];
    
    return (
      <svg width="120" height="150" viewBox="0 0 120 150" style={drawingStyle}>
        {/* Shark & Water */}
        <path d="M 10 130 Q 30 125 50 130 T 90 130 T 130 130" stroke="#1e3a8a" strokeWidth="2" fill="none" />
        <path d="M 10 140 Q 30 135 50 140 T 90 140 T 130 140" stroke="#1e3a8a" strokeWidth="2" fill="none" />
        {/* Shark Fin */}
        <path d="M 50 130 Q 60 110 70 130 Z" fill="#475569" stroke="#334155" strokeWidth="2" />

        {/* Stickman */}
        <g style={{
          transform: lives === 0 ? 'translateY(50px)' : 'translateY(0px)',
          transition: 'transform 0.5s cubic-bezier(0.5, 0, 1, 1)'
        }}>
          {/* Head */}
          <circle cx="60" cy="80" r="10" stroke="#1e293b" strokeWidth="2" fill={lives === 0 ? '#ef4444' : 'none'} />
          {/* Body */}
          <line x1="60" y1="90" x2="60" y2="115" stroke="#1e293b" strokeWidth="2" />
          {/* Arms */}
          <line x1="60" y1="95" x2="45" y2="75" stroke="#1e293b" strokeWidth="2" />
          <line x1="60" y1="95" x2="75" y2="75" stroke="#1e293b" strokeWidth="2" />
          {/* Legs */}
          <line x1="60" y1="115" x2="50" y2="135" stroke="#1e293b" strokeWidth="2" />
          <line x1="60" y1="115" x2="70" y2="135" stroke="#1e293b" strokeWidth="2" />
        </g>

        {/* Strings & Balloons (Only show remaining lives) */}
        {balloonPositions.map((b, i) => {
          if (i >= lives) return null; // Balloon popped
          return (
            <g key={i}>
              <path d={`M ${b.cx} ${b.cy + b.r} Q ${(b.cx + 60)/2} 55 60 75`} stroke="#94a3b8" strokeWidth="1" fill="none" />
              <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.color} stroke="#1e293b" strokeWidth="1" />
              <path d={`M ${b.cx-2} ${b.cy+b.r} L ${b.cx+2} ${b.cy+b.r} L ${b.cx} ${b.cy+b.r+3} Z`} fill={b.color} />
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <>
      {showIntro && <GameIntro 
        gameName="LE PENDU" 
        icon="🎈" 
        colors={['#ef4444', '#3b82f6', '#10b981']} 
        particleType="bubbles" 
        onComplete={() => setShowIntro(false)} 
      />}
      
      <div style={containerStyle}>
        
        {/* Top Header */}
        <GameHeader
          title="DEVINETTE"
          onBack={handleBackWithConfirm}
          showBgmToggle={false} // bgm global
          centerContent={
            <div style={statsBoxStyle}>
              <span style={{ fontSize: '18px' }}>😈</span>
              <div style={coinsBadgeStyle}>
                <span style={{ color: '#f59e0b', fontSize: '16px' }}>★</span> 
                <span style={{ fontWeight: 'bold' }}>{coins}</span>
                <button style={addCoinBtnStyle}>+</button>
              </div>
            </div>
          }
          style={{ background: 'transparent', boxShadow: 'none', borderBottom: '2px dashed #cbd5e1' }}
        />

        {/* Drawing & Riddle Section */}
        <div style={topSectionStyle}>
          <div style={drawingContainerStyle}>
            {renderDrawing()}
            <div style={livesBadgeStyle}>
              ❤️ x{lives}
            </div>
          </div>
          <div style={riddleBoxStyle}>
            <div style={riddleTypeBadge}>{currentData.type.toUpperCase()}</div>
            {currentData.question.split('\\n').map((line, i) => (
              <p key={i} style={{ margin: '5px 0' }}>{line}</p>
            ))}
          </div>
        </div>

        {/* Word Display Section */}
        <div style={wordContainerStyle}>
          {renderWord()}
        </div>

        {/* Keyboard Section */}
        <div style={keyboardContainerStyle}>
          {alphabet.map((letter) => {
            const isGuessed = guessedLetters.includes(letter);
            const isCorrect = isGuessed && targetWord.includes(letter);
            const isWrong = isGuessed && !targetWord.includes(letter);

            let bg = 'transparent';
            let color = '#1e293b';
            let opacity = 1;

            if (isCorrect) {
              bg = '#10b981'; color = '#fff';
            } else if (isWrong) {
              opacity = 0.3;
            }

            return (
              <button
                key={letter}
                onClick={() => guessLetter(letter)}
                disabled={isGuessed || gameState !== 'playing'}
                style={{
                  ...keyBtnStyle,
                  background: bg,
                  color: color,
                  opacity: opacity,
                  pointerEvents: isGuessed || gameState !== 'playing' ? 'none' : 'auto'
                }}
              >
                {letter}
              </button>
            );
          })}
        </div>

        {/* Jokers Section */}
        <div style={jokersContainerStyle}>
          <button 
            onClick={useMagnify}
            disabled={magnifyUsed || coins < 30 || gameState !== 'playing'}
            style={{ ...jokerBtnStyle, opacity: (magnifyUsed || coins < 30) ? 0.5 : 1 }}
          >
            <div style={{ ...jokerIconBoxStyle, background: '#10b981' }}>🔍</div>
            <div style={jokerCostStyle}>★30</div>
          </button>
          
          <button 
            onClick={useBomb}
            disabled={bombUsed || coins < 20 || gameState !== 'playing'}
            style={{ ...jokerBtnStyle, opacity: (bombUsed || coins < 20) ? 0.5 : 1 }}
          >
            <div style={{ ...jokerIconBoxStyle, background: '#3b82f6' }}>💣</div>
            <div style={jokerCostStyle}>★20</div>
          </button>
          
          <button 
            onClick={useHint}
            disabled={hintUsed || coins < 10 || gameState !== 'playing'}
            style={{ ...jokerBtnStyle, opacity: (hintUsed || coins < 10) ? 0.5 : 1 }}
          >
            <div style={{ ...jokerIconBoxStyle, background: '#f59e0b' }}>💡</div>
            <div style={jokerCostStyle}>★10</div>
          </button>
        </div>

        {/* Overlays */}
        {gameState === 'won' && (
          <div style={{...overlayStyle, animation: 'delayFadeIn 1.5s forwards'}}>
            <div style={victoryTitleStyle}>Gagné !</div>
            <div style={{ color: '#1e293b', fontSize: '18px', marginBottom: '20px' }}>
              Le mot était bien <strong>{targetWord}</strong>
            </div>
            <button onClick={nextLevel} className="retro-btn" style={nextLevelBtnStyle}>
              Devinette Suivante
            </button>
          </div>
        )}

        {gameState === 'lost' && (
          <div style={overlayStyle}>
            <div style={{ ...victoryTitleStyle, color: '#ef4444' }}>Plouf !</div>
            <div style={{ color: '#1e293b', fontSize: '18px', marginBottom: '20px' }}>
              Le mot était <strong>{targetWord}</strong>
            </div>
            <button onClick={resetLevel} className="retro-btn" style={{ ...nextLevelBtnStyle, background: '#ef4444' }}>
              Réessayer
            </button>
          </div>
        )}

      </div>
    </>
  );
}

// Styles simulating the notebook paper theme
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: '430px',
  flex: 1,
  margin: '0 auto',
  background: '#fafafa',
  backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
  backgroundSize: '25px 25px',
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 20px',
  zIndex: 10
};

const backBtnStyle = {
  background: '#ffffff',
  border: '2px solid #1e293b',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '20px',
  color: '#1e293b',
  padding: 0,
  cursor: 'pointer'
};

const levelTextStyle = {
  fontSize: '22px',
  fontWeight: 'bold',
  color: '#1e293b',
  letterSpacing: '1px'
};

const statsBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px'
};

const coinsBadgeStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  background: '#ffffff',
  border: '2px solid #d1d5db',
  borderRadius: '20px',
  padding: '4px 10px',
  color: '#1e293b'
};

const addCoinBtnStyle = {
  background: '#f59e0b',
  border: 'none',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: 'white',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginLeft: '5px'
};

const topSectionStyle = {
  display: 'flex',
  padding: '10px 20px',
  gap: '10px',
  alignItems: 'flex-start'
};

const drawingContainerStyle = {
  flex: '0 0 120px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center'
};

const drawingStyle = {
  background: 'transparent'
};

const livesBadgeStyle = {
  background: '#ef4444',
  color: '#ffffff',
  padding: '2px 8px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: 'bold',
  marginTop: '5px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

const riddleBoxStyle = {
  flex: 1,
  fontSize: '18px',
  fontWeight: '600',
  color: '#1e293b',
  textAlign: 'center',
  lineHeight: '1.4',
  padding: '10px',
  background: 'rgba(255,255,255,0.7)',
  borderRadius: '12px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  border: '1px dashed #cbd5e1',
  position: 'relative'
};

const riddleTypeBadge = {
  position: 'absolute',
  top: '-10px',
  right: '10px',
  background: '#8b5cf6',
  color: '#ffffff',
  fontSize: '10px',
  padding: '2px 6px',
  borderRadius: '4px',
  fontWeight: 'bold'
};

const wordContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  padding: '30px 20px',
  flexWrap: 'wrap'
};

const letterSlotStyle = {
  width: '24px',
  height: '34px',
  borderBottom: '3px solid #10b981',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  fontSize: '24px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  paddingBottom: '2px'
};

const keyboardContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '10px',
  padding: '0 20px',
  marginTop: '20px'
};

const keyBtnStyle = {
  width: '38px',
  height: '42px',
  border: 'none',
  fontSize: '22px',
  fontWeight: 'bold',
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
  cursor: 'pointer',
  transition: 'transform 0.1s',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '6px'
};

const jokersContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '25px',
  padding: '30px 20px',
  marginTop: 'auto'
};

const jokerBtnStyle = {
  background: 'transparent',
  border: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px',
  cursor: 'pointer',
  transition: 'transform 0.2s'
};

const jokerIconBoxStyle = {
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '24px',
  color: 'white',
  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  border: '2px solid #ffffff'
};

const jokerCostStyle = {
  background: '#f59e0b',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 'bold',
  padding: '2px 8px',
  borderRadius: '10px',
  border: '1px solid #ffffff'
};

const overlayStyle = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
  animation: 'fadeIn 0.3s ease-out'
};

const victoryTitleStyle = {
  fontSize: '48px',
  color: '#10b981',
  fontWeight: 'bold',
  marginBottom: '10px',
  textShadow: '2px 2px 0px #ffffff'
};

const nextLevelBtnStyle = {
  background: '#10b981',
  color: '#ffffff',
  fontSize: '20px',
  padding: '12px 30px',
  border: 'none',
  borderRadius: '25px',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
};
