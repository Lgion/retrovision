import { useState, useEffect, useRef, useCallback } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import MemoryPairsCollection from './MemoryPairsCollection';
import SymbolIcon from '../components/SymbolIcon';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { shuffle, randomChoice } from '../utils/commonUtils';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';
import { useGameCustomizations } from '../hooks/useGameCustomizations';

// Bibliothèque de 8 symboles zen artisanaux (rendus en SVG haute précision)
const ZEN_SYMBOLS = [
  { id: 'lotus', name: 'Lotus', color: '#db2777' },
  { id: 'sakura', name: 'Cerisier', color: '#e11d48' },
  { id: 'leaf', name: 'Feuille Zen', color: '#059669' },
  { id: 'bamboo', name: 'Bambou', color: '#16a34a' },
  { id: 'moon', name: 'Lune Zen', color: '#d97706' },
  { id: 'crystal', name: 'Cristal', color: '#0284c7' },
  { id: 'star', name: 'Étoile', color: '#ca8a04' },
  { id: 'stone', name: 'Galet Zen', color: '#475569' }
];

// Mots doux de félicitations pour la mémoire de travail et l'attention visuelle
const ZEN_ENCOURAGEMENTS = [
  "Votre mémoire visuelle et votre calme font des merveilles.",
  "Chaque paire retrouvée renforce vos repères spatiaux.",
  "Prenez un instant pour savourer cette belle clarté d'esprit.",
  "Votre regard balaie l'espace avec harmonie et confiance.",
  "La régularité et la sérénité ouvrent chaque jour de nouvelles voies.",
  "Bravo ! Votre concentration s'ancre avec une belle fluidité.",
  "Un bel équilibre entre observation attentive et patience."
];

// Configuration des modes de difficulté
const DIFFICULTY_CONFIG = {
  facile: { pairsCount: 4, cols: 4, label: 'Facile (4 paires)' },
  moyen: { pairsCount: 6, cols: 4, label: 'Moyen (6 paires)' },
  difficile: { pairsCount: 8, cols: 4, label: 'Difficile (8 paires)' }
};

// Fonction pure de génération de paquet de cartes
const generateDeck = (pairsCount, cols) => {
  const selectedSymbols = shuffle([...ZEN_SYMBOLS]).slice(0, pairsCount);
  const deck = [];
  selectedSymbols.forEach((sym) => {
    deck.push({
      id: `${sym.id}_1`,
      pairId: sym.id,
      symbol: sym
    });
    deck.push({
      id: `${sym.id}_2`,
      pairId: sym.id,
      symbol: sym
    });
  });

  return shuffle(deck).map((card, index) => {
    const r = Math.floor(index / cols);
    const c = index % cols;
    return {
      ...card,
      r,
      c,
      isLeftField: c === 0 // Colonne la plus à gauche (héminégligence)
    };
  });
};

function getThemeStyle(themeId) {
  switch (themeId) {
    case 'natural_wood':
      return {
        id: 'natural_wood',
        boardBg: 'linear-gradient(135deg, #f5ecd7 0%, #ebe0c8 100%)',
        textColor: '#451a03',
        barBg: '#fef3c7',
        barBorder: '#d97706',
        backBg: 'linear-gradient(145deg, #78350f 0%, #451a03 100%)',
        backBorder: '#b45309',
        frontBg: 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
        frontBorder: '#d97706',
        matchedBg: '#ecfdf5',
        matchedBorder: '#10b981',
        patternType: 'wood'
      };
    case 'watercolor':
      return {
        id: 'watercolor',
        boardBg: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 50%, #fce7f3 100%)',
        textColor: '#0f172a',
        barBg: 'rgba(255, 255, 255, 0.9)',
        barBorder: '#93c5fd',
        backBg: 'linear-gradient(135deg, #0284c7 0%, #6366f1 50%, #d946ef 100%)',
        backBorder: '#93c5fd',
        frontBg: '#ffffff',
        frontBorder: '#cbd5e1',
        matchedBg: '#f0fdf4',
        matchedBorder: '#86efac',
        patternType: 'watercolor'
      };
    case 'herbarium':
      return {
        id: 'herbarium',
        boardBg: 'linear-gradient(135deg, #f7fee7 0%, #ecfccb 100%)',
        textColor: '#14532d',
        barBg: '#fefce8',
        barBorder: '#84cc16',
        backBg: 'linear-gradient(145deg, #713f12 0%, #3f2207 100%)',
        backBorder: '#a16207',
        frontBg: '#fefefe',
        frontBorder: '#84cc16',
        matchedBg: '#f0fdf4',
        matchedBorder: '#4ade80',
        patternType: 'herbarium'
      };
    case 'minimal':
      return {
        id: 'minimal',
        boardBg: '#f8fafc',
        textColor: '#0f172a',
        barBg: '#ffffff',
        barBorder: '#cbd5e1',
        backBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        backBorder: '#334155',
        frontBg: '#ffffff',
        frontBorder: '#cbd5e1',
        matchedBg: '#f0fdf4',
        matchedBorder: '#10b981',
        patternType: 'minimal'
      };
    case 'japanese_paper':
    default:
      return {
        id: 'japanese_paper',
        boardBg: 'linear-gradient(135deg, #f7f4ed 0%, #efebe2 100%)',
        textColor: '#1e293b',
        barBg: '#ffffff',
        barBorder: '#e2d9cc',
        backBg: 'linear-gradient(145deg, #0f172a 0%, #1e293b 100%)',
        backBorder: '#d4af37',
        frontBg: '#fffdfa',
        frontBorder: '#d6cdbd',
        matchedBg: '#f0fdf4',
        matchedBorder: '#86efac',
        patternType: 'seigaiha'
      };
  }
}

function CardBackPattern({ theme, isLeftField }) {
  if (theme.patternType === 'wood') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="100%" height="100%" viewBox="0 0 48 60" style={{ position: 'absolute', inset: 0, opacity: 0.25 }}>
          <path d="M0,10 Q24,15 48,10 M0,25 Q24,30 48,25 M0,40 Q24,45 48,40 M0,55 Q24,60 48,55" stroke="#fef3c7" strokeWidth="1.2" fill="none" />
        </svg>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1.5px solid #d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <span style={{ fontSize: '13px', color: '#fde68a' }}>🪵</span>
        </div>
      </div>
    );
  }

  if (theme.patternType === 'watercolor') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '14px' }}>🎨</span>
        </div>
      </div>
    );
  }

  if (theme.patternType === 'herbarium') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1.5px solid #ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.15)' }}>
          <SymbolIcon name="leaf" size={18} color="#a3e635" />
        </div>
      </div>
    );
  }

  if (theme.patternType === 'minimal') {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '22px', height: '22px', border: '1.5px solid #64748b', transform: 'rotate(45deg)' }} />
      </div>
    );
  }

  // Japanese Paper (Seigaiha pattern)
  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width="100%" height="100%" viewBox="0 0 40 50" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
        <defs>
          <pattern id="seigaiha-pattern" width="16" height="8" patternUnits="userSpaceOnUse">
            <path d="M 0,8 A 8,8 0 0,1 16,8 M 2,8 A 6,6 0 0,1 14,8 M 4,8 A 4,4 0 0,1 12,8" fill="none" stroke="#d4af37" strokeWidth="0.8" />
            <path d="M -8,4 A 8,8 0 0,1 8,4 M -6,4 A 6,6 0 0,1 6,4 M -4,4 A 4,4 0 0,1 4,4" fill="none" stroke="#d4af37" strokeWidth="0.8" />
            <path d="M 8,4 A 8,8 0 0,1 24,4 M 10,4 A 6,6 0 0,1 22,4 M 12,4 A 4,4 0 0,1 20,4" fill="none" stroke="#d4af37" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#seigaiha-pattern)" />
      </svg>
      <div style={{ position: 'absolute', inset: '4px', border: '1px solid rgba(212, 175, 55, 0.7)', borderRadius: '8px', pointerEvents: 'none' }} />
      <div style={{ width: '26px', height: '26px', borderRadius: '50%', border: '1.5px solid #d4af37', background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>
        <SymbolIcon name="sakura" size={15} color="#d4af37" />
      </div>
    </div>
  );
}

export default function MemoryPairs({
  onBack,
  onScoreSave,
  isIntermission = false,
  intermissionDifficulty = 'facile',
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  upcomingIntermission,
  onSelectUpcomingIntermission,
  onShuffleUpcomingIntermission,
  intermissionConfig,
  intermissionGames,
  skipIntro = false,
  onLaunchIntermission
}) {
  const confirm = useConfirm();

  // Customisations et thème (Boutique)
  const { custom, updateCustom, activeTheme } = useGameCustomizations('memory', {
    theme: 'japanese_paper',
    difficulty: 'moyen'
  });

  const [showCollection, setShowCollection] = useState(false);
  const themeObj = getThemeStyle(activeTheme);

  // Écran d'intro avec animation et bouton "JOUER"
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);

  // Niveau de difficulté
  const [difficulty, setDifficulty] = useState(() => {
    if (isIntermission) {
      if (intermissionDifficulty === 'difficile') return 'difficile';
      if (intermissionDifficulty === 'moyen') return 'moyen';
      return 'facile';
    }
    return custom.difficulty || storage.getItem('retrovision_memory_diff', 'moyen') || 'moyen';
  });

  const currentConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.moyen;
  const { pairsCount, cols } = currentConfig;

  // Cartes du plateau initialisées paresseusement
  const [cards, setCards] = useState(() => generateDeck(currentConfig.pairsCount, currentConfig.cols));
  const [flippedCardIds, setFlippedCardIds] = useState([]);
  const [matchedPairIds, setMatchedPairIds] = useState(() => new Set());
  const [isLocked, setIsLocked] = useState(false);
  const [hintedPairId, setHintedPairId] = useState(null);

  // Statistiques de la manche
  const [moves, setMoves] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  // Meilleur score (moins de coups possible)
  const [bestMoves, setBestMoves] = useState(() => {
    return storage.getNumber(`retrovision_memory_${difficulty}_best`, 0);
  });

  const timerRef = useRef(null);

  // Chronomètre
  useEffect(() => {
    if (isTimerRunning && !isGameWon) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isGameWon]);

  // Initialisation ou réinitialisation du plateau
  const initBoard = useCallback((targetPairsCount = pairsCount, targetCols = cols) => {
    setCards(generateDeck(targetPairsCount, targetCols));
    setFlippedCardIds([]);
    setMatchedPairIds(new Set());
    setIsLocked(false);
    setHintedPairId(null);
    setMoves(0);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setIsGameWon(false);
  }, [pairsCount, cols]);

  // Clic sur une carte
  const handleCardClick = (card) => {
    if (isLocked) return;
    if (matchedPairIds.has(card.pairId)) return;
    if (flippedCardIds.includes(card.id)) return;

    if (!isTimerRunning && moves === 0) {
      setIsTimerRunning(true);
    }

    haptic.tap();
    if (card.isLeftField) {
      sound.playPentatonicNote(3, true, 0.25);
    } else {
      sound.playClick();
    }

    const newFlipped = [...flippedCardIds, card.id];
    setFlippedCardIds(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Paire trouvée !
        const pairId = firstCard.pairId;
        setTimeout(() => {
          sound.playScore();
          haptic.success();

          setMatchedPairIds((prev) => {
            const nextSet = new Set(prev);
            nextSet.add(pairId);

            if (nextSet.size === pairsCount) {
              handleGameWin();
            }
            return nextSet;
          });

          setFlippedCardIds([]);
          setIsLocked(false);
        }, 450);
      } else {
        // Pas de correspondance
        setTimeout(() => {
          haptic.warning();
          sound.playPentatonicNote(0, false, 0.15);
          setFlippedCardIds([]);
          setIsLocked(false);
        }, 750);
      }
    }
  };

  const handleGameWin = () => {
    setIsGameWon(true);
    setIsTimerRunning(false);
    sound.playChapterVictory();
    haptic.success();
    setEncouragement(randomChoice(ZEN_ENCOURAGEMENTS));

    const currentBest = storage.getNumber(`retrovision_memory_${difficulty}_best`, 0);
    const newBest = currentBest === 0 ? moves + 1 : Math.min(currentBest, moves + 1);
    storage.setItem(`retrovision_memory_${difficulty}_best`, newBest);
    setBestMoves(newBest);

    if (onScoreSave) {
      onScoreSave(100);
    }

    if (isIntermission && onIntermissionComplete) {
      setTimeout(() => {
        onIntermissionComplete(true);
      }, 1200);
    }
  };

  const handleUseHint = () => {
    if (isLocked || isGameWon) return;

    const remainingCards = cards.filter((c) => !matchedPairIds.has(c.pairId));
    if (remainingCards.length === 0) return;

    let candidate = remainingCards.find((c) => c.isLeftField);
    if (!candidate) {
      candidate = randomChoice(remainingCards);
    }

    const pairToReveal = candidate.pairId;
    setHintedPairId(pairToReveal);
    sound.playPowerup();
    haptic.tap();

    setTimeout(() => {
      setHintedPairId(null);
    }, 1500);
  };

  const handleSelectDifficulty = (newDiff) => {
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    updateCustom('difficulty', newDiff);
    storage.setItem('retrovision_memory_diff', newDiff);
    sound.playClick();
    const newCfg = DIFFICULTY_CONFIG[newDiff] || DIFFICULTY_CONFIG.moyen;
    initBoard(newCfg.pairsCount, newCfg.cols);
    setBestMoves(storage.getNumber(`retrovision_memory_${newDiff}_best`, 0));
  };

  const handleBackWithConfirm = async () => {
    if (moves > 0 && !isGameWon) {
      const ok = await confirm({
        title: 'Quitter la partie ?',
        message: 'Une partie de Paires Mémoire est en cours. Vos coups actuels ne seront pas enregistrés.',
        confirmText: 'Quitter',
        cancelText: 'Continuer',
        confirmVariant: 'danger'
      });
      if (!ok) return;
    }
    onBack();
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progressRatio = pairsCount > 0 ? matchedPairIds.size / pairsCount : 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: '16px',
        color: themeObj.textColor,
        background: themeObj.boardBg,
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
        position: 'relative'
      }}
    >
      <style>{`
        .memory-card-scene {
          perspective: 900px;
        }
        .memory-card-flipper {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.45s cubic-bezier(0.34, 1.4, 0.64, 1);
        }
        .memory-card-flipper.is-flipped {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          border-radius: 12px;
          overflow: hidden;
          box-sizing: border-box;
          user-select: none;
        }
        .card-face-front {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Animation d'Intro avec bouton "JOUER" */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Paires Mémoire"
          icon="🎴"
          colors={['#0284c7', '#d4af37', '#e11d48']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Repère d'ancrage visuel gauche (Héminégligence) */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          background: '#0284c7',
          zIndex: 40,
          pointerEvents: 'none'
        }}
      />

      {/* En-tête : Intermission ou Standard avec Boutique */}
      {isIntermission ? (
        <IntermissionHeader
          instructionText="Associez les paires cachées pour réussir l'entracte !"
          onRestart={() => initBoard()}
          onOtherGame={onIntermissionRequest}
          onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
          replaySame={replaySameIntermission}
          onToggleReplaySame={onToggleReplaySameIntermission}
          progress={progressRatio}
        />
      ) : (
        <GameHeader
          title="PAIRES MÉMOIRE"
          subtitle="Association & mémoire zen"
          onBack={handleBackWithConfirm}
          onRestart={() => initBoard()}
          showShop={true}
          onOpenShop={() => setShowCollection(true)}
          onLaunchIntermission={onLaunchIntermission}
        />
      )}

      {/* Barre de contrôles et statistiques */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '540px',
          flexWrap: 'wrap',
          gap: '10px',
          margin: '12px 0 16px 0',
          padding: '10px 16px',
          background: themeObj.barBg,
          borderRadius: '14px',
          border: `1px solid ${themeObj.barBorder}`,
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}
      >
        {/* Sélecteur de difficulté (hors entracte) */}
        {!isIntermission ? (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['facile', 'moyen', 'difficile'].map((diffKey) => {
              const isActive = difficulty === diffKey;
              return (
                <button
                  key={diffKey}
                  type="button"
                  onClick={() => handleSelectDifficulty(diffKey)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    minHeight: '38px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: isActive ? '#0284c7' : 'rgba(0,0,0,0.04)',
                    border: isActive ? '2px solid #0284c7' : '1px solid rgba(0,0,0,0.1)',
                    color: isActive ? '#ffffff' : themeObj.textColor,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {diffKey === 'facile' ? '4 Paires' : diffKey === 'moyen' ? '6 Paires' : '8 Paires'}
                </button>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                textTransform: 'uppercase',
                fontWeight: '700',
                letterSpacing: '0.05em',
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #bae6fd'
              }}
            >
              Entracte • {DIFFICULTY_CONFIG[difficulty]?.label || difficulty}
            </span>
          </div>
        )}

        {/* Compteurs : Paires, Coups, Temps */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '13px', fontWeight: '600' }}>
          <div>
            <span style={{ opacity: 0.7, marginRight: '4px' }}>Paires :</span>
            <span style={{ color: '#0284c7', fontWeight: '800' }}>
              {matchedPairIds.size} / {pairsCount}
            </span>
          </div>
          <div>
            <span style={{ opacity: 0.7, marginRight: '4px' }}>Coups :</span>
            <span style={{ color: '#d97706', fontWeight: '800' }}>{moves}</span>
          </div>
          <div>
            <span style={{ opacity: 0.7, marginRight: '4px' }}>Temps :</span>
            <span style={{ color: '#16a34a', fontWeight: '800' }}>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Bouton Indice Zen */}
        <button
          type="button"
          onClick={handleUseHint}
          disabled={isLocked || isGameWon}
          title="Révéler brièvement une paire"
          aria-label="Révéler un indice zen"
          style={{
            minHeight: '38px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '700',
            background: '#fffbeb',
            border: '1.5px solid #ca8a04',
            color: '#b45309',
            cursor: isLocked || isGameWon ? 'not-allowed' : 'pointer',
            opacity: isLocked || isGameWon ? 0.4 : 1
          }}
        >
          💡 Indice Zen
        </button>
      </div>

      {/* Grille de cartes 3D avec thème actif */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: '12px',
          width: '100%',
          maxWidth: '540px',
          margin: '0 auto 20px auto',
          boxSizing: 'border-box'
        }}
      >
        {cards.map((card) => {
          const isFlipped = flippedCardIds.includes(card.id);
          const isMatched = matchedPairIds.has(card.pairId);
          const isHinted = hintedPairId === card.pairId;
          const isFaceUp = isFlipped || isMatched || isHinted;

          return (
            <div
              key={card.id}
              className="memory-card-scene"
              style={{
                aspectRatio: '1 / 1.25',
                minHeight: '80px',
                width: '100%'
              }}
            >
              <div
                className={`memory-card-flipper ${isFaceUp ? 'is-flipped' : ''}`}
                onClick={() => handleCardClick(card)}
                role="button"
                tabIndex={0}
                aria-label={
                  isMatched
                    ? `Carte ${card.symbol.name}, trouvée`
                    : isFaceUp
                    ? `Carte ${card.symbol.name}, découverte`
                    : `Carte cachée rangée ${card.r + 1}, colonne ${card.c + 1}`
                }
              >
                {/* DOS DE LA CARTE (Affiché par défaut) */}
                <div
                  className="card-face card-face-back"
                  style={{
                    background: themeObj.backBg,
                    border: `1.5px solid ${themeObj.backBorder}`,
                    borderLeft: card.isLeftField ? '4px solid #0284c7' : `1.5px solid ${themeObj.backBorder}`,
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isMatched ? 'default' : 'pointer'
                  }}
                >
                  <CardBackPattern theme={themeObj} isLeftField={card.isLeftField} />
                </div>

                {/* FACE DE LA CARTE (Affichée retournée ou trouvée) */}
                <div
                  className="card-face card-face-front"
                  style={{
                    background: isMatched ? themeObj.matchedBg : themeObj.frontBg,
                    border: isMatched
                      ? `2px solid ${themeObj.matchedBorder}`
                      : `1.5px solid ${isHinted ? '#eab308' : themeObj.frontBorder}`,
                    borderLeft: card.isLeftField
                      ? '4px solid #0284c7'
                      : isMatched
                      ? `2px solid ${themeObj.matchedBorder}`
                      : `1.5px solid ${isHinted ? '#eab308' : themeObj.frontBorder}`,
                    boxShadow: isMatched
                      ? '0 2px 6px rgba(16, 185, 129, 0.2)'
                      : '0 4px 10px rgba(0, 0, 0, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 4px',
                    position: 'relative'
                  }}
                >
                  <SymbolIcon
                    name={card.symbol.id}
                    size={cols > 4 ? 30 : 36}
                    color={card.symbol.color}
                  />
                  <span
                    style={{
                      marginTop: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      color: isMatched ? '#166534' : card.symbol.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {card.symbol.name}
                  </span>
                  {isMatched && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '6px',
                        fontSize: '11px',
                        fontWeight: '900',
                        color: '#166534',
                        background: '#dcfce7',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ✓
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boutons d'action */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => initBoard()}
          style={{
            minHeight: '44px',
            padding: '8px 20px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '14px',
            border: '2px solid #0284c7',
            color: '#ffffff',
            background: '#0284c7',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          🔄 Recommencer
        </button>

        {isIntermission && (
          <button
            type="button"
            onClick={() => onIntermissionComplete && onIntermissionComplete(false)}
            style={{
              minHeight: '44px',
              padding: '8px 20px',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              border: '2px solid #dc2626',
              color: '#ffffff',
              background: '#dc2626',
              cursor: 'pointer'
            }}
          >
            Passer ⏭
          </button>
        )}
      </div>

      {/* Boutique de Paires Mémoire */}
      {showCollection && (
        <MemoryPairsCollection
          currentSelections={{
            theme: activeTheme,
            difficulty: difficulty
          }}
          onSelect={(catKey, itemId) => {
            if (catKey === 'theme') {
              updateCustom('theme', itemId);
            } else if (catKey === 'difficulty') {
              handleSelectDifficulty(itemId);
            }
          }}
          onClose={() => setShowCollection(false)}
        />
      )}

      {/* Modal de Victoire Standard */}
      {!isIntermission && isGameWon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #0284c7',
              borderRadius: '20px',
              padding: '28px 24px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <SymbolIcon name="lotus" size={48} color="#db2777" />
            </div>
            <h2 style={{ color: '#0284c7', margin: '0 0 6px 0', fontSize: '1.6rem', fontWeight: '900' }}>
              HARMONIE PARFAITE !
            </h2>
            <p style={{ color: '#334155', fontSize: '0.95rem', margin: '0 0 16px 0', fontWeight: '500' }}>
              {encouragement}
            </p>

            {/* Récapitulatif des performances */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '14px',
                marginBottom: '18px',
                border: '1px solid #cbd5e1'
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Coups</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#b45309' }}>{moves}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Temps</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#15803d' }}>{formatTime(elapsedTime)}</div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Record personnel</div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#0284c7' }}>
                  {bestMoves > 0 ? `${bestMoves} coups` : `${moves} coups`}
                </div>
              </div>
            </div>

            {/* Proposition d'Entracte vers un autre jeu */}
            <IntermissionProposal
              onIntermissionRequest={onIntermissionRequest}
              upcomingIntermission={upcomingIntermission}
              onSelectUpcomingIntermission={onSelectUpcomingIntermission}
              onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
              intermissionConfig={intermissionConfig}
              intermissionGames={intermissionGames}
              excludeGameKey="memory"
              onContinue={() => initBoard()}
              continueText="Nouvelle Partie"
              showDirectContinue={true}
              customStyle={{ marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => initBoard()}
                style={{
                  minHeight: '48px',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '15px',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: '2px solid #0284c7',
                  flex: 1,
                  cursor: 'pointer'
                }}
              >
                Rejouer 🔄
              </button>
              <button
                type="button"
                onClick={onBack}
                style={{
                  minHeight: '48px',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  fontSize: '14px',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  background: '#f1f5f9',
                  cursor: 'pointer'
                }}
              >
                Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
