import { useState, useEffect, useRef, useCallback } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import MemoryPairsCollection, { MEMORY_BACKGROUNDS, MEMORY_CARDS_DATA } from './MemoryPairsCollection';
import SymbolIcon from '../components/SymbolIcon';
import CenteredCardIcon from '../components/CenteredCardIcon';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { shuffle, randomChoice } from '../utils/commonUtils';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';
import { useGameCustomizations } from '../hooks/useGameCustomizations';

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

// Configuration des modes de difficulté & paires supportées
const PAIRS_OPTIONS = [3, 4, 6, 8, 10];

const getGridCols = (count) => {
  if (count <= 3) return 3;
  if (count <= 8) return 4;
  return 5;
};

// Fonction pure de génération de paquet de cartes avec décalages organiques subtils
const generateDeck = (pairsCount = 6, layoutMode = 'organic') => {
  const selectedCards = shuffle([...MEMORY_CARDS_DATA]).slice(0, Math.min(pairsCount, MEMORY_CARDS_DATA.length));
  const deck = [];
  selectedCards.forEach((item) => {
    deck.push({
      id: `${item.id}_1`,
      pairId: item.id,
      cardData: item,
      symbol: item
    });
    deck.push({
      id: `${item.id}_2`,
      pairId: item.id,
      cardData: item,
      symbol: item
    });
  });

  const cols = getGridCols(pairsCount);

  return shuffle(deck).map((card, index) => {
    const r = Math.floor(index / cols);
    const c = index % cols;
    // Micro-rotations & décalages asymétriques pour un rendu naturel et organique (non figé)
    const rotation = layoutMode === 'organic' ? (Math.random() * 5.2 - 2.6).toFixed(1) : 0;
    const tiltX = layoutMode === 'organic' ? (Math.random() * 4 - 2).toFixed(1) : 0;
    const tiltY = layoutMode === 'organic' ? (Math.random() * 4 - 2).toFixed(1) : 0;

    return {
      ...card,
      r,
      c,
      cols,
      rotation,
      tiltX,
      tiltY,
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
    background: 'tatami',
    layout: 'organic',
    cardStyle: 'full'
  });

  const [showCollection, setShowCollection] = useState(false);
  const themeObj = getThemeStyle(activeTheme);

  // Gamme visuelle des cartes : 'full' (Plein Cadre) ou 'centered' (Symbole Centré sur fond transparent)
  const [cardStyle, setCardStyle] = useState(() => {
    return custom.cardStyle || storage.getItem('retrovision_memory_card_style', 'full') || 'full';
  });

  const handleToggleCardStyle = () => {
    const nextStyle = cardStyle === 'full' ? 'centered' : 'full';
    setCardStyle(nextStyle);
    updateCustom('cardStyle', nextStyle);
    storage.setItem('retrovision_memory_card_style', nextStyle);
    sound.playClick();
  };

  // Background personnalisable du plateau
  const [backgroundId, setBackgroundId] = useState(() => {
    return custom.background || storage.getItem('retrovision_memory_bg', 'tatami') || 'tatami';
  });
  const activeBg = MEMORY_BACKGROUNDS.find((b) => b.id === backgroundId) || MEMORY_BACKGROUNDS[0];

  // Style de disposition des cartes (organic avec micro-rotations ou aligné)
  const [layoutStyle, setLayoutStyle] = useState(() => {
    return custom.layout || storage.getItem('retrovision_memory_layout', 'organic') || 'organic';
  });

  // Nombre de paires paramétrable (3, 4, 6, 8, 10 paires)
  const [pairsCount, setPairsCount] = useState(() => {
    if (isIntermission) {
      return Number(intermissionConfig?.memory?.target) || 6;
    }
    return Number(storage.getItem('retrovision_memory_pairs_count', 6)) || 6;
  });

  // Mode Entracte : Jeu à manches
  const targetIntermissionRounds = isIntermission
    ? Number(intermissionConfig?.memory?.roundsCount) || 3
    : 1;
  const [intermissionRound, setIntermissionRound] = useState(1);

  // Écran d'intro avec animation et bouton "JOUER"
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);

  // Cartes du plateau initialisées paresseusement avec micro-rotations et décalages
  const [cards, setCards] = useState(() => generateDeck(pairsCount, layoutStyle));
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
    return storage.getNumber(`retrovision_memory_${pairsCount}p_best`, 0);
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
  const initBoard = useCallback((targetPairsCount = pairsCount, targetLayout = layoutStyle) => {
    setCards(generateDeck(targetPairsCount, targetLayout));
    setFlippedCardIds([]);
    setMatchedPairIds(new Set());
    setIsLocked(false);
    setHintedPairId(null);
    setMoves(0);
    setElapsedTime(0);
    setIsTimerRunning(false);
    setIsGameWon(false);
  }, [pairsCount, layoutStyle]);

  const handleSelectPairsCount = (newCount) => {
    if (newCount === pairsCount) return;
    setPairsCount(newCount);
    storage.setItem('retrovision_memory_pairs_count', newCount.toString());
    sound.playClick();
    initBoard(newCount, layoutStyle);
    setBestMoves(storage.getNumber(`retrovision_memory_${newCount}p_best`, 0));
  };

  const handleSelectBackground = (bgId) => {
    setBackgroundId(bgId);
    updateCustom('background', bgId);
    storage.setItem('retrovision_memory_bg', bgId);
    sound.playClick();
  };

  const handleToggleLayout = () => {
    const nextLayout = layoutStyle === 'organic' ? 'grid' : 'organic';
    setLayoutStyle(nextLayout);
    updateCustom('layout', nextLayout);
    storage.setItem('retrovision_memory_layout', nextLayout);
    sound.playClick();
    initBoard(pairsCount, nextLayout);
  };

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
    setIsTimerRunning(false);
    sound.playChapterVictory?.() || sound.playScore?.();
    haptic.success();
    setEncouragement(randomChoice(ZEN_ENCOURAGEMENTS));

    const currentBest = storage.getNumber(`retrovision_memory_${pairsCount}p_best`, 0);
    const newBest = currentBest === 0 ? moves + 1 : Math.min(currentBest, moves + 1);
    storage.setItem(`retrovision_memory_${pairsCount}p_best`, newBest);
    setBestMoves(newBest);

    if (onScoreSave) {
      onScoreSave(100);
    }

    if (isIntermission && intermissionRound < targetIntermissionRounds) {
      // Avancer à la manche suivante de l'entracte
      setTimeout(() => {
        setIntermissionRound((r) => r + 1);
        initBoard(pairsCount, layoutStyle);
      }, 1000);
    } else {
      setIsGameWon(true);
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

  const cols = getGridCols(pairsCount);
  const roundFraction = pairsCount > 0 ? matchedPairIds.size / pairsCount : 0;
  const totalIntermissionProgress = isIntermission
    ? (intermissionRound - 1 + roundFraction) / targetIntermissionRounds
    : roundFraction;

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
        color: activeBg?.textColor || themeObj.textColor,
        background: activeBg?.boardBg || themeObj.boardBg,
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
          instructionText={
            targetIntermissionRounds > 1
              ? `Manche ${intermissionRound} / ${targetIntermissionRounds} : Associez les ${pairsCount} paires !`
              : `Associez les ${pairsCount} paires cachées pour réussir l'entracte !`
          }
          onRestart={() => initBoard()}
          onOtherGame={onIntermissionRequest}
          onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
          replaySame={replaySameIntermission}
          onToggleReplaySame={onToggleReplaySameIntermission}
          progress={totalIntermissionProgress}
        />
      ) : (
        <GameHeader
          title="PAIRES MÉMOIRE"
          subtitle="Association & mémoire zen"
          onBack={handleBackWithConfirm}
          onRestart={() => initBoard()}
          showShop={true}
          onShop={() => setShowCollection(true)}
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
          maxWidth: pairsCount > 6 ? '620px' : '540px',
          flexWrap: 'wrap',
          gap: '10px',
          margin: '12px 0 16px 0',
          padding: '10px 16px',
          background: activeBg?.barBg || themeObj.barBg,
          borderRadius: '14px',
          border: `1.5px solid ${activeBg?.barBorder || themeObj.barBorder}`,
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}
      >
        {/* Sélecteur de paires (hors entracte) ou Badge de manche (entracte) */}
        {!isIntermission ? (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {PAIRS_OPTIONS.map((count) => {
              const isActive = pairsCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleSelectPairsCount(count)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    minHeight: '38px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: isActive ? '#0284c7' : 'rgba(255,255,255,0.3)',
                    border: isActive ? '2px solid #0284c7' : '1px solid rgba(0,0,0,0.15)',
                    color: isActive ? '#ffffff' : activeBg?.textColor || themeObj.textColor,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {count} Paires
                </button>
              );
            })}
            <button
              type="button"
              onClick={handleToggleCardStyle}
              title="Changer le style visuel : Plein Cadre ou Symbole Centré"
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                minHeight: '38px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.25)',
                border: '1px solid rgba(0,0,0,0.15)',
                color: activeBg?.textColor || themeObj.textColor,
                transition: 'all 0.15s ease'
              }}
            >
              {cardStyle === 'full' ? '🖼️ Plein Cadre' : '🎴 Symbole Centré'}
            </button>
            <button
              type="button"
              onClick={handleToggleLayout}
              title="Alterner disposition organique ou grille stricte"
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                minHeight: '38px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.25)',
                border: '1px solid rgba(0,0,0,0.15)',
                color: activeBg?.textColor || themeObj.textColor
              }}
            >
              {layoutStyle === 'organic' ? '🍃 Organique' : '📐 Grille'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '800',
                letterSpacing: '0.04em',
                color: '#0284c7',
                background: 'rgba(2, 132, 199, 0.12)',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid rgba(2, 132, 199, 0.3)'
              }}
            >
              Manche {intermissionRound} / {targetIntermissionRounds} ({pairsCount} paires)
            </span>
            <button
              type="button"
              onClick={handleToggleCardStyle}
              title="Alterner style visuel des cartes"
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                minHeight: '34px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(0,0,0,0.15)',
                color: activeBg?.textColor || themeObj.textColor
              }}
            >
              {cardStyle === 'full' ? '🖼️' : '🎴'}
            </button>
            <button
              type="button"
              onClick={handleToggleLayout}
              title="Alterner disposition"
              style={{
                padding: '6px 10px',
                fontSize: '12px',
                minHeight: '34px',
                borderRadius: '8px',
                fontWeight: '700',
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(0,0,0,0.15)',
                color: activeBg?.textColor || themeObj.textColor
              }}
            >
              {layoutStyle === 'organic' ? '🍃' : '📐'}
            </button>
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

      {/* Grille de cartes 3D avec thème actif & disposition personnalisable */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: pairsCount > 6 ? '10px' : '12px',
          width: '100%',
          maxWidth: pairsCount > 6 ? '620px' : '540px',
          margin: '0 auto 20px auto',
          boxSizing: 'border-box'
        }}
      >
        {cards.map((card) => {
          const isFlipped = flippedCardIds.includes(card.id);
          const isMatched = matchedPairIds.has(card.pairId);
          const isHinted = hintedPairId === card.pairId;
          const isFaceUp = isFlipped || isMatched || isHinted;
          const cardInfo = card.cardData || card.symbol;
          const cardTransform = layoutStyle === 'organic' && !isMatched
            ? `rotate(${card.rotation}deg) translate(${card.tiltX}px, ${card.tiltY}px)`
            : 'none';

          return (
            <div
              key={card.id}
              className="memory-card-scene"
              style={{
                aspectRatio: '1 / 1.25',
                minHeight: '80px',
                width: '100%',
                transform: cardTransform,
                transition: 'transform 0.25s ease'
              }}
            >
              <div
                className={`memory-card-flipper ${isFaceUp ? 'is-flipped' : ''}`}
                onClick={() => handleCardClick(card)}
                role="button"
                tabIndex={0}
                aria-label={
                  isMatched
                    ? `Carte ${cardInfo.name}, trouvée`
                    : isFaceUp
                    ? `Carte ${cardInfo.name}, découverte`
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
                    background: cardStyle === 'full'
                      ? '#0f172a'
                      : isMatched
                      ? themeObj.matchedBg
                      : themeObj.frontBg,
                    border: isMatched
                      ? `2.5px solid ${themeObj.matchedBorder || '#10b981'}`
                      : `2px solid ${isHinted ? '#eab308' : cardStyle === 'full' ? 'rgba(212, 175, 55, 0.7)' : themeObj.frontBorder}`,
                    borderLeft: card.isLeftField
                      ? '4px solid #0284c7'
                      : isMatched
                      ? `2.5px solid ${themeObj.matchedBorder || '#10b981'}`
                      : `2px solid ${isHinted ? '#eab308' : cardStyle === 'full' ? 'rgba(212, 175, 55, 0.7)' : themeObj.frontBorder}`,
                    boxShadow: isMatched
                      ? '0 4px 14px rgba(16, 185, 129, 0.35)'
                      : '0 6px 14px rgba(0, 0, 0, 0.15)',
                    overflow: 'hidden',
                    position: 'relative',
                    userSelect: 'none'
                  }}
                >
                  {cardStyle === 'full' ? (
                    /* GAMME 1 : PLEIN CADRE (L'image prend tout l'espace d'une carte) */
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <img
                        src={cardInfo.imageFull}
                        alt={cardInfo.name}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                      {/* Bandeau inférieur transparent sombre avec titre net */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.55) 65%, transparent 100%)',
                          padding: '12px 4px 5px 4px',
                          textAlign: 'center'
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '900',
                            color: '#ffffff',
                            textShadow: '0 1px 4px rgba(0,0,0,0.95)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em'
                          }}
                        >
                          {cardInfo.name}
                        </span>
                      </div>
                      {/* Marqueur de paire trouvée */}
                      {isMatched && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '12px',
                            fontWeight: '900',
                            color: '#ffffff',
                            background: '#16a34a',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                            border: '1.5px solid #ffffff'
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
                  ) : (
                    /* GAMME 2 : SYMBOLE CENTRÉ (Grand motif lumineux au centre, fond 100% transparent) */
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        padding: '8px 4px',
                        position: 'relative'
                      }}
                    >
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <CenteredCardIcon
                          name={cardInfo.id}
                          size={cols > 4 ? 48 : 60}
                          color={cardInfo.color}
                        />
                      </div>
                      <span
                        style={{
                          marginTop: '2px',
                          fontSize: '11px',
                          fontWeight: '800',
                          color: isMatched ? '#166534' : themeObj.textColor,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {cardInfo.name}
                      </span>
                      {isMatched && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            fontSize: '12px',
                            fontWeight: '900',
                            color: '#166534',
                            background: '#dcfce7',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #16a34a'
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </div>
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
            cardStyle: cardStyle,
            pairs: String(pairsCount),
            background: backgroundId,
            layout: layoutStyle,
            theme: activeTheme
          }}
          onSelect={(catKey, itemId) => {
            if (catKey === 'cardStyle') {
              setCardStyle(itemId);
              updateCustom('cardStyle', itemId);
              storage.setItem('retrovision_memory_card_style', itemId);
            } else if (catKey === 'pairs') {
              handleSelectPairsCount(Number(itemId));
            } else if (catKey === 'background') {
              handleSelectBackground(itemId);
            } else if (catKey === 'layout') {
              setLayoutStyle(itemId);
              updateCustom('layout', itemId);
              storage.setItem('retrovision_memory_layout', itemId);
              initBoard(pairsCount, itemId);
            } else if (catKey === 'theme') {
              updateCustom('theme', itemId);
            }
          }}
          onClose={() => setShowCollection(false)}
        />
      )}

      {/* Unified Victory Overlay */}
      <GameVictoryOverlay
        isOpen={isGameWon}
        gameKey="memory"
        score={Math.max(1000 - moves * 10, 100)}
        title="HARMONIE PARFAITE !"
        badgeIcon="🌸"
        subtitle={encouragement || 'Toutes les paires ont été retrouvées avec sérénité.'}
        stats={[
          { label: 'Coups', value: moves, color: '#f59e0b' },
          { label: 'Temps', value: formatTime(elapsedTime), color: '#10b981' },
          ...(bestMoves > 0 ? [{ label: 'Record', value: `${bestMoves} coups`, color: '#38bdf8' }] : [])
        ]}
        onRestart={() => initBoard()}
        restartText="🔄 Rejouer"
        onContinue={() => initBoard()}
        continueText="Nouvelle Partie"
        onBack={onBack}
        backText="← Retour au Hub"
        isIntermission={isIntermission}
        onIntermissionComplete={onIntermissionComplete}
        onIntermissionRequest={onIntermissionRequest}
        upcomingIntermission={upcomingIntermission}
        onSelectUpcomingIntermission={onSelectUpcomingIntermission}
        onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
        intermissionConfig={intermissionConfig}
        intermissionGames={intermissionGames}
      />
    </div>
  );
}
