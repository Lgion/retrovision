import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';

// Gamme pentatonique pour les découvertes de cibles
const PENTATONIC_FREQS = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

// Bibliothèque de symboles zen à haute lisibilité visuelle
const SYMBOLS = [
  { id: 'lotus', icon: '🪷', name: 'Lotus', color: '#f472b6', bg: 'rgba(244, 114, 182, 0.12)', border: '#f472b6' },
  { id: 'leaf', icon: '🍃', name: 'Feuille Zen', color: '#34d399', bg: 'rgba(52, 211, 153, 0.12)', border: '#34d399' },
  { id: 'moon', icon: '🌙', name: 'Croissant de Lune', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.12)', border: '#fbbf24' },
  { id: 'crystal', icon: '💎', name: 'Cristal Céleste', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)', border: '#38bdf8' },
  { id: 'sakura', icon: '🌸', name: 'Fleur de Cerisier', color: '#fb7185', bg: 'rgba(251, 113, 133, 0.12)', border: '#fb7185' },
  { id: 'star', icon: '⭐', name: 'Étoile Céleste', color: '#facc15', bg: 'rgba(250, 204, 21, 0.12)', border: '#facc15' },
  { id: 'bamboo', icon: '🎋', name: 'Bambou', color: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)', border: '#4ade80' },
  { id: 'stone', icon: '🪨', name: 'Galet Zen', color: '#cbd5e1', bg: 'rgba(203, 213, 225, 0.12)', border: '#cbd5e1' }
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
  isIntermission = false,
  intermissionDifficulty = 'facile',
  onIntermissionComplete
}) {
  const confirm = useConfirm();

  // Niveau sélectionné
  const [levelIndex, setLevelIndex] = useState(() => {
    if (isIntermission) {
      return intermissionDifficulty === 'difficile' ? 5 : 0;
    }
    const saved = localStorage.getItem('retrovision_symbolquest_level');
    const parsed = parseInt(saved, 10);
    return isNaN(parsed) ? 0 : Math.min(Math.max(0, parsed), LEVELS_CONFIG.length - 1);
  });

  const currentLevel = LEVELS_CONFIG[levelIndex % LEVELS_CONFIG.length];
  const { rows, cols, targetIds, targetCount, pack } = currentLevel;

  // Grille générée : tableau 2D de cellules { id, symbolId, isTarget, found, r, c }
  const [grid, setGrid] = useState([]);
  // ID de la cellule actuellement suggérée par l'indice
  const [hintCellId, setHintCellId] = useState(null);
  // Écran de victoire de niveau
  const [levelWon, setLevelWon] = useState(false);

  // Audio Context Web Audio
  const audioCtxRef = useRef(null);

  // Initialisation Web Audio
  const playChimeNote = useCallback((step = 0, isLeft = false) => {
    if (sound.muted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const baseIdx = (step % 5) + (isLeft ? 3 : 0);
      const freq = PENTATONIC_FREQS[Math.min(baseIdx, PENTATONIC_FREQS.length - 1)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isLeft ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.015, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(isLeft ? 0.12 : 0.08, ctx.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Audio ignoré
    }
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

    // Mélanger
    leftPositions.sort(() => Math.random() - 0.5);
    rightPositions.sort(() => Math.random() - 0.5);

    // Répartition : ~60% cibles à gauche
    const leftTargetQuota = Math.min(leftPositions.length, Math.ceil(targetCount * 0.6));
    const rightTargetQuota = targetCount - leftTargetQuota;

    const chosenTargetCoords = new Set();

    for (let i = 0; i < leftTargetQuota; i++) {
      const [r, c] = leftPositions[i];
      chosenTargetCoords.add(`${r},${c}`);
    }
    for (let i = 0; i < rightTargetQuota && i < rightPositions.length; i++) {
      const [r, c] = rightPositions[i];
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
          // Choix aléatoire parmi les cibles valides
          const chosenTargetId = targetIds[Math.floor(Math.random() * targetIds.length)];
          symbol = SYMBOLS.find((s) => s.id === chosenTargetId);
        } else {
          symbol = distractorSymbols[Math.floor(Math.random() * distractorSymbols.length)];
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

        const nextHigh = Math.max(levelIndex + 1, parseInt(localStorage.getItem('retrovision_symbolquest_highscore') || '0', 10));
        localStorage.setItem('retrovision_symbolquest_highscore', nextHigh.toString());
        if (onScoreSave) onScoreSave('symbolquest', nextHigh);

        if (isIntermission && onIntermissionComplete) {
          setTimeout(() => onIntermissionComplete(true), 2400);
        }
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
    const chosen = leftUnfound.length > 0
      ? leftUnfound[Math.floor(Math.random() * leftUnfound.length)]
      : unfound[Math.floor(Math.random() * unfound.length)];

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
    localStorage.setItem('retrovision_symbolquest_level', nextIdx.toString());
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
          0%, 100% { opacity: 0.35; box-shadow: 0 0 8px #10b981; }
          50% { opacity: 1; box-shadow: 0 0 22px #10b981, inset 0 0 10px #10b981; }
        }
        @keyframes hint-glow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px #fbbf24; border-color: #fbbf24; }
          50% { transform: scale(1.08); box-shadow: 0 0 26px #fbbf24; border-color: #fef08a; }
        }
        @keyframes found-pop {
          0% { transform: scale(0.85); opacity: 0.5; }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .symbol-cell {
          position: relative;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
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
          background: rgba(16, 185, 129, 0.15) !important;
          border: 2px solid #10b981 !important;
          box-shadow: 0 0 16px rgba(16, 185, 129, 0.35);
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

      {/* Header Unifié */}
      <GameHeader
        title="QUÊTE DES SYMBOLES"
        onBack={handleBackWithConfirm}
        showShop={false}
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
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.95rem'
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{s.icon}</span>
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
                <span
                  style={{
                    fontSize: rows > 4 ? '1.5rem' : '1.8rem',
                    filter: isFound ? 'drop-shadow(0 0 8px #10b981)' : 'none',
                    transition: 'transform 0.2s ease',
                    opacity: isFound ? 1 : 0.85
                  }}
                >
                  {cell.symbol.icon}
                </span>

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

      {/* Écran de Victoire / Tableau Complété */}
      {levelWon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 12, 22, 0.93)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'cm-fade-in 0.3s ease-out forwards'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '380px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '18px'
            }}
          >
            <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 20px #10b981)' }}>
              🌸
            </div>

            <h2
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '1.6rem',
                fontWeight: '900',
                color: '#10b981',
                margin: 0,
                letterSpacing: '1px'
              }}
            >
              Tableau {levelIndex + 1} Complété !
            </h2>

            <div
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                color: '#34d399',
                fontSize: '0.95rem',
                fontWeight: '700'
              }}
            >
              ✨ Tous les symboles cibles ont été découverts
            </div>

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.5',
                color: '#e2e8f0',
                margin: '8px 0',
                fontWeight: '500'
              }}
            >
              {encouragingMessage}
            </p>

            <button
              onClick={handleNextLevel}
              className="retro-btn"
              style={{
                marginTop: '12px',
                width: '100%',
                minHeight: '52px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: '2px solid #6ee7b7',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '800'
              }}
            >
              Tableau Suivant ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
