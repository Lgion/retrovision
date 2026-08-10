import React, { useState, useEffect } from 'react';
import { sound } from '../utils/sound';
import { getGameConfig, updateGameConfig } from '../utils/config';
import GameIntro from '../components/GameIntro';
import GameHeader from '../components/GameHeader';
import HangmanCollection from './HangmanCollection';
import hangmanData from '../utils/hangmanData.json';

export default function Hangman({ onBack, onScoreSave, isIntermission, intermissionDifficulty, onIntermissionComplete, onIntermissionRequest }) {
  const [showIntro, setShowIntro] = useState(true);

  const [coins, setCoins] = useState(() => getGameConfig('hangman', 'coins', 100)); // Stars/coins
  const [customizations, setCustomizations] = useState(() => getGameConfig('hangman', 'customizations', { difficulty: 'moyen', theme: 'chalk', category: 'mixte' }));
  const [showCollection, setShowCollection] = useState(false);
  const [showHintMessage, setShowHintMessage] = useState(false);

  const getFilteredData = () => {
    let cat = customizations.category || 'mixte';
    if (cat === 'mixte') return hangmanData;
    const filtered = hangmanData.filter(d => d.category === cat);
    return filtered.length > 0 ? filtered : hangmanData;
  };

  const filteredData = getFilteredData();

  // Random order logic
  const [riddleOrder, setRiddleOrder] = useState(() => {
    const order = Array.from({ length: filteredData.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  });

  useEffect(() => {
    // When category changes, reset order and index
    const order = Array.from({ length: filteredData.length }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setRiddleOrder(order);
    setCurrentOrderIdx(0);
    resetLevel();
  }, [customizations.category]);

  const [currentOrderIdx, setCurrentOrderIdx] = useState(() => {
    return parseInt(localStorage.getItem('retrovision_hangman_idx') || '0', 10);
  });

  const getInitialLives = () => {
    let diff = customizations.difficulty || 'moyen';
    if (isIntermission) {
      diff = intermissionDifficulty || 'facile';
    }
    if (diff === 'facile') return 8;
    if (diff === 'moyen') return 6;
    if (diff === 'difficile') return 4;
    return 6;
  };

  const initialLivesAmount = getInitialLives();
  const [lives, setLives] = useState(initialLivesAmount);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'won', 'lost', 'solution'

  // Visual FX states
  const [isShaking, setIsShaking] = useState(false);
  // Powerups logic
  const [magnifyUsed, setMagnifyUsed] = useState(false);
  const [bombUsed, setBombUsed] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [isCatSolutionShown, setIsCatSolutionShown] = useState(false);

  // Current Level Data
  const currentRiddleIdx = riddleOrder[currentOrderIdx % riddleOrder.length];
  const currentData = filteredData[currentRiddleIdx] || hangmanData[0];
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

  const [recentCorrectLetter, setRecentCorrectLetter] = useState(null);

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
      setRecentCorrectLetter(letter);
      setTimeout(() => setRecentCorrectLetter(null), 500); // Clear after animation
      checkWin(newGuessed);
    } else {
      sound.playShake(); // Wrong guess sound
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400); // Clear after shake duration

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
    if (isIntermission && onIntermissionComplete) {
      setTimeout(() => onIntermissionComplete(), 1500);
    }
    if (onScoreSave) onScoreSave('Le Pendu', 100 + (lives * 10));
  };

  const handleLoss = () => {
    sound.playExplosion();
    setGameState('lost');
  };

  const nextLevel = () => {
    if (onIntermissionRequest && localStorage.getItem('retrovision_intermission_enabled') !== 'false') {
      onIntermissionRequest();
    } else {
      forceNextQuestion();
    }
  };

  const forceNextQuestion = () => {
    const nextIdx = currentOrderIdx + 1;
    setCurrentOrderIdx(nextIdx);
    localStorage.setItem('retrovision_hangman_idx', nextIdx.toString());
    resetLevel();
  };

  const resetLevel = () => {
    const diff = isIntermission ? (intermissionDifficulty || 'facile') : (customizations.difficulty || 'moyen');
    setLives(getInitialLives());
    setGuessedLetters(diff === 'facile' ? ['A', 'E', 'I', 'O', 'U', 'Y'] : []);
    setGameState('playing');
    setMagnifyUsed(false);
    setBombUsed(false);
    setHintUsed(false);
    setIsCatSolutionShown(false);
    setShowHintMessage(false);
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
    // Reveal a textual hint
    if (gameState !== 'playing' || hintUsed || showHintMessage) return;
    setHintUsed(true);
    setShowHintMessage(true);
    sound.playPowerup();
  };

  const useLangueAuChat = () => {
    // Reveal solution letters indicatively in mauve without stopping the game
    if (gameState !== 'playing' || isCatSolutionShown) return;
    sound.playPowerup();
    setIsCatSolutionShown(true);
  };

  // Render Word
  const renderWord = () => {
    return targetWord.split('').map((char, index) => {
      if (char === ' ') return <span key={index} style={{ width: '20px' }}></span>;
      const isGuessed = guessedLetters.includes(char);
      const isRevealed = isGuessed || gameState === 'lost' || isCatSolutionShown;
      const isMissed = gameState === 'lost' && !isGuessed;
      const isCatSuggestion = isCatSolutionShown && !isGuessed && gameState === 'playing';
      const isJustGuessed = char === recentCorrectLetter;

      let color = theme.color;
      let borderColor = theme.color;
      let background = 'transparent';

      if (isCatSuggestion) {
        color = '#8b5cf6';
        borderColor = '#8b5cf6';
        background = 'rgba(139, 92, 246, 0.15)';
      } else if (isMissed) {
        color = '#ef4444';
      } else if (isJustGuessed) {
        borderColor = '#10b981';
      }

      return (
        <div className={`hangman_letter_slot ${isJustGuessed ? 'letter-pop' : ''}`} key={index} style={{
          ...letterSlotStyle,
          color,
          borderColor,
          background,
          fontWeight: isCatSuggestion ? '700' : '800'
        }}>
          {isRevealed ? char : ''}
        </div>
      );
    });
  };

  // Header Center Content
  const renderHeaderCenter = () => {
    if (gameState === 'solution') {
      return (
        <button
          onClick={forceNextQuestion}
          className="retro-btn"
          style={{
            background: '#8b5cf6',
            color: '#ffffff',
            fontSize: '15px',
            padding: '6px 14px',
            borderRadius: '20px',
            border: 'none',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(139, 92, 246, 0.4)',
            whiteSpace: 'nowrap'
          }}
        >
          Question Suivante ⏭
        </button>
      );
    }

    if (isIntermission) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 'bold', color: theme.color }}>Entracte !</span>
          {onIntermissionRequest && (
            <button
              onClick={() => onIntermissionRequest()}
              className="entract-header-btn"
              style={{ fontSize: '13px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)' }}
            >
              🎲 Autre
            </button>
          )}
          <button
            onClick={() => { if (onIntermissionComplete) onIntermissionComplete(false); }}
            className="entract-header-btn"
            style={{ fontSize: '13px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}
          >
            Passer ⏭
          </button>
        </div>
      );
    }

    return (
      <div style={statsBoxStyle}>
        <span style={{ fontSize: '20px' }}>😈</span>
        <div style={{ ...coinsBadgeStyle, background: theme.bg === '#fafafa' ? '#fff' : 'rgba(255,255,255,0.1)', color: theme.color }}>
          <span style={{ color: '#f59e0b', fontSize: '18px' }}>★</span>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{coins}</span>
        </div>
      </div>
    );
  };

  // Render SVG Drawing (Stickman + Balloons + Shark)
  const renderDrawing = () => {
    // Balloons logic
    const balloonPositions = [
      { cx: 60, cy: 30, r: 12, color: '#ef4444' },
      { cx: 40, cy: 35, r: 10, color: '#3b82f6' },
      { cx: 80, cy: 35, r: 11, color: '#f59e0b' },
      { cx: 50, cy: 20, r: 13, color: '#10b981' },
      { cx: 70, cy: 22, r: 10, color: '#8b5cf6' },
      { cx: 35, cy: 50, r: 11, color: '#ec4899' },
      { cx: 85, cy: 50, r: 12, color: '#06b6d4' }
    ];

    return (
      <svg width="150" height="180" viewBox="0 0 120 150" style={drawingStyle}>
        {/* Shark & Water */}
        <path d="M 10 130 Q 30 125 50 130 T 90 130 T 130 130" stroke={theme.color} strokeWidth="2" fill="none" opacity="0.6" />
        <path d="M 10 140 Q 30 135 50 140 T 90 140 T 130 140" stroke={theme.color} strokeWidth="2" fill="none" opacity="0.4" />
        {/* Shark Fin */}
        <path d="M 50 130 Q 60 110 70 130 Z" fill="#ef4444" stroke={theme.color} strokeWidth="2" />

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
              <path d={`M ${b.cx} ${b.cy + b.r} Q ${(b.cx + 60) / 2} 55 60 75`} stroke="#94a3b8" strokeWidth="1" fill="none" />
              <circle cx={b.cx} cy={b.cy} r={b.r} fill={b.color} stroke="#1e293b" strokeWidth="1" />
              <path d={`M ${b.cx - 2} ${b.cy + b.r} L ${b.cx + 2} ${b.cy + b.r} L ${b.cx} ${b.cy + b.r + 3} Z`} fill={b.color} />
            </g>
          );
        })}
      </svg>
    );
  };

  if (showCollection) {
    return (
      <HangmanCollection
        onClose={() => {
          setShowCollection(false);
          resetLevel();
        }}
        currentSelections={customizations}
        onSelect={(category, id) => {
          setCustomizations(prev => {
            const next = { ...prev, [category]: id };
            updateGameConfig('hangman', 'customizations', next);
            return next;
          });
          setShowCollection(false);
          resetLevel();
        }}
      />
    );
  }

  const getThemeStyles = () => {
    switch (customizations.theme) {
      case 'chalk':
        return {
          bg: '#2d3748',
          bgImage: 'none',
          color: '#f8fafc',
          riddleBg: 'rgba(255,255,255,0.1)',
          border: '1px solid #cbd5e1',
          keyBg: 'rgba(255,255,255,0.15)',
          keyColor: '#f8fafc'
        };
      case 'neon':
        return {
          bg: '#0f172a',
          bgImage: 'none',
          color: '#38bdf8',
          riddleBg: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid #38bdf8',
          keyBg: 'rgba(56, 189, 248, 0.15)',
          keyColor: '#38bdf8'
        };
      default:
        return {
          bg: '#fafafa',
          bgImage: 'linear-gradient(rgba(59, 130, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.2) 1px, transparent 1px)',
          color: '#1e293b',
          riddleBg: 'rgba(255,255,255,0.7)',
          border: '1px dashed #cbd5e1',
          keyBg: '#ffffff',
          keyColor: '#1e293b'
        };
    }
  };

  const theme = getThemeStyles();
  const currentDiff = isIntermission ? (intermissionDifficulty || 'facile') : (customizations.difficulty || 'moyen');
  const getDifficultyInfo = () => {
    if (currentDiff === 'facile') return { label: 'FACILE', icon: '🟢', color: '#10b981' };
    if (currentDiff === 'difficile') return { label: 'DIFFICILE', icon: '🔴', color: '#ef4444' };
    return { label: 'MOYEN', icon: '🟡', color: '#f59e0b' };
  };
  const diffInfo = getDifficultyInfo();

  return (
    <>
      <style>{`
        .shake-error {
          animation: shakeError 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shakeError {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
        .letter-pop {
          animation: popLetter 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
          text-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
        }
        @keyframes popLetter {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.5); color: #10b981; }
          100% { transform: scale(1); }
        }
        .error-tint {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(239, 68, 68, 0.2);
          pointer-events: none;
          z-index: 50;
          animation: flashRed 0.4s ease-out;
        }
        @keyframes flashRed {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

      {showIntro && !isIntermission && <GameIntro
        gameName="LE PENDU"
        icon="🎈"
        colors={['#ef4444', '#3b82f6', '#10b981']}
        particleType="bubbles"
        onComplete={() => setShowIntro(false)}
      />}

      <div style={{ ...containerStyle, background: theme.bg, backgroundImage: theme.bgImage, color: theme.color }} className={isShaking ? 'shake-error' : ''}>
        {isShaking && <div className="error-tint"></div>}

        {/* Top Header */}
        <GameHeader
          title={
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '1.2' }}>
              <span>DEVINETTE</span>
              <span style={{ fontSize: '11px', color: diffInfo.color, fontWeight: 'bold' }}>
                {diffInfo.icon} {diffInfo.label}
              </span>
            </div>
          }
          onBack={handleBackWithConfirm}
          showBgmToggle={false} // bgm global
          onShop={() => setShowCollection(true)}
          centerContent={renderHeaderCenter()}
          style={{ background: 'transparent', boxShadow: 'none', borderBottom: `2px dashed ${theme.border.split(' ')[2] || '#cbd5e1'}` }}
        />

        {/* Drawing & Riddle Section */}
        <div style={topSectionStyle}>
          <div style={drawingContainerStyle}>
            {renderDrawing()}
            <div style={livesBadgeStyle}>
              ❤️ x{lives}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '10px' }}>
            <div className="riddleBox" style={{ ...riddleBoxStyle, flex: 'none', background: theme.riddleBg, border: theme.border, color: theme.color }}>
              <div style={riddleTypeBadge}>{currentData.category ? currentData.category.toUpperCase() : 'MIXTE'}</div>
              {currentData.question.split('\\n').map((line, i) => (
                <p key={i} style={{ margin: '4px 0' }}>{line}</p>
              ))}
            </div>
            {showHintMessage && (
              <div className="hangman_tips" style={{ padding: '12px 16px', background: 'rgba(245, 158, 11, 0.15)', border: '2px solid #f59e0b', borderRadius: '12px', color: '#d97706', fontWeight: 'bold', fontSize: '20px', animation: 'fadeIn 0.3s' }}>
                💡 Indice : {currentData.hint}
              </div>
            )}
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
            const isCatSuggestedKey = isCatSolutionShown && !isGuessed && targetWord.includes(letter);

            let bg = theme.keyBg;
            let color = theme.keyColor;
            let border = 'none';
            let opacity = 1;
            let boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

            if (isCorrect) {
              bg = '#10b981'; color = '#fff';
            } else if (isWrong) {
              opacity = 0.3;
            } else if (isCatSuggestedKey) {
              border = '2px solid #8b5cf6';
              color = '#8b5cf6';
              bg = 'rgba(139, 92, 246, 0.15)';
              boxShadow = '0 0 10px rgba(139, 92, 246, 0.3)';
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
                  border: border,
                  boxShadow: boxShadow,
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
            style={{ ...jokerBtnStyle, opacity: (magnifyUsed || coins < 30 || gameState !== 'playing') ? 0.5 : 1 }}
            title="Dévoiler une lettre"
          >
            <div style={{ ...jokerIconBoxStyle, background: '#10b981' }}>🔍</div>
            <div style={jokerCostStyle}>★30</div>
          </button>

          <button
            onClick={useBomb}
            disabled={bombUsed || coins < 20 || gameState !== 'playing'}
            style={{ ...jokerBtnStyle, opacity: (bombUsed || coins < 20 || gameState !== 'playing') ? 0.5 : 1 }}
            title="Éliminer 3 fausses lettres"
          >
            <div style={{ ...jokerIconBoxStyle, background: '#3b82f6' }}>💣</div>
            <div style={jokerCostStyle}>★20</div>
          </button>

          <button
            onClick={useHint}
            disabled={hintUsed || gameState !== 'playing'}
            style={{ ...jokerBtnStyle, opacity: (hintUsed || gameState !== 'playing') ? 0.5 : 1 }}
            title="Afficher un indice"
          >
            <div style={{ ...jokerIconBoxStyle, background: '#f59e0b' }}>💡</div>
            <div style={{ ...jokerCostStyle, background: '#f59e0b' }}>Indice</div>
          </button>

          <button
            onClick={useLangueAuChat}
            disabled={isCatSolutionShown || gameState !== 'playing'}
            style={{ ...jokerBtnStyle, opacity: (isCatSolutionShown || gameState !== 'playing') ? 0.5 : 1 }}
            title="Donner sa langue au chat (solution indicative)"
          >
            <div style={{ ...jokerIconBoxStyle, background: '#8b5cf6' }}>🐱</div>
            <div style={{ ...jokerCostStyle, background: '#8b5cf6' }}>Langue au chat</div>
          </button>
        </div>

        {/* Overlays for Win/Loss only */}
        {gameState === 'won' && (
          <div style={{ ...overlayStyle, animation: 'delayFadeIn 1.5s forwards' }}>
            <div style={{ fontSize: '50px', marginBottom: '5px' }}>🎉</div>
            <div style={victoryTitleStyle}>Gagné !</div>
            <div style={{ color: '#1e293b', fontSize: '22px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
              Le mot était bien <br />
              <span style={{ color: '#10b981', fontSize: '30px', letterSpacing: '2px' }}>{targetWord}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '85%', maxWidth: '300px' }}>
              <button onClick={nextLevel} className="retro-btn" style={{ ...nextLevelBtnStyle, fontSize: '20px', padding: '12px 20px', cursor: 'pointer' }}>
                Devinette Suivante ⏭
              </button>
              {isIntermission && onIntermissionComplete && (
                <button onClick={onIntermissionComplete} className="retro-btn" style={{ ...nextLevelBtnStyle, background: '#3b82f6', fontSize: '18px', padding: '10px 18px', cursor: 'pointer' }}>
                  Terminer l'entracte 🏁
                </button>
              )}
            </div>
          </div>
        )}

        {gameState === 'lost' && (
          <div style={overlayStyle}>
            <div style={{ fontSize: '50px', marginBottom: '5px' }}>🦈</div>
            <div style={{ ...victoryTitleStyle, color: '#ef4444' }}>Plouf !</div>
            <div style={{ color: '#1e293b', fontSize: '22px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
              Le mot était <br />
              <span style={{ color: '#ef4444', fontSize: '30px', letterSpacing: '2px' }}>{targetWord}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '85%', maxWidth: '300px' }}>
              <button onClick={forceNextQuestion} className="retro-btn" style={{ ...nextLevelBtnStyle, background: '#8b5cf6', fontSize: '20px', padding: '12px 20px', cursor: 'pointer' }}>
                Question Suivante ⏭
              </button>
              <button onClick={resetLevel} className="retro-btn" style={{ ...nextLevelBtnStyle, background: '#ef4444', fontSize: '18px', padding: '10px 18px', cursor: 'pointer' }}>
                Réessayer 🔄
              </button>
            </div>
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
  backgroundSize: '25px 25px',
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box'
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
  padding: '4px 12px',
  color: '#1e293b'
};

const topSectionStyle = {
  display: 'flex',
  padding: '10px 15px',
  gap: '12px',
  alignItems: 'flex-start'
};

const drawingContainerStyle = {
  flex: '0 0 140px',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '16px',
  padding: '8px',
  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
  border: '2px solid rgba(255,255,255,0.2)'
};

const drawingStyle = {
  background: 'transparent',
  filter: 'drop-shadow(0px 4px 4px rgba(0,0,0,0.25))'
};

const livesBadgeStyle = {
  background: '#ef4444',
  color: '#ffffff',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '15px',
  fontWeight: 'bold',
  marginTop: '6px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
};

const riddleBoxStyle = {
  flex: 1,
  fontSize: '27px',
  fontWeight: '700',
  color: '#1e293b',
  textAlign: 'center',
  lineHeight: '1.4',
  padding: '14px 16px',
  background: 'rgba(255,255,255,0.7)',
  borderRadius: '16px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
  border: '1px dashed #cbd5e1',
  position: 'relative'
};

const riddleTypeBadge = {
  position: 'absolute',
  top: '-12px',
  right: '12px',
  background: '#8b5cf6',
  color: '#ffffff',
  fontSize: '13px',
  padding: '4px 10px',
  borderRadius: '6px',
  fontWeight: 'bold',
  letterSpacing: '0.5px'
};

const wordContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  padding: '24px 15px',
  flexWrap: 'wrap'
};

const letterSlotStyle = {
  minWidth: '34px',
  height: '48px',
  borderBottom: '4px solid #10b981',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  fontSize: '32px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  padding: '0 4px 2px 4px',
  borderRadius: '4px 4px 0 0'
};

const keyboardContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '8px',
  padding: '0 12px',
  marginTop: '15px'
};

const keyBtnStyle = {
  width: '40px',
  height: '40px',
  border: 'none',
  fontSize: '26px',
  fontWeight: 'bold',
  fontFamily: '"Comic Sans MS", "Chalkboard SE", "Marker Felt", sans-serif',
  cursor: 'pointer',
  transition: 'transform 0.1s, background 0.2s',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const jokersContainerStyle = {
  display: 'flex',
  justifyContent: 'space-evenly',
  alignItems: 'center',
  gap: '10px',
  padding: '15px 12px',
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
  width: '52px',
  height: '52px',
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '26px',
  color: 'white',
  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  border: '2px solid #ffffff'
};

const jokerCostStyle = {
  background: '#f59e0b',
  color: '#ffffff',
  fontSize: '13px',
  fontWeight: 'bold',
  padding: '3px 10px',
  borderRadius: '12px',
  border: '1px solid #ffffff',
  whiteSpace: 'nowrap'
};

const overlayStyle = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(5px)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 100,
  animation: 'fadeIn 0.3s ease-out'
};

const victoryTitleStyle = {
  fontSize: '46px',
  color: '#10b981',
  fontWeight: 'bold',
  marginBottom: '10px',
  textShadow: '2px 2px 0px #ffffff'
};

const nextLevelBtnStyle = {
  background: '#10b981',
  color: '#ffffff',
  fontSize: '20px',
  padding: '12px 24px',
  borderRadius: '30px',
  border: 'none',
  fontWeight: 'bold',
  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  width: '100%',
  textAlign: 'center'
};



