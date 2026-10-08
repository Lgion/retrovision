import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import SymbolIcon from '../components/SymbolIcon';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { shuffle, randomChoice } from '../utils/commonUtils';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';
import { getGameConfig, updateGameConfig } from '../utils/config';
import SymbolQuestCollection from './SymbolQuestCollection';

// Bibliothèque de symboles zen à haute lisibilité visuelle (SVG)
const SYMBOLS = [
  { id: 'lotus', name: 'Lotus', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', border: '#f472b6' },
  { id: 'leaf', name: 'Feuille Zen', color: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399' },
  { id: 'moon', name: 'Croissant de Lune', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24' },
  { id: 'crystal', name: 'Cristal Céleste', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8' },
  { id: 'sakura', name: 'Fleur de Cerisier', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)', border: '#fb7185' },
  { id: 'star', name: 'Étoile Céleste', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: '#facc15' },
  { id: 'bamboo', name: 'Bambou', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: '#4ade80' },
  { id: 'stone', name: 'Galet Zen', color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.15)', border: '#cbd5e1' }
];

// Mots doux de félicitations spécifiques au balayage visuel
const ENCOURAGING_WORDS = [
  "Votre regard balaie l'espace avec une magnifique précision.",
  "Chaque symbole découvert renforce vos repères visuels.",
  "La concentration et le calme vous mènent à la réussite.",
  "Prenez le temps d'apprécier cette belle clarté d'esprit.",
  "Votre attention gauche s'éveille et grandit à chaque pas.",
  "Un balayage méthodique et serein, bravo pour cette harmonie !",
  "La régularité de votre observation ouvre chaque jour de nouvelles voies."
];

// Configuration des 15 niveaux calibrés (Test de barrage progressif)
const LEVELS_CONFIG = [
  // Pack 1 : Sérénité Simple (4x4, 1 cible, 5 cibles au total, 3 à gauche)
  { id: 1, rows: 4, cols: 4, targetIds: ['lotus'], targetCount: 5, pack: 'Sérénité Simple' },
  { id: 2, rows: 4, cols: 4, targetIds: ['crystal'], targetCount: 5, pack: 'Sérénité Simple' },
  { id: 3, rows: 4, cols: 4, targetIds: ['moon'], targetCount: 5, pack: 'Sérénité Simple' },
  { id: 4, rows: 4, cols: 4, targetIds: ['leaf'], targetCount: 6, pack: 'Sérénité Simple' },
  { id: 5, rows: 4, cols: 4, targetIds: ['star'], targetCount: 6, pack: 'Sérénité Simple' },

  // Pack 2 : Double Harmonie (4x5, 2 cibles, 7 cibles au total, 4 à gauche)
  { id: 6, rows: 4, cols: 5, targetIds: ['lotus', 'leaf'], targetCount: 7, pack: 'Double Harmonie' },
  { id: 7, rows: 4, cols: 5, targetIds: ['crystal', 'moon'], targetCount: 7, pack: 'Double Harmonie' },
  { id: 8, rows: 4, cols: 5, targetIds: ['sakura', 'star'], targetCount: 7, pack: 'Double Harmonie' },
  { id: 9, rows: 4, cols: 5, targetIds: ['bamboo', 'stone'], targetCount: 8, pack: 'Double Harmonie' },
  { id: 10, rows: 4, cols: 5, targetIds: ['lotus', 'crystal'], targetCount: 8, pack: 'Double Harmonie' },

  // Pack 3 : Jardin Secret (5x5, 2 cibles, 8 cibles au total, 5 à gauche)
  { id: 11, rows: 5, cols: 5, targetIds: ['moon', 'star'], targetCount: 8, pack: 'Jardin Secret' },
  { id: 12, rows: 5, cols: 5, targetIds: ['sakura', 'leaf'], targetCount: 8, pack: 'Jardin Secret' },
  { id: 13, rows: 5, cols: 5, targetIds: ['bamboo', 'crystal'], targetCount: 9, pack: 'Jardin Secret' },
  { id: 14, rows: 5, cols: 5, targetIds: ['lotus', 'moon'], targetCount: 9, pack: 'Jardin Secret' },
  { id: 15, rows: 5, cols: 5, targetIds: ['crystal', 'star'], targetCount: 10, pack: 'Jardin Secret' }
];

export default function SymbolQuest({
  onBack,
  onScoreSave,
  onLaunchIntermission,
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
  intermissionGames
}) {
  const confirm = useConfirm();
  const [showCollection, setShowCollection] = useState(false);
  const [themeId, setThemeId] = useState(() => getGameConfig('symbolquest', 'theme', 'zen_garden'));

  // Niveau sélectionné
  const [levelIndex, setLevelIndex] = useState(() => {
    if (isIntermission) {
      return intermissionDifficulty === 'difficile' ? 5 : 0;
    }
    const saved = storage.getNumber('retrovision_symbolquest_level', 0);
    return Math.min(Math.max(0, saved), LEVELS_CONFIG.length - 1);
  });

  const currentLevel = LEVELS_CONFIG[levelIndex % LEVELS_CONFIG.length];
  const { rows, cols, targetIds, targetCount, pack } = currentLevel;

  // Grille générée : tableau 2D de cellules { id, symbolId, isTarget, found, r, c }
  const [grid, setGrid] = useState([]);
  // ID de la cellule actuellement suggérée par l'indice
  const [hintCellId, setHintCellId] = useState(null);
  // Écran de victoire de niveau
  const [levelWon, setLevelWon] = useState(false);

  // Synthèse Web Audio centralisée
  const playChimeNote = useCallback((step = 0, isLeft = false) => {
    sound.playPentatonicNote(step, isLeft);
  }, []);

  // Génération du tableau avec pondération gauche (60% cibles à gauche)
  const generateBoard = useCallback(() => {
    const totalCells = rows * cols;
    const midCol = Math.floor(cols / 2);

    // Diviser les positions en gauche et droite
    const leftPositions = [];
    const rightPositions = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (c < midCol) {
          leftPositions.push([r, c]);
        } else {
          rightPositions.push([r, c]);
        }
      }
    }

    // Mélange équitable avec Knuth / Fisher-Yates (DRY)
    const shuffledLeft = shuffle(leftPositions);
    const shuffledRight = shuffle(rightPositions);

    // Répartition : ~60% cibles à gauche
    const leftTargetQuota = Math.min(shuffledLeft.length, Math.ceil(targetCount * 0.6));
    const rightTargetQuota = targetCount - leftTargetQuota;

    const chosenTargetCoords = new Set();

    for (let i = 0; i < leftTargetQuota; i++) {
      const [r, c] = shuffledLeft[i];
      chosenTargetCoords.add(`${r},${c}`);
    }
    for (let i = 0; i < rightTargetQuota && i < shuffledRight.length; i++) {
      const [r, c] = shuffledRight[i];
      chosenTargetCoords.add(`${r},${c}`);
    }

    // Symboles distracteurs disponibles (tous sauf les cibles)
    const distractorSymbols = SYMBOLS.filter((s) => !targetIds.includes(s.id));

    // Construction de la grille
    const newGrid = [];
    let cellCounter = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isTarget = chosenTargetCoords.has(`${r},${c}`);
        let symbol;

        if (isTarget) {
          // Choix aléatoire uniforme parmi les cibles valides
          const chosenTargetId = randomChoice(targetIds);
          symbol = SYMBOLS.find((s) => s.id === chosenTargetId);
        } else {
          symbol = randomChoice(distractorSymbols);
        }

        newGrid.push({
          id: `cell-${r}-${c}-${cellCounter++}`,
          r,
          c,
          symbol,
          isTarget,
          found: false,
          isLeft: c < midCol
        });
      }
    }

    setGrid(newGrid);
    setHintCellId(null);
    setLevelWon(false);
  }, [rows, cols, targetIds, targetCount]);

  // Régénérer lors du changement de niveau
  useEffect(() => {
    generateBoard();
  }, [generateBoard]);

  // Cibles trouvées
  const foundTargets = useMemo(() => {
    return grid.filter((c) => c.isTarget && c.found);
  }, [grid]);

  // Cibles restantes à trouver dans la moitié gauche (pour pulser l'ancre visuelle)
  const hasUnfoundLeftTargets = useMemo(() => {
    return grid.some((c) => c.isTarget && !c.found && c.isLeft);
  }, [grid]);

  // Cibles définies comme objets complets
  const targetSymbolObjects = useMemo(() => {
    return targetIds.map((id) => SYMBOLS.find((s) => s.id === id)).filter(Boolean);
  }, [targetIds]);

  // Gestion du tap sur une cellule
  const handleCellClick = (cell) => {
    if (cell.found || levelWon) return;

    if (cell.isTarget) {
      // CIBLE TROUVÉE !
      const nextFoundCount = foundTargets.length + 1;
      playChimeNote(nextFoundCount, cell.isLeft);

      if (cell.isLeft) {
        haptic.success(); // Double vibration valorisante pour la gauche
      } else {
        haptic.tap();
      }

      // Marquer comme trouvée
      const updatedGrid = grid.map((c) => (c.id === cell.id ? { ...c, found: true } : c));
      setGrid(updatedGrid);

      // Si c'était la case de l'indice, effacer l'indice
      if (hintCellId === cell.id) {
        setHintCellId(null);
      }

      // Vérifier si toutes les cibles du niveau sont découvertes
      if (nextFoundCount >= targetCount) {
        sound.playWin?.();
        haptic.success();
        setLevelWon(true);

        const nextHigh = Math.max(levelIndex + 1, storage.getNumber('retrovision_symbolquest_highscore', 0));
        storage.setItem('retrovision_symbolquest_highscore', nextHigh.toString());
        if (onScoreSave) onScoreSave('symbolquest', nextHigh);
      }
    } else {
      // Distracteur touché : son feutré sans pénalité (esprit bienveillant)
      sound.playClick();
      haptic.gentle();
    }
  };

  // Indice bienveillant : révèle doucement une cible restante (en priorité à gauche)
  const handleUseHint = () => {
    sound.playClick();
    haptic.tap();

    const unfound = grid.filter((c) => c.isTarget && !c.found);
    if (unfound.length === 0) return;

    // Priorité à gauche pour stimuler l'exploration de l'espace négligé
    const leftUnfound = unfound.filter((c) => c.isLeft);
    const chosen = leftUnfound.length > 0 ? randomChoice(leftUnfound) : randomChoice(unfound);

    setHintCellId(chosen.id);

    // Retirer la surbrillance après 3 secondes
    setTimeout(() => {
      setHintCellId((current) => (current === chosen.id ? null : current));
    }, 3000);
  };

  // Passer au niveau suivant
  const handleNextLevel = () => {
    sound.playClick();
    haptic.tap();
    const nextIdx = (levelIndex + 1) % LEVELS_CONFIG.length;
    setLevelIndex(nextIdx);
    storage.setItem('retrovision_symbolquest_level', nextIdx.toString());
  };

  // Sortie avec confirmation si des cibles ont déjà été trouvées
  const handleBackWithConfirm = async () => {
    if (foundTargets.length > 0 && !levelWon) {
      const ok = await confirm({
        title: 'Quitter la Quête ?',
        message: 'Voulez-vous vraiment quitter ce tableau de recherche en cours ?',
        confirmText: 'Oui, quitter',
        cancelText: 'Poursuivre la recherche',
        confirmVariant: 'danger'
      });
      if (ok) onBack();
    } else {
      onBack();
    }
  };

  const encouragingMessage = useMemo(() => {
    return ENCOURAGING_WORDS[levelIndex % ENCOURAGING_WORDS.length];
  }, [levelIndex]);

  return (
    <div
      className="symbolquest-container"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 20%, #0d1b2a 0%, #060d17 100%)',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
        fontFamily: "'Outfit', -apple-system, sans-serif"
      }}
    >
      <style>{`
        @keyframes left-guide-pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
        @keyframes hint-glow {
          0%, 100% { transform: scale(1); border-color: #fbbf24; }
          50% { transform: scale(1.06); border-color: #fef08a; }
        }
        @keyframes found-pop {
          0% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .symbol-cell {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          touch-action: manipulation;
          transition: all 0.18s ease;
          min-width: 52px;
          min-height: 52px;
        }
        .symbol-cell:active {
          transform: scale(0.95);
          background: rgba(255, 255, 255, 0.1);
        }
        .symbol-cell-found {
          background: rgba(16, 185, 129, 0.18) !important;
          border: 2px solid #10b981 !important;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          animation: found-pop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .symbol-cell-hint {
          animation: hint-glow 1.2s ease-in-out infinite !important;
        }
        .left-guide-bar {
          position: absolute;
          left: 0;
          top: 75px;
          bottom: 25px;
          width: 5px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, rgba(16,185,129,0.2) 0%, rgba(16,185,129,0.95) 50%, rgba(16,185,129,0.2) 100%);
          z-index: 15;
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .left-guide-active {
          animation: left-guide-pulse 1.4s ease-in-out infinite;
          width: 8px;
        }
      `}</style>

      {showCollection && (
        <SymbolQuestCollection
          currentSelections={{
            pack: levelIndex >= 10 ? 10 : levelIndex >= 5 ? 5 : 0,
            theme: themeId
          }}
          onSelect={(catKey, itemId) => {
            if (catKey === 'theme') {
              setThemeId(itemId);
              updateGameConfig('symbolquest', 'theme', itemId);
            } else if (catKey === 'pack') {
              setLevelIndex(Number(itemId));
              setLevelWon(false);
            }
          }}
          onClose={() => setShowCollection(false)}
        />
      )}

      {/* Header Unifié ou Header Entracte */}
      {isIntermission ? (
        <div style={{ width: '100%', marginBottom: '6px', zIndex: 10, flexShrink: 0, padding: '0 8px', boxSizing: 'border-box' }}>
          <IntermissionHeader
            instructionText="Trouvez tous les symboles cibles pour retourner au jeu principal."
            onRestart={() => {
              setGrid(prev => prev.map(row => row.map(cell => ({ ...cell, found: false }))));
              setHintCellId(null);
              setLevelWon(false);
            }}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={targetCount > 0 ? foundTargets.length / targetCount : 0}
          />
        </div>
      ) : (
        <GameHeader
          title="QUÊTE DES SYMBOLES"
          gameId="symbolquest"
          onBack={handleBackWithConfirm}
          onLaunchIntermission={onLaunchIntermission || onIntermissionRequest}
          onShop={() => setShowCollection(true)}
          showShop={true}
          centerContent={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <span style={{ fontSize: '1rem' }}>🔍</span>
                <span
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: '800',
                    color: '#f8fafc',
                    fontSize: '0.9rem'
                  }}
                >
                  Niveau {levelIndex + 1}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  color: foundTargets.length === targetCount ? '#10b981' : '#38bdf8',
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {foundTargets.length} / {targetCount} Trouvés
              </span>
            </div>
          }
        />
      )}

      {/* Ancre Visuelle Gauche (Hémi-évi) */}
      <div className={`left-guide-bar ${hasUnfoundLeftTargets ? 'left-guide-active' : ''}`} />

      {/* Conteneur principal */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 16px',
          boxSizing: 'border-box'
        }}
      >
        {/* Bandeau d'Objectif Cible Clair */}
        <div
          style={{
            width: '100%',
            marginBottom: '14px',
            padding: '10px 16px',
            background: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '600' }}>
              Trouve :
            </span>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {targetSymbolObjects.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.95rem'
                  }}
                >
                  <SymbolIcon name={s.id} size={20} color={s.color} />
                  <span>{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          <span
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '1rem',
              fontWeight: '800',
              color: '#34d399'
            }}
          >
            {foundTargets.length}/{targetCount}
          </span>
        </div>

        {/* Grille de barrage visuel */}
        <div
          style={{
            width: 'min(90vw, 360px)',
            height: 'min(90vw, 360px)',
            background: 'rgba(8, 15, 28, 0.85)',
            border: '2px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.05)',
            borderRadius: '20px',
            padding: '10px',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '8px',
            boxSizing: 'border-box'
          }}
        >
          {grid.map((cell) => {
            const isFound = cell.found;
            const isHinted = hintCellId === cell.id;

            return (
              <div
                key={cell.id}
                onClick={() => handleCellClick(cell)}
                className={`symbol-cell ${isFound ? 'symbol-cell-found' : ''} ${isHinted ? 'symbol-cell-hint' : ''}`}
                role="button"
                aria-label={isFound ? `${cell.symbol.name} trouvé` : cell.symbol.name}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                    opacity: isFound ? 1 : 0.85
                  }}
                >
                  <SymbolIcon
                    name={cell.symbol.id}
                    size={rows > 4 ? 26 : 30}
                    color={cell.symbol.color}
                  />
                </div>

                {/* Coche verte de validation sur les cibles trouvées */}
                {isFound && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      right: '4px',
                      fontSize: '0.75rem',
                      color: '#10b981',
                      fontWeight: '900'
                    }}
                  >
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Boutons d'Action Ergonomiques (Portée du pouce droit) */}
        <div
          style={{
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            gap: '12px'
          }}
        >
          <button
            onClick={generateBoard}
            className="retro-btn"
            style={{
              flex: 1,
              minHeight: '48px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '700',
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1'
            }}
            title="Recommencer le tableau"
          >
            🔄 Recommencer
          </button>

          <button
            onClick={handleUseHint}
            disabled={foundTargets.length === targetCount}
            className="retro-btn"
            style={{
              flex: 1.2,
              minHeight: '48px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '700',
              background: 'rgba(251, 191, 36, 0.15)',
              borderColor: '#fbbf24',
              color: '#fef08a'
            }}
            title="Montrer un indice sans pénalité"
          >
            💡 Indice Doux
          </button>
        </div>
      </main>

      {/* UNIFIED GAME VICTORY OVERLAY */}
      <GameVictoryOverlay
        isOpen={levelWon}
        gameKey="symbolquest"
        title="TABLEAU COMPLÉTÉ !"
        subtitle={`Tableau ${levelIndex + 1} (${pack}) terminé avec succès !`}
        stats={[
          { label: 'Symboles trouvés', value: targetCount, icon: '🎯' },
          { label: 'Pack', value: pack, icon: '🌸' }
        ]}
        onRestart={handleNextLevel}
        restartText="Tableau Suivant ➔"
        onContinue={handleNextLevel}
        continueText="Tableau Suivant ➔"
        onBack={onBack}
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
