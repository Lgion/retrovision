import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';
import { ZEN_FLOW_LEVELS } from './zenflowLevels';

// Mots doux de félicitations spécifiques
const ENCOURAGING_WORDS = [
  "Chaque pont créé entre la gauche et la droite renforce votre équilibre.",
  "Votre regard traverse l'espace avec fluidité et assurance.",
  "Prenez un instant pour savourer cette belle harmonie.",
  "La patience et la régularité ouvrent chaque jour de nouvelles voies.",
  "Un parcours lumineux tracé avec calme et précision.",
  "Bravo ! Votre cerveau crée de nouvelles connexions pas à pas.",
  "La fluidité naît du calme et de la confiance.",
  "Chaque couleur a trouvé sa place, tout comme votre sérénité."
];

export default function ZenFlow({
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
  intermissionGames
}) {
  const confirm = useConfirm();

  // Niveau courant (1 à 15)
  const [levelIndex, setLevelIndex] = useState(() => {
    if (isIntermission) {
      return intermissionDifficulty === 'difficile' ? 5 : 0;
    }
    const saved = storage.getNumber('retrovision_zenflow_level', 0);
    return Math.min(Math.max(0, saved), ZEN_FLOW_LEVELS.length - 1);
  });

  const currentLevel = ZEN_FLOW_LEVELS[levelIndex % ZEN_FLOW_LEVELS.length];
  const size = currentLevel.size;
  const pairs = currentLevel.pairs;

  // Chemins tracés pour chaque couleur : { [colorId]: [[r, c], [r, c], ...] }
  const [paths, setPaths] = useState({});
  // Historique pour bouton Annuler
  const [history, setHistory] = useState([]);
  // Couleur actuellement en cours de tracé / sélectionnée
  const [activeColor, setActiveColor] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  // Écran de victoire de niveau
  const [levelWon, setLevelWon] = useState(false);

  const boardRef = useRef(null);

  // Synthèse Web Audio centralisée
  const playZenNote = useCallback((stepIndex = 0, isHighNote = false) => {
    sound.playPentatonicNote(stepIndex, isHighNote);
  }, []);

  const playConnectionChime = useCallback(() => {
    sound.playConnectionChime();
  }, []);

  // Réinitialisation lors d'un changement de niveau
  useEffect(() => {
    setPaths({});
    setHistory([]);
    setActiveColor(null);
    setIsDragging(false);
    setLevelWon(false);
  }, [levelIndex]);

  // Vérifie si deux coordonnées sont adjacentes (horizontalement ou verticalement)
  const areAdjacent = (c1, c2) => {
    if (!c1 || !c2) return false;
    const dr = Math.abs(c1[0] - c2[0]);
    const dc = Math.abs(c1[1] - c2[1]);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  };

  // Coordonnées de tous les points terminaux
  const endpointsMap = useMemo(() => {
    const map = {};
    pairs.forEach((p) => {
      map[`${p.p1[0]},${p.p1[1]}`] = { ...p, isStart: true };
      map[`${p.p2[0]},${p.p2[1]}`] = { ...p, isStart: false };
    });
    return map;
  }, [pairs]);

  // Statut de connexion de chaque paire
  const pairStatuses = useMemo(() => {
    const statuses = {};
    pairs.forEach((pair) => {
      const path = paths[pair.id] || [];
      if (path.length < 2) {
        statuses[pair.id] = { isConnected: false, length: path.length };
        return;
      }
      const first = path[0];
      const last = path[path.length - 1];
      const hitsP1 = (first[0] === pair.p1[0] && first[1] === pair.p1[1]) || (last[0] === pair.p1[0] && last[1] === pair.p1[1]);
      const hitsP2 = (first[0] === pair.p2[0] && first[1] === pair.p2[1]) || (last[0] === pair.p2[0] && last[1] === pair.p2[1]);
      statuses[pair.id] = {
        isConnected: hitsP1 && hitsP2,
        length: path.length
      };
    });
    return statuses;
  }, [pairs, paths]);

  // Nombre de flux complétés
  const completedCount = useMemo(() => {
    return Object.values(pairStatuses).filter((s) => s.isConnected).length;
  }, [pairStatuses]);

  // Cellules occupées par n'importe quel flux
  const occupiedCells = useMemo(() => {
    const map = {};
    Object.entries(paths).forEach(([colorId, path]) => {
      path.forEach(([r, c]) => {
        map[`${r},${c}`] = colorId;
      });
    });
    return map;
  }, [paths]);

  // Détection de présence de gemmes non reliées sur la gauche (pour pulser l'ancre visuelle gauche)
  const hasUnconnectedLeftEndpoints = useMemo(() => {
    const mid = Math.floor(size / 2);
    return pairs.some((p) => {
      if (pairStatuses[p.id]?.isConnected) return false;
      return p.p1[1] <= mid || p.p2[1] <= mid;
    });
  }, [pairs, pairStatuses, size]);

  // Vérification de victoire
  const checkVictory = useCallback((newPaths) => {
    const allConnected = pairs.every((pair) => {
      const path = newPaths[pair.id] || [];
      if (path.length < 2) return false;
      const first = path[0];
      const last = path[path.length - 1];
      const hitsP1 = (first[0] === pair.p1[0] && first[1] === pair.p1[1]) || (last[0] === pair.p1[0] && last[1] === pair.p1[1]);
      const hitsP2 = (first[0] === pair.p2[0] && first[1] === pair.p2[1]) || (last[0] === pair.p2[0] && last[1] === pair.p2[1]);
      return hitsP1 && hitsP2;
    });

    if (allConnected) {
      sound.playWin?.();
      haptic.success();
      setLevelWon(true);

      const nextHigh = Math.max(levelIndex + 1, storage.getNumber('retrovision_zenflow_highscore', 0));
      storage.setItem('retrovision_zenflow_highscore', nextHigh.toString());
      if (onScoreSave) onScoreSave('zenflow', nextHigh);

      if (isIntermission && onIntermissionComplete) {
        setTimeout(() => onIntermissionComplete(true), 2400);
      }
    }
  }, [pairs, levelIndex, isIntermission, onIntermissionComplete, onScoreSave]);

  // Action : Commencer le tracé sur une case
  const startDrawingAt = (r, c) => {
    const ep = endpointsMap[`${r},${c}`];
    const occupyingColor = occupiedCells[`${r},${c}`];

    // Sauvegarde historique
    setHistory((prev) => [...prev.slice(-15), JSON.parse(JSON.stringify(paths))]);

    if (ep) {
      // Toucher un endpoint
      setActiveColor(ep.id);
      setIsDragging(true);
      playZenNote(0, c < size / 2);
      haptic.tap();

      setPaths((prev) => {
        const next = { ...prev, [ep.id]: [[r, c]] };
        return next;
      });
    } else if (occupyingColor) {
      // Toucher un chemin existant : on le tronque jusqu'à cette case
      const existingPath = paths[occupyingColor] || [];
      const idx = existingPath.findIndex(([pr, pc]) => pr === r && pc === c);
      if (idx !== -1) {
        setActiveColor(occupyingColor);
        setIsDragging(true);
        playZenNote(idx, c < size / 2);
        haptic.tap();

        setPaths((prev) => ({
          ...prev,
          [occupyingColor]: existingPath.slice(0, idx + 1)
        }));
      }
    } else if (activeColor && !pairStatuses[activeColor]?.isConnected) {
      // Mode tap-par-tap : case vide adjacente à la tête du flux actif
      const currentPath = paths[activeColor] || [];
      if (currentPath.length > 0) {
        const head = currentPath[currentPath.length - 1];
        if (areAdjacent(head, [r, c])) {
          playZenNote(currentPath.length, c < size / 2);
          haptic.tap();

          setPaths((prev) => {
            const next = { ...prev, [activeColor]: [...currentPath, [r, c]] };
            return next;
          });
        }
      }
    }
  };

  // Action : Continuer le tracé vers une case (glisser ou tap pas à pas)
  const extendDrawingTo = (r, c) => {
    if (!activeColor) return;
    const currentPath = paths[activeColor] || [];
    if (currentPath.length === 0) return;

    const head = currentPath[currentPath.length - 1];
    if (head[0] === r && head[1] === c) return; // Même case

    // Doit être strictement adjacent
    if (!areAdjacent(head, [r, c])) return;

    // Si on recule sur la case précédente du même chemin (backtracking)
    if (currentPath.length >= 2) {
      const prevCell = currentPath[currentPath.length - 2];
      if (prevCell[0] === r && prevCell[1] === c) {
        // Rétracter d'un pas
        setPaths((prev) => ({
          ...prev,
          [activeColor]: currentPath.slice(0, -1)
        }));
        haptic.tap();
        return;
      }
    }

    // Endpoint visé
    const ep = endpointsMap[`${r},${c}`];
    if (ep) {
      if (ep.id !== activeColor) {
        // C'est l'endpoint d'une autre couleur : interdit de traverser
        return;
      }
      // C'est l'autre endpoint de notre couleur : CONNEXION !
      const nextPath = [...currentPath, [r, c]];
      playConnectionChime();
      haptic.success();
      setIsDragging(false);

      const nextPaths = { ...paths, [activeColor]: nextPath };
      setPaths(nextPaths);
      checkVictory(nextPaths);
      return;
    }

    // Case intermédiaire : si déjà occupée par une autre couleur, on coupe cette couleur
    const occupying = occupiedCells[`${r},${c}`];
    playZenNote(currentPath.length, c < size / 2);
    haptic.tap();

    setPaths((prev) => {
      const next = { ...prev };
      if (occupying && occupying !== activeColor) {
        // Tronquer le chemin concurrent
        const otherPath = prev[occupying] || [];
        const cutIdx = otherPath.findIndex(([or, oc]) => or === r && oc === c);
        if (cutIdx !== -1) {
          next[occupying] = otherPath.slice(0, cutIdx);
        }
      }
      next[activeColor] = [...currentPath, [r, c]];
      return next;
    });
  };

  // Gestionnaires tactiles / souris
  const handlePointerDown = (e, r, c) => {
    e.preventDefault();
    startDrawingAt(r, c);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !activeColor) return;
    e.preventDefault();

    // Calcul de la case sous le doigt / curseur
    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
      return;
    }

    const cellWidth = rect.width / size;
    const cellHeight = rect.height / size;
    const c = Math.floor((clientX - rect.left) / cellWidth);
    const r = Math.floor((clientY - rect.top) / cellHeight);

    if (r >= 0 && r < size && c >= 0 && c < size) {
      extendDrawingTo(r, c);
    }
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      checkVictory(paths);
    }
  };

  // Annuler le dernier coup
  const handleUndo = () => {
    if (history.length === 0) return;
    sound.playClick();
    haptic.tap();
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setPaths(previous);
  };

  // Effacer le flux actif
  const handleClearActive = () => {
    if (!activeColor || !paths[activeColor]) return;
    sound.playClick();
    haptic.tap();
    setHistory((prev) => [...prev, JSON.parse(JSON.stringify(paths))]);
    setPaths((prev) => {
      const next = { ...prev };
      delete next[activeColor];
      return next;
    });
  };

  // Réinitialiser le niveau
  const handleResetLevel = () => {
    sound.playClick();
    haptic.tap();
    setHistory([]);
    setPaths({});
    setActiveColor(null);
  };

  // Passer au niveau suivant
  const handleNextLevel = () => {
    sound.playClick();
    haptic.tap();
    const nextIdx = (levelIndex + 1) % ZEN_FLOW_LEVELS.length;
    setLevelIndex(nextIdx);
    storage.setItem('retrovision_zenflow_level', nextIdx.toString());
  };

  // Retour avec confirmation si des tracés existent
  const handleBackWithConfirm = async () => {
    const hasDrawn = Object.values(paths).some((p) => p.length > 0);
    if (hasDrawn && !levelWon) {
      const ok = await confirm({
        title: 'Quitter Flux Zen ?',
        message: 'Voulez-vous vraiment quitter ce parcours en cours de tracé ?',
        confirmText: 'Oui, quitter',
        cancelText: 'Continuer le tracé',
        confirmVariant: 'danger'
      });
      if (ok) onBack();
    } else {
      onBack();
    }
  };

  // Rendu des lignes SVG pour chaque flux
  const renderSvgPaths = () => {
    const cellSize = 100 / size; // en pourcentage (%)

    return Object.entries(paths).map(([colorId, path]) => {
      if (!path || path.length < 2) return null;
      const pair = pairs.find((p) => p.id === colorId);
      if (!pair) return null;

      // Construction de la chaîne de points
      const d = path.reduce((acc, [r, c], idx) => {
        const x = c * cellSize + cellSize / 2;
        const y = r * cellSize + cellSize / 2;
        return `${acc} ${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      }, '');

      const isConnected = pairStatuses[colorId]?.isConnected;

      return (
        <g key={colorId}>
          {/* Halo lumineux sous la ligne */}
          <path
            d={d}
            fill="none"
            stroke={pair.color}
            strokeWidth={cellSize * 0.44}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={isConnected ? 0.4 : 0.25}
            style={{
              filter: `drop-shadow(0 0 8px ${pair.color})`,
              transition: 'stroke 0.2s ease, opacity 0.2s ease'
            }}
          />
          {/* Cœur néon net */}
          <path
            d={d}
            fill="none"
            stroke={pair.color}
            strokeWidth={cellSize * 0.26}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.95}
          />
        </g>
      );
    });
  };

  const encouragingMessage = useMemo(() => {
    return ENCOURAGING_WORDS[levelIndex % ENCOURAGING_WORDS.length];
  }, [levelIndex]);

  return (
    <div
      className="zenflow-container"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 25%, #0c162d 0%, #060a14 100%)',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflowX: 'hidden',
        touchAction: 'none',
        fontFamily: "'Outfit', -apple-system, sans-serif"
      }}
      onPointerMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
    >
      <style>{`
        @keyframes left-guide-pulse {
          0%, 100% { opacity: 0.35; box-shadow: 0 0 8px #06b6d4; }
          50% { opacity: 1; box-shadow: 0 0 20px #06b6d4, inset 0 0 10px #06b6d4; }
        }
        @keyframes gem-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px currentColor); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 16px currentColor); }
        }
        @keyframes success-pop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .zen-board-cell {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          touch-action: none;
          transition: background 0.15s ease;
        }
        .zen-board-cell:active {
          background: rgba(255, 255, 255, 0.08);
        }
        .left-guide-bar {
          position: absolute;
          left: 0;
          top: 75px;
          bottom: 25px;
          width: 5px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, rgba(6,182,212,0.2) 0%, rgba(6,182,212,0.95) 50%, rgba(6,182,212,0.2) 100%);
          z-index: 15;
          pointer-events: none;
          transition: all 0.3s ease;
        }
        .left-guide-active {
          animation: left-guide-pulse 1.5s ease-in-out infinite;
          width: 8px;
        }
      `}</style>

      {/* Header Unifié ou Header Entracte */}
      {isIntermission ? (
        <div style={{ width: '100%', marginBottom: '6px', zIndex: 10, flexShrink: 0, padding: '0 8px', boxSizing: 'border-box' }}>
          <IntermissionHeader
            instructionText="Reliez toutes les paires de couleur pour retourner au jeu principal."
            onRestart={() => {
              setPaths({});
              setHistory([]);
              setActiveColor(null);
              setLevelWon(false);
            }}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={pairs.length > 0 ? completedCount / pairs.length : 0}
          />
        </div>
      ) : (
        <GameHeader
          title="FLUX ZEN"
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
                  border: '1px solid rgba(6, 182, 212, 0.3)'
                }}
              >
                <span style={{ fontSize: '1rem' }}>🌊</span>
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
                  color: completedCount === pairs.length ? '#10b981' : '#38bdf8',
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {completedCount} / {pairs.length} Flux
              </span>
            </div>
          }
        />
      )}

      {/* Ancre Visuelle Gauche (Hémi-évi) */}
      <div className={`left-guide-bar ${hasUnconnectedLeftEndpoints ? 'left-guide-active' : ''}`} />

      {/* Conteneur principal du jeu */}
      <main
        style={{
          flex: 1,
          width: '100%',
          maxWidth: '440px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 16px',
          boxSizing: 'border-box'
        }}
      >
        {/* Bandeau d'état bienveillant */}
        <div
          style={{
            width: '100%',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            fontSize: '0.9rem'
          }}
        >
          <span style={{ color: '#94a3b8', fontWeight: '500' }}>
            Pack : <strong style={{ color: '#f1f5f9' }}>{currentLevel.pack}</strong>
          </span>
          <span style={{ color: activeColor ? pairs.find((p) => p.id === activeColor)?.color : '#38bdf8', fontWeight: '700' }}>
            {activeColor
              ? `Flux ${pairs.find((p) => p.id === activeColor)?.label} actif`
              : 'Touchez une gemme pour tracer'}
          </span>
        </div>

        {/* Plateau de jeu interactive */}
        <div
          ref={boardRef}
          style={{
            position: 'relative',
            width: 'min(88vw, 360px)',
            height: 'min(88vw, 360px)',
            background: 'rgba(8, 14, 28, 0.85)',
            border: '2px solid rgba(6, 182, 212, 0.25)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(6, 182, 212, 0.05)',
            borderRadius: '20px',
            padding: '8px',
            display: 'grid',
            gridTemplateColumns: `repeat(${size}, 1fr)`,
            gridTemplateRows: `repeat(${size}, 1fr)`,
            gap: '6px',
            boxSizing: 'border-box',
            touchAction: 'none'
          }}
        >
          {/* Calque SVG pour les lignes lumineuses */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 5
            }}
            viewBox="0 0 100 100"
          >
            {renderSvgPaths()}
          </svg>

          {/* Cellules interactives de la grille */}
          {Array.from({ length: size }).map((_, r) =>
            Array.from({ length: size }).map((_, c) => {
              const ep = endpointsMap[`${r},${c}`];
              const isOccupied = occupiedCells[`${r},${c}`];
              const isLeftHalf = c < Math.floor(size / 2);

              return (
                <div
                  key={`${r}-${c}`}
                  className="zen-board-cell"
                  onPointerDown={(e) => handlePointerDown(e, r, c)}
                  onTouchStart={(e) => handlePointerDown(e, r, c)}
                  role="button"
                  aria-label={`Case ligne ${r + 1}, colonne ${c + 1}`}
                >
                  {/* Gemme d'extrémité */}
                  {ep && (
                    <div
                      style={{
                        width: '68%',
                        height: '68%',
                        borderRadius: '50%',
                        backgroundColor: ep.color,
                        color: ep.color,
                        position: 'relative',
                        zIndex: 10,
                        boxShadow: `0 0 14px ${ep.color}, 0 0 28px ${ep.color}`,
                        animation: pairStatuses[ep.id]?.isConnected
                          ? 'none'
                          : isLeftHalf
                          ? 'gem-pulse 1.8s ease-in-out infinite'
                          : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {/* Éclat intérieur blanc pour effet de gemme lumineuse */}
                      <div
                        style={{
                          width: '35%',
                          height: '35%',
                          borderRadius: '50%',
                          backgroundColor: '#ffffff',
                          opacity: 0.85
                        }}
                      />
                    </div>
                  )}

                  {/* Indicateur discret de point de passage */}
                  {isOccupied && !ep && (
                    <div
                      style={{
                        width: '20%',
                        height: '20%',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.4)',
                        zIndex: 8,
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
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
            gap: '10px'
          }}
        >
          <button
            onClick={handleResetLevel}
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
            title="Recommencer la grille"
          >
            🔄 Recommencer
          </button>

          <button
            onClick={handleClearActive}
            disabled={!activeColor}
            className="retro-btn"
            style={{
              flex: 1,
              minHeight: '48px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '700',
              background: 'rgba(239, 68, 68, 0.1)',
              borderColor: activeColor ? 'rgba(239, 68, 68, 0.4)' : 'transparent',
              color: activeColor ? '#fca5a5' : '#64748b',
              opacity: activeColor ? 1 : 0.4
            }}
            title="Effacer le tracé sélectionné"
          >
            🗑️ Effacer
          </button>

          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="retro-btn"
            style={{
              flex: 1,
              minHeight: '48px',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '700',
              background: 'rgba(6, 182, 212, 0.15)',
              borderColor: history.length > 0 ? '#06b6d4' : 'transparent',
              color: history.length > 0 ? '#ffffff' : '#64748b',
              opacity: history.length > 0 ? 1 : 0.4
            }}
            title="Annuler le dernier tracé"
          >
            ↩ Annuler
          </button>
        </div>
      </main>

      {/* Écran de Victoire / Niveau Complété */}
      {levelWon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(5, 9, 20, 0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'success-pop 0.3s ease-out forwards'
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
            <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 20px #06b6d4)' }}>
              🌊
            </div>

            <h2
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '1.6rem',
                fontWeight: '900',
                color: '#06b6d4',
                margin: 0,
                letterSpacing: '1px'
              }}
            >
              Niveau {levelIndex + 1} Réussi !
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
              ✨ Tous les flux sont harmonieusement reliés
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

            {!isIntermission && (
              <div style={{ width: '100%', marginTop: '10px' }}>
                <IntermissionProposal
                  onIntermissionRequest={onIntermissionRequest}
                  upcomingIntermission={upcomingIntermission}
                  onSelectUpcomingIntermission={onSelectUpcomingIntermission}
                  onShuffleUpcomingIntermission={onShuffleUpcomingIntermission}
                  intermissionConfig={intermissionConfig}
                  intermissionGames={intermissionGames}
                  excludeGameKey="zenflow"
                  onContinue={handleNextLevel}
                  continueText="Niveau Suivant"
                  showDirectContinue={true}
                  customStyle={{ marginBottom: '12px' }}
                />
              </div>
            )}

            <button
              onClick={handleNextLevel}
              className="retro-btn"
              style={{
                marginTop: '12px',
                width: '100%',
                minHeight: '52px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #2563eb 100%)',
                color: '#ffffff',
                border: '2px solid #67e8f9',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '800'
              }}
            >
              Niveau Suivant ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
