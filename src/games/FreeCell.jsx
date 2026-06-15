import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/sound';
import GameIntro from '../components/GameIntro';
import WinLossTransition from '../components/WinLossTransition';

const SUITS = [
  { id: '♥', color: '#c21807' },
  { id: '♦', color: '#c21807' },
  { id: '♣', color: '#1a1a1a' },
  { id: '♠', color: '#1a1a1a' }
];

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Helper to create a shuffled deck
const createDeck = () => {
  let deck = [];
  for (let s of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({
        id: `${RANKS[i]}${s.id}`,
        suit: s.id,
        color: s.color,
        rankLabel: RANKS[i],
        rankValue: i + 1
      });
    }
  }
  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export default function FreeCell({ onBack, onScoreSave }) {
  const [showIntro, setShowIntro] = useState(true);
  const [gameState, setGameState] = useState('menu'); // 'menu' | 'playing'
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const lastTap = useRef({ time: 0, cardId: null });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setIsMobile(containerRef.current.clientWidth < 768);
      } else {
        setIsMobile(window.innerWidth < 768);
      }
    };

    const target = containerRef.current;
    let resizeObserver;
    if (target) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(target);
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver && target) {
        resizeObserver.unobserve(target);
      }
    };
  }, []);

  // Board State
  const [cascades, setCascades] = useState(Array(8).fill([]));
  const [freeCells, setFreeCells] = useState(Array(4).fill(null));
  const [foundations, setFoundations] = useState({ '♥': 0, '♦': 0, '♣': 0, '♠': 0 }); // Stores max rank

  const [selectedCardInfo, setSelectedCardInfo] = useState(null); // { locType: 'cascade'|'freecell', index: number }
  const [history, setHistory] = useState([]);
  const [moves, setMoves] = useState(0);
  const [victoryPhase, setVictoryPhase] = useState(0);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (gameState === 'playing' && victoryPhase === 0 && moves > 0) {
        e.preventDefault();
        e.returnValue = "Voulez-vous vraiment quitter ?";
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

  const startNewGame = () => {
    sound.playClick();
    const deck = createDeck();
    const newCascades = Array(8).fill().map(() => []);

    // Distribute 52 cards: first 4 get 7 cards, last 4 get 6
    let c = 0;
    while (deck.length > 0) {
      newCascades[c].push(deck.pop());
      c = (c + 1) % 8;
    }

    setCascades(newCascades);
    setFreeCells(Array(4).fill(null));
    setFoundations({ '♥': 0, '♦': 0, '♣': 0, '♠': 0 });
    setSelectedCardInfo(null);
    setHistory([]);
    setMoves(0);
    setVictoryPhase(0);
    setGameState('playing');
    sound.startBGM();
  };

  const saveStateToHistory = () => {
    setHistory(prev => [...prev, JSON.stringify({ cascades, freeCells, foundations })]);
  };

  const undoMove = () => {
    if (history.length === 0 || victoryPhase !== 0) return;
    sound.playClick();
    const lastStateStr = history[history.length - 1];
    const lastState = JSON.parse(lastStateStr);

    setCascades(lastState.cascades);
    setFreeCells(lastState.freeCells);
    setFoundations(lastState.foundations);

    setHistory(prev => prev.slice(0, -1));
    setMoves(m => Math.max(0, m - 1));
    setSelectedCardInfo(null);
  };

  // Check if a card can be placed on a foundation
  const canGoToFoundation = (card) => {
    return foundations[card.suit] === card.rankValue - 1;
  };

  // Check if a card can be placed on a cascade tail
  const canGoToCascade = (card, targetTailCard) => {
    if (!targetTailCard) return true; // Empty cascade
    return targetTailCard.color !== card.color && targetTailCard.rankValue === card.rankValue + 1;
  };

  const executeMove = (srcType, srcIdx, destType, destIdx) => {
    const card = srcType === 'cascade' ? cascades[srcIdx][cascades[srcIdx].length - 1] : freeCells[srcIdx];
    if (!card) return false;

    let validMove = false;
    const nextCascades = [...cascades.map(c => [...c])];
    const nextFreeCells = [...freeCells];
    const nextFoundations = { ...foundations };

    if (destType === 'freecell') {
      if (!nextFreeCells[destIdx]) {
        validMove = true;
        nextFreeCells[destIdx] = card;
      }
    } else if (destType === 'foundation') {
      const suit = destIdx;
      if (card.suit === suit && canGoToFoundation(card)) {
        validMove = true;
        nextFoundations[suit] = card.rankValue;
      }
    } else if (destType === 'cascade') {
      const targetTail = nextCascades[destIdx].length > 0 ? nextCascades[destIdx][nextCascades[destIdx].length - 1] : null;
      if (canGoToCascade(card, targetTail)) {
        validMove = true;
        nextCascades[destIdx].push(card);
      }
    }

    if (validMove) {
      saveStateToHistory();

      // Remove from source
      if (srcType === 'cascade') nextCascades[srcIdx].pop();
      if (srcType === 'freecell') nextFreeCells[srcIdx] = null;

      setCascades(nextCascades);
      setFreeCells(nextFreeCells);
      setFoundations(nextFoundations);
      setMoves(m => m + 1);
      setSelectedCardInfo(null);

      if (destType === 'foundation') {
        sound.playTubeComplete();
      } else {
        sound.playBallDrop();
      }

      checkWin(nextFoundations);
      return true;
    } else {
      sound.playShake();
      setSelectedCardInfo(null);
      return false;
    }
  };

  const handleCardClick = (locType, index) => {
    if (victoryPhase !== 0) return;

    // Selection
    if (!selectedCardInfo) {
      let card = null;
      if (locType === 'cascade' && cascades[index].length > 0) {
        card = cascades[index][cascades[index].length - 1]; // Can only select tail
      } else if (locType === 'freecell' && freeCells[index]) {
        card = freeCells[index];
      }

      if (card) {
        sound.playClick();
        setSelectedCardInfo({ locType, index });
      }
      return;
    }

    // Deselection (clicking same card)
    if (selectedCardInfo.locType === locType && selectedCardInfo.index === index) {
      sound.playClick();
      setSelectedCardInfo(null);
      return;
    }

    // Moving
    executeMove(selectedCardInfo.locType, selectedCardInfo.index, locType, index);
  };

  const handleCardDoubleClick = (card) => {
    if (victoryPhase !== 0) return;

    let srcType = null;
    let srcIdx = -1;

    // Locate the card
    for (let i = 0; i < 8; i++) {
      const c = cascades[i];
      if (c.length > 0 && c[c.length - 1].id === card.id) {
        srcType = 'cascade';
        srcIdx = i;
        break;
      }
    }
    if (srcType === null) {
      for (let i = 0; i < 4; i++) {
        if (freeCells[i] && freeCells[i].id === card.id) {
          srcType = 'freecell';
          srcIdx = i;
          break;
        }
      }
    }

    if (srcType === null) return; // Not a movable card

    // Try destinations in priority order:
    // 1. Foundation
    if (canGoToFoundation(card)) {
      if (executeMove(srcType, srcIdx, 'foundation', card.suit)) return;
    }

    // 2. Existing cascades (on top of matching card)
    for (let i = 0; i < 8; i++) {
      const c = cascades[i];
      if (c.length > 0) {
        const tailCard = c[c.length - 1];
        if (canGoToCascade(card, tailCard)) {
          if (executeMove(srcType, srcIdx, 'cascade', i)) return;
        }
      }
    }

    // 3. Empty cascades
    for (let i = 0; i < 8; i++) {
      if (cascades[i].length === 0) {
        if (executeMove(srcType, srcIdx, 'cascade', i)) return;
      }
    }

    // 4. Empty freecells
    for (let i = 0; i < 4; i++) {
      if (freeCells[i] === null) {
        if (executeMove(srcType, srcIdx, 'freecell', i)) return;
      }
    }

    // If no valid place was found, trigger error shake
    sound.playShake();
  };

  const handleDragStart = (e, locType, index) => {
    if (victoryPhase !== 0) return;
    e.dataTransfer.setData('application/json', JSON.stringify({ locType, index }));
    setSelectedCardInfo({ locType, index });
  };

  const handleDrop = (e, destType, destIdx) => {
    e.preventDefault();
    e.stopPropagation();
    if (victoryPhase !== 0) return;

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const { locType: srcType, index: srcIdx } = JSON.parse(dataStr);
      executeMove(srcType, srcIdx, destType, destIdx);
    } catch (err) {
      console.error(err);
    }
  };

  const checkWin = (currentFoundations) => {
    if (Object.values(currentFoundations).every(v => v === 13)) {
      if (victoryPhase === 0) {
        setVictoryPhase(-1);

        setTimeout(() => {
          setVictoryPhase(1);
          sound.stopBGM();

          setTimeout(() => {
            setVictoryPhase(2);
            sound.playExplosion();
          }, 1500);

          setTimeout(() => {
            setVictoryPhase(3);
            sound.playScore();
            if (onScoreSave) {
              onScoreSave('FreeCell', Math.max(1000 - moves * 5, 100));
            }
          }, 3500);
        }, 1500);
      }
    }
  };

  // --- DIMENSIONS & THEME CONFIGURATION ---
  const theme = isMobile ? {
    cardWidth: '60px',
    cardHeight: '78px',
    emojiSize: '30px',
    pipAceSize: '30px',
    pipNormalSize: '30px',
    cornerRankSize: '10px',
    cornerSuitSize: '7px',
    emptySlotSize: '30px',
    titleSize: '20px',
    statusSize: '16px',
    undoSize: '16px',
    verticalSpacing: 14
  } : {
    cardWidth: '80px',
    cardHeight: '115px',
    emojiSize: '40px',
    pipAceSize: '32px',
    pipNormalSize: '40px',
    cornerRankSize: '18px',
    cornerSuitSize: '14px',
    emptySlotSize: '40px',
    titleSize: '24px',
    statusSize: '18px',
    undoSize: '18px',
    verticalSpacing: 35
  };

  const verticalSpacing = theme.verticalSpacing;

  // RENDERERS
  const renderCard = (card, isSelected, onClickCallback, locType, index, isTail) => {
    if (!card) return null;

    const renderCenter = () => {
      const { rankLabel, suit, color } = card;

      if (['J', 'Q', 'K'].includes(rankLabel)) {
        let emoji = '⚔️';
        if (rankLabel === 'Q') emoji = '👸';
        if (rankLabel === 'K') emoji = '🤴';
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.85, width: '100%', height: '100%' }}>
            <div style={{ fontSize: theme.emojiSize, lineHeight: 1 }}>{emoji}</div>
            {!isMobile && (
              <div style={{ fontSize: '14px', fontWeight: 'bold', color, marginTop: '4px' }}>{rankLabel}</div>
            )}
          </div>
        );
      }

      let positions = [];
      const val = parseInt(rankLabel, 10);
      if (rankLabel === 'A') {
        positions = [{ x: 50, y: 50 }];
      } else if (val === 2) {
        positions = [{ x: 50, y: 20 }, { x: 50, y: 80 }];
      } else if (val === 3) {
        positions = [{ x: 50, y: 20 }, { x: 50, y: 50 }, { x: 50, y: 80 }];
      } else if (val === 4) {
        positions = [
          { x: 30, y: 20 }, { x: 70, y: 20 },
          { x: 30, y: 80 }, { x: 70, y: 80 }
        ];
      } else if (val === 5) {
        positions = [
          { x: 30, y: 20 }, { x: 70, y: 20 },
          { x: 50, y: 50 },
          { x: 30, y: 80 }, { x: 70, y: 80 }
        ];
      } else if (val === 6) {
        positions = [
          { x: 30, y: 20 }, { x: 70, y: 20 },
          { x: 30, y: 50 }, { x: 70, y: 50 },
          { x: 30, y: 80 }, { x: 70, y: 80 }
        ];
      } else if (val === 7) {
        positions = [
          { x: 30, y: 20 }, { x: 70, y: 20 },
          { x: 30, y: 50 }, { x: 70, y: 50 },
          { x: 50, y: 35 },
          { x: 30, y: 80 }, { x: 70, y: 80 }
        ];
      } else if (val === 8) {
        positions = [
          { x: 30, y: 20 }, { x: 70, y: 20 },
          { x: 30, y: 50 }, { x: 70, y: 50 },
          { x: 50, y: 35 }, { x: 50, y: 65 },
          { x: 30, y: 80 }, { x: 70, y: 80 }
        ];
      } else if (val === 9) {
        positions = [
          { x: 30, y: 20 }, { x: 70, y: 20 },
          { x: 30, y: 40 }, { x: 70, y: 40 },
          { x: 50, y: 50 },
          { x: 30, y: 60 }, { x: 70, y: 60 },
          { x: 30, y: 80 }, { x: 70, y: 80 }
        ];
      } else if (val === 10) {
        positions = [
          { x: 30, y: 20 }, { x: 70, y: 20 },
          { x: 30, y: 40 }, { x: 70, y: 40 },
          { x: 50, y: 30 }, { x: 50, y: 70 },
          { x: 30, y: 60 }, { x: 70, y: 60 },
          { x: 30, y: 80 }, { x: 70, y: 80 }
        ];
      }

      return (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          {positions.map((pos, idx) => {
            const shouldRotate = pos.y > 50;
            const isAce = rankLabel === 'A';
            return (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  transform: `translate(-50%, -50%) ${shouldRotate ? 'rotate(180deg)' : ''}`,
                  color,
                  fontSize: isAce ? theme.pipAceSize : theme.pipNormalSize,
                  opacity: 0.8,
                  lineHeight: 1
                }}
              >
                {suit}
              </div>
            );
          })}
        </div>
      );
    };

    const isDraggable = (locType === 'freecell') || (locType === 'cascade' && isTail);

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          const now = Date.now();
          const DOUBLE_PRESS_DELAY = 500;
          if (now - lastTap.current.time < DOUBLE_PRESS_DELAY && lastTap.current.cardId === card.id) {
            handleCardDoubleClick(card);
          } else {
            lastTap.current = { time: now, cardId: card.id };
            onClickCallback(e);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleCardDoubleClick(card);
        }}
        draggable={isDraggable}
        onDragStart={(e) => handleDragStart(e, locType, index)}
        onDragEnd={() => setSelectedCardInfo(null)}
        onDragOver={(e) => {
          // Accept drops if it's a foundation card or tail card of a cascade
          if (locType === 'foundation' || (locType === 'cascade' && isTail)) {
            e.preventDefault();
          }
        }}
        onDrop={(e) => handleDrop(e, locType, index)}
        translate="no"
        className="notranslate"
        style={{
          width: theme.cardWidth,
          height: theme.cardHeight,
          background: '#FFFEF5', borderRadius: isMobile ? '4px' : '6px',
          border: isSelected ? (isMobile ? '2.5px solid #F59E0B' : '3px solid #F59E0B') : '1px solid #94a3b8',
          boxShadow: isSelected ? '0 0 10px rgba(245, 158, 11, 0.8), 0 3px 6px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box', cursor: isDraggable ? 'grab' : 'pointer',
          transform: isSelected ? (isMobile ? 'translateY(-5px)' : 'translateY(-10px)') : 'translateY(0)',
          transition: 'all 0.15s cubic-bezier(0.25, 0.8, 0.25, 1)',
          position: 'relative', zIndex: isSelected ? 10 : 1
        }}
      >
        <div style={{ position: 'absolute', top: isMobile ? '2px' : '4px', left: isMobile ? '3px' : '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
          <div style={{ color: card.color, fontSize: theme.cornerRankSize, fontWeight: 'bold' }}>{card.rankLabel}</div>
          <div style={{ color: card.color, fontSize: theme.cornerSuitSize, marginTop: isMobile ? '-2px' : '0' }}>{card.suit}</div>
        </div>
        <div style={{ position: 'absolute', bottom: isMobile ? '2px' : '4px', right: isMobile ? '3px' : '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1, transform: 'rotate(180deg)' }}>
          <div style={{ color: card.color, fontSize: theme.cornerRankSize, fontWeight: 'bold' }}>{card.rankLabel}</div>
          <div style={{ color: card.color, fontSize: theme.cornerSuitSize, marginTop: isMobile ? '-2px' : '0' }}>{card.suit}</div>
        </div>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
          {renderCenter()}
        </div>
      </div>
    );
  };

  const renderEmptySlot = (onClick, content = '', destType, destIdx) => (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(e); }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => handleDrop(e, destType, destIdx)}
      style={{
        width: theme.cardWidth, height: theme.cardHeight, borderRadius: isMobile ? '4px' : '6px',
        border: '2.5px solid rgba(255,255,255,0.4)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        color: 'rgba(255,255,255,0.2)', fontSize: theme.emptySlotSize, cursor: 'pointer',
        boxSizing: 'border-box', background: 'rgba(0,0,0,0.1)'
      }}
    >
      {content}
    </div>
  );

  // Dynamic Inline Styles
  const containerStyle = {
    display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1000px',
    background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(10px)',
    borderRadius: isMobile ? '8px' : '16px',
    padding: isMobile ? '8px' : '20px',
    boxSizing: 'border-box',
    margin: '0 auto', minHeight: '100%', position: 'relative', overflowX: 'hidden'
  };

  const headerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px',
    gap: '10px'
  };

  const backBtnStyle = {
    padding: isMobile ? '6px 10px' : '8px 16px',
    fontSize: isMobile ? '12px' : '14px',
    whiteSpace: 'nowrap',
    flexShrink: 0
  };

  const titleStyle = {
    fontFamily: 'Orbitron, sans-serif', fontSize: theme.titleSize, color: '#fff',
    letterSpacing: '1px', fontWeight: 'bold', textAlign: 'center', flexGrow: 1,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 5px'
  };

  const menuStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1 };

  const gameplayContainerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, width: '100%' };

  const statusRowStyle = {
    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '15px', fontSize: theme.statusSize, padding: '0 10px', boxSizing: 'border-box'
  };

  const boardWrapperStyle = {
    width: '100%', background: '#0a6c29', // Classic casino green felt
    borderRadius: '12px', padding: isMobile ? '6px' : '20px', boxSizing: 'border-box',
    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.6)',
    border: isMobile ? '3px solid #064018' : '6px solid #064018',
    minHeight: isMobile ? '380px' : '550px',
    overflowX: 'hidden',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column'
  };

  const topRowStyle = {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: isMobile ? '15px' : '30px',
    gap: isMobile ? '10px' : '12px',
    width: '100%'
  };

  const slotsGroupStyle = {
    display: 'flex',
    gap: isMobile ? '4px' : '12px',
    justifyContent: 'center',
    width: isMobile ? '100%' : 'auto'
  };

  const cascadesContainerStyle = {
    display: 'flex',
    justifyContent: isMobile ? 'space-around' : 'space-between',
    paddingTop: '10px',
    width: '100%',
    gap: isMobile ? '10px' : '0',
    // flexGrow: 1,
    flexWrap: isMobile ? 'wrap' : 'nowrap'
  };

  const cascadeColStyle = {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative',
    width: isMobile ? 'calc(25% - 10px)' : theme.cardWidth,
    minHeight: theme.cardHeight
  };

  return (
    <>
      {showIntro && <GameIntro
        gameName="FREECELL"
        icon="🃏"
        colors={['#c21807', '#1a1a1a', '#ffffff']}
        particleType="cards"
        onComplete={() => setShowIntro(false)}
      />}
      <div ref={containerRef} style={containerStyle}>
        <div style={headerStyle}>
          <button onClick={handleBackWithConfirm} className="retro-btn" style={backBtnStyle}>
            &lt; Retour Hub
          </button>
          <div style={titleStyle}>FREECELL</div>
          {gameState === 'playing' ? (
            <button onClick={() => setGameState('menu')} className="retro-btn" style={backBtnStyle}>
              Abandonner
            </button>
          ) : <div style={{ width: isMobile ? '60px' : '80px' }}></div>}
        </div>

        {gameState === 'menu' && (
          <div style={menuStyle}>
            <div style={{ fontSize: '5rem', marginBottom: '20px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))' }}>🃏</div>
            <h2 style={{ color: '#fff', marginBottom: '30px', textAlign: 'center' }}>Prêt à empiler les cartes ?</h2>
            <button
              onClick={startNewGame}
              className="retro-btn pulse-glow"
              style={{ padding: '15px 40px', fontSize: '20px', borderColor: '#39FF14', color: '#39FF14' }}
            >
              Nouvelle Partie
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div style={gameplayContainerStyle}>

            <div style={statusRowStyle}>
              <div><span style={{ color: '#8e8a9f' }}>Coups: </span><span style={{ color: '#fff', fontWeight: 'bold' }}>{moves}</span></div>
              <button
                onClick={undoMove}
                disabled={history.length === 0}
                style={{
                  background: 'transparent', border: 'none', color: history.length > 0 ? '#00F0FF' : '#555',
                  cursor: history.length > 0 ? 'pointer' : 'default', fontSize: theme.undoSize, fontWeight: 'bold'
                }}
              >
                ↩️ Annuler (Undo)
              </button>
            </div>

            <div
              className="bloc_freecell"
              style={boardWrapperStyle}
              onClick={() => setSelectedCardInfo(null)}
            >
              {isMobile ? (
                <>
                  {/* MOBILE: Foundations at top */}
                  <div className="bloc_as" style={{ ...slotsGroupStyle, marginBottom: '15px' }}>
                    {SUITS.map((s) => {
                      const currentRank = foundations[s.id];
                      const card = currentRank > 0 ? { suit: s.id, color: s.color, rankLabel: RANKS[currentRank - 1], rankValue: currentRank } : null;
                      return (
                        <div key={`fd-${s.id}`}>
                          {card
                            ? renderCard(card, false, () => handleCardClick('foundation', s.id), 'foundation', s.id, false)
                            : renderEmptySlot(() => handleCardClick('foundation', s.id), s.id, 'foundation', s.id)
                          }
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* DESKTOP: Top Row: FreeCells (Left) + Foundations (Right) */
                <div style={topRowStyle}>
                  {/* FreeCells */}
                  <div className="bloc_tmp" style={slotsGroupStyle}>
                    {freeCells.map((card, i) => (
                      <div key={`fc-${i}`}>
                        {card
                          ? renderCard(card, selectedCardInfo?.locType === 'freecell' && selectedCardInfo?.index === i, () => handleCardClick('freecell', i), 'freecell', i, true)
                          : renderEmptySlot(() => handleCardClick('freecell', i), '', 'freecell', i)
                        }
                      </div>
                    ))}
                  </div>

                  {/* Foundations */}
                  <div className="bloc_as" style={slotsGroupStyle}>
                    {SUITS.map((s) => {
                      const currentRank = foundations[s.id];
                      const card = currentRank > 0 ? { suit: s.id, color: s.color, rankLabel: RANKS[currentRank - 1], rankValue: currentRank } : null;
                      return (
                        <div key={`fd-${s.id}`}>
                          {card
                            ? renderCard(card, false, () => handleCardClick('foundation', s.id), 'foundation', s.id, false)
                            : renderEmptySlot(() => handleCardClick('foundation', s.id), s.id, 'foundation', s.id)
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Middle/Bottom: Cascades */}
              <div className="bloc_cards" style={cascadesContainerStyle}>
                {cascades.map((cascade, colIndex) => (
                  <div
                    key={`c-${colIndex}`}
                    style={{
                      ...cascadeColStyle,
                      height: isMobile ? `calc(${theme.cardHeight} + ${Math.max(0, cascade.length - 1) * theme.verticalSpacing}px)` : 'auto',
                      marginBottom: isMobile ? '15px' : '0'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Allow clicking empty cascade
                      if (cascade.length === 0) handleCardClick('cascade', colIndex);
                    }}
                    onDragOver={(e) => {
                      if (cascade.length === 0) {
                        e.preventDefault();
                      }
                    }}
                    onDrop={(e) => {
                      if (cascade.length === 0) {
                        handleDrop(e, 'cascade', colIndex);
                      }
                    }}
                  >
                    {cascade.length === 0 && renderEmptySlot(() => handleCardClick('cascade', colIndex), '', 'cascade', colIndex)}

                    {cascade.map((card, cardIndex) => {
                      const isTail = cardIndex === cascade.length - 1;
                      const isSelected = isTail && selectedCardInfo?.locType === 'cascade' && selectedCardInfo?.index === colIndex;
                      return (
                        <div
                          key={card.id}
                          style={{
                            position: cardIndex === 0 ? 'relative' : 'absolute',
                            top: cardIndex === 0 ? 0 : `${cardIndex * verticalSpacing}px`,
                            zIndex: cardIndex
                          }}
                        >
                          {renderCard(card, isSelected, (e) => {
                            e.stopPropagation();
                            if (isTail) handleCardClick('cascade', colIndex);
                          }, 'cascade', colIndex, isTail)}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {isMobile && (
                /* MOBILE: FreeCells at bottom (2 rows) */
                <div className="bloc_tmp" style={{ display: 'flex', 'flexDirection': 'row', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                  {freeCells.map((card, i) => (
                    <div key={`fc-${i}`}>
                      {card
                        ? renderCard(card, selectedCardInfo?.locType === 'freecell' && selectedCardInfo?.index === i, () => handleCardClick('freecell', i), 'freecell', i, true)
                        : renderEmptySlot(() => handleCardClick('freecell', i), '', 'freecell', i)
                      }
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Transition Phase */}
        {victoryPhase === -1 && <WinLossTransition type="win" />}

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
                    width: '15px', height: '20px', background: ['#DC2626', '#1E293B', '#F59E0B', '#39FF14'][i % 4],
                    borderRadius: '2px', animation: `confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s infinite`,
                    transform: `rotate(${Math.random() * 360}deg)`, opacity: 0.8
                  }} />
                ))}
              </div>
            )}

            {victoryPhase === 1 && (
              <h2 style={{ fontSize: '4rem', color: '#FFD700', margin: 0, animation: 'popIn 0.8s' }}>ROYAL !</h2>
            )}

            {victoryPhase === 3 && (
              <div style={{
                animation: 'popIn 0.5s', textAlign: 'center', background: 'white', padding: isMobile ? '30px 20px' : '50px',
                borderRadius: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', border: '4px solid #FFD700', zIndex: 10
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '10px' }}>👑</div>
                <h2 style={{ fontSize: '2.5rem', color: '#333', margin: '0 0 20px 0' }}>Patience Récompensée !</h2>
                <div style={{ fontSize: '1.5rem', color: '#666', marginBottom: '30px' }}>
                  Score: <strong style={{ color: '#F59E0B', fontSize: '2rem' }}>{Math.max(1000 - moves * 5, 100)}</strong>
                </div>
                <button
                  onClick={() => { setVictoryPhase(0); setGameState('menu'); }}
                  className="retro-btn pulse-glow"
                  style={{ fontSize: '1.2rem', padding: '10px 30px', borderColor: '#F59E0B', color: '#F59E0B' }}
                >
                  Retour Menu
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
