import { useState, useEffect, useRef, useCallback } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { shuffle, randomChoice } from '../utils/commonUtils';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';

// Bibliothèque de 10 symboles zen - Style clair sobre inspiré du Mahjong Zen (pigments naturels)
const ZEN_SYMBOLS = [
  { id: 'sakura', icon: '🌸', name: 'Cerisier', color: '#9d174d' },
  { id: 'dragon', icon: '🐉', name: 'Dragon', color: '#166534' },
  { id: 'koi', icon: '🎏', name: 'Carpe Koï', color: '#9a3412' },
  { id: 'bamboo', icon: '🎋', name: 'Bambou', color: '#14532d' },
  { id: 'moon', icon: '🌙', name: 'Lune Zen', color: '#854d0e' },
  { id: 'crystal', icon: '💎', name: 'Cristal', color: '#075985' },
  { id: 'lantern', icon: '🏮', name: 'Lanterne', color: '#991b1b' },
  { id: 'butterfly', icon: '🦋', name: 'Papillon', color: '#581c87' },
  { id: 'clover', icon: '🍀', name: 'Trèfle', color: '#064e3b' },
  { id: 'sun', icon: '☀️', name: 'Soleil', color: '#78350f' }
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

  // Écran d'intro avec animation et bouton "JOUER"
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);

  // Niveau de difficulté
  const [difficulty, setDifficulty] = useState(() => {
    if (isIntermission) {
      if (intermissionDifficulty === 'difficile') return 'difficile';
      if (intermissionDifficulty === 'moyen') return 'moyen';
      return 'facile';
    }
    return storage.getItem('retrovision_memory_diff', 'moyen') || 'moyen';
  });

  const currentConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.moyen;
  const { pairsCount, cols } = currentConfig;

  // Cartes du plateau initialisées paresseusement
  const [cards, setCards] = useState(() => generateDeck(currentConfig.pairsCount, currentConfig.cols));
  // Cartes actuellement retournées (IDs, max 2)
  const [flippedCardIds, setFlippedCardIds] = useState([]);
  // Paires trouvées (IDs des symboles)
  const [matchedPairIds, setMatchedPairIds] = useState(() => new Set());
  // Verrouillage des clics pendant l'animation de vérification
  const [isLocked, setIsLocked] = useState(false);
  // Paires mises en surbrillance par l'indice
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

  // Chronomètre fluide
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
    if (matchedPairIds.has(card.pairId)) return; // Déjà trouvée
    if (flippedCardIds.includes(card.id)) return; // Déjà retournée ce tour-ci

    // Démarrer le chronomètre au 1er clic
    if (!isTimerRunning && moves === 0) {
      setIsTimerRunning(true);
    }

    // Audio & Haptique discrets
    haptic.tap();
    if (card.isLeftField) {
      sound.playPentatonicNote(3, true, 0.25);
    } else {
      sound.playClick();
    }

    const newFlipped = [...flippedCardIds, card.id];
    setFlippedCardIds(newFlipped);

    // Si deux cartes sont retournées, vérifier la paire
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

            // Victoire si toutes les paires sont trouvées
            if (nextSet.size === pairsCount) {
              handleGameWin();
            }
            return nextSet;
          });

          setFlippedCardIds([]);
          setIsLocked(false);
        }, 450);
      } else {
        // Paire non correspondante : retournement après délai
        setTimeout(() => {
          haptic.warning();
          sound.playPentatonicNote(0, false, 0.15);
          setFlippedCardIds([]);
          setIsLocked(false);
        }, 850);
      }
    }
  };

  // Gestion de la victoire
  const handleGameWin = () => {
    setIsGameWon(true);
    setIsTimerRunning(false);
    sound.playChapterVictory();
    haptic.success();
    setEncouragement(randomChoice(ZEN_ENCOURAGEMENTS));

    // Sauvegarde meilleur score (moins de coups = meilleur)
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

  // Indice Zen (révèle brièvement une paire non trouvée)
  const handleUseHint = () => {
    if (isLocked || isGameWon) return;

    // Trouver les paires non encore découvertes
    const remainingCards = cards.filter((c) => !matchedPairIds.has(c.pairId));
    if (remainingCards.length === 0) return;

    // Privilégier une paire ayant une carte à gauche pour stimuler le balayage visuel gauche
    let candidate = remainingCards.find((c) => c.isLeftField);
    if (!candidate) {
      candidate = randomChoice(remainingCards);
    }

    const pairToReveal = candidate.pairId;
    setHintedPairId(pairToReveal);
    sound.playPowerup();
    haptic.tap();

    // Effet visuel temporaire pendant 1.5s
    setTimeout(() => {
      setHintedPairId(null);
    }, 1500);
  };

  // Changement de difficulté (en mode standard)
  const handleSelectDifficulty = (newDiff) => {
    if (newDiff === difficulty) return;
    setDifficulty(newDiff);
    storage.setItem('retrovision_memory_diff', newDiff);
    sound.playClick();
    const newCfg = DIFFICULTY_CONFIG[newDiff] || DIFFICULTY_CONFIG.moyen;
    initBoard(newCfg.pairsCount, newCfg.cols);
    setBestMoves(storage.getNumber(`retrovision_memory_${newDiff}_best`, 0));
  };

  // Quitter avec confirmation si partie entamée
  const handleBackWithConfirm = async () => {
    if (moves > 0 && !isGameWon) {
      const ok = await confirm({
        title: 'Quitter la partie ?',
        message: 'Une partie de Mémoire Zen est en cours. Vos coups actuels ne seront pas enregistrés.',
        confirmText: 'Quitter',
        cancelText: 'Continuer',
        confirmVariant: 'danger'
      });
      if (!ok) return;
    }
    onBack();
  };

  // Formatage du temps mm:ss
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
        color: '#0f172a',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        position: 'relative'
      }}
    >
      {/* Animation d'Intro avec bouton "JOUER" */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Paires Mémoire"
          icon="🎴"
          colors={['#0284c7', '#059669', '#d97706']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Repère d'ancrage visuel gauche (Héminégligence) - Ligne solide sobre bleu médical */}
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

      {/* En-tête : Intermission (Standardisé avec toutes les options) ou Standard */}
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
          showShop={false}
          onLaunchIntermission={onLaunchIntermission}
        />
      )}

      {/* Barre de contrôles et statistiques claire (Style Mahjong Zen en blanc cassé) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          flexWrap: 'wrap',
          gap: '10px',
          margin: '12px 0 16px 0',
          padding: '12px 16px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
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
                    padding: '8px 14px',
                    fontSize: '13px',
                    minHeight: '44px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    background: isActive ? '#0284c7' : '#f1f5f9',
                    border: isActive ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    color: isActive ? '#ffffff' : '#334155'
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

        {/* Compteurs clairs : Paires, Coups, Temps */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '14px', fontWeight: '600' }}>
          <div>
            <span style={{ color: '#64748b', marginRight: '4px' }}>Paires :</span>
            <span style={{ color: '#0284c7', fontWeight: '800' }}>
              {matchedPairIds.size} / {pairsCount}
            </span>
          </div>
          <div>
            <span style={{ color: '#64748b', marginRight: '4px' }}>Coups :</span>
            <span style={{ color: '#d97706', fontWeight: '800' }}>{moves}</span>
          </div>
          <div>
            <span style={{ color: '#64748b', marginRight: '4px' }}>Temps :</span>
            <span style={{ color: '#16a34a', fontWeight: '800' }}>{formatTime(elapsedTime)}</span>
          </div>
        </div>

        {/* Bouton Indice Zen clair */}
        <button
          type="button"
          onClick={handleUseHint}
          disabled={isLocked || isGameWon}
          title="Révéler brièvement une paire"
          aria-label="Révéler un indice zen"
          style={{
            minHeight: '44px',
            padding: '8px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            background: '#fffbeb',
            border: '2px solid #ca8a04',
            color: '#b45309',
            cursor: isLocked || isGameWon ? 'not-allowed' : 'pointer',
            opacity: isLocked || isGameWon ? 0.4 : 1
          }}
        >
          💡 Indice Zen
        </button>
      </div>

      {/* Grille de cartes sobres & claires (Style Tuiles Mahjong Zen en ivoire/blanc cassé) */}
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

          // Palette claire sobre inspirée des tuiles de Mahjong
          let cardBg = '#ffffff';
          let cardBorder = '#cbd5e1';
          let tileShadow = '0 1px 0 #cbd5e1, 0 2px 0 #b8c2cc, 0 3px 0 #94a3b8, 0 5px 6px rgba(0,0,0,0.08)';

          if (isMatched) {
            cardBg = '#f0fdf4';
            cardBorder = '#86efac';
            tileShadow = '0 1px 0 #86efac, 0 2px 0 #4ade80, 0 3px 4px rgba(34, 197, 94, 0.15)';
          } else if (isFaceUp) {
            cardBg = '#ffffff';
            cardBorder = isHinted ? '#eab308' : '#94a3b8';
            tileShadow = '0 1px 0 #cbd5e1, 0 2px 0 #94a3b8, 0 4px 8px rgba(0,0,0,0.12)';
          } else if (card.isLeftField) {
            cardBg = '#fafaf9';
            cardBorder = '#cbd5e1';
            tileShadow = '0 1px 0 #cbd5e1, 0 2px 0 #b8c2cc, 0 3px 0 #0284c7, 0 4px 0 #0369a1, 0 5px 6px rgba(0,0,0,0.12)';
          }

          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(card)}
              disabled={isLocked || isMatched}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                aspectRatio: '1 / 1.15',
                minHeight: '76px',
                padding: '8px 4px',
                borderRadius: '10px',
                border: `1.5px ${isHinted ? 'dashed' : 'solid'} ${cardBorder}`,
                borderLeft: card.isLeftField ? '4px solid #0284c7' : `1.5px ${isHinted ? 'dashed' : 'solid'} ${cardBorder}`,
                background: cardBg,
                color: '#0f172a',
                cursor: isMatched ? 'default' : 'pointer',
                position: 'relative',
                outline: 'none',
                userSelect: 'none',
                boxSizing: 'border-box',
                boxShadow: tileShadow,
                transition: 'transform 0.1s ease, box-shadow 0.1s ease, background-color 0.15s ease'
              }}
              aria-label={
                isMatched
                  ? `Carte ${card.symbol.name}, trouvée`
                  : isFaceUp
                  ? `Carte ${card.symbol.name}, découverte`
                  : `Carte cachée rangée ${card.r + 1}, colonne ${card.c + 1}`
              }
            >
              {isFaceUp || isMatched ? (
                <>
                  <span style={{ fontSize: '32px', lineHeight: '1', marginBottom: '6px' }}>
                    {card.symbol.icon}
                  </span>
                  <span
                    style={{
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
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span
                    style={{
                      fontSize: '24px',
                      opacity: 0.6,
                      userSelect: 'none'
                    }}
                  >
                    🀄
                  </span>
                  {card.isLeftField && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '5px',
                        left: '5px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#0284c7'
                      }}
                      title="Repère gauche"
                    />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Boutons d'action clairs */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', width: '100%', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => initBoard()}
          style={{
            minHeight: '48px',
            padding: '10px 24px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '14px',
            border: '2px solid #0284c7',
            color: '#ffffff',
            background: '#0284c7',
            cursor: 'pointer'
          }}
        >
          🔄 Recommencer
        </button>

        {isIntermission && (
          <button
            type="button"
            onClick={() => onIntermissionComplete && onIntermissionComplete(false)}
            style={{
              minHeight: '48px',
              padding: '10px 24px',
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

      {/* Modal de Victoire Standard (Sobre & Claire) */}
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
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🌸</div>
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
