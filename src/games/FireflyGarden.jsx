import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';
import { getGameConfig, updateGameConfig } from '../utils/config';
import FireflyGardenCollection from './FireflyGardenCollection';

// Constellations à débloquer
const CONSTELLATIONS = [
  {
    id: 'lotus',
    name: 'Le Lotus Céleste',
    symbol: '🪷',
    target: 10,
    message: 'Chaque geste conscient ouvre une nouvelle pétale de sérénité.',
    stars: [
      { x: 50, y: 30 },
      { x: 30, y: 45 },
      { x: 70, y: 45 },
      { x: 20, y: 65 },
      { x: 50, y: 60 },
      { x: 80, y: 65 },
      { x: 35, y: 78 },
      { x: 65, y: 78 },
      { x: 50, y: 88 }
    ],
    lines: [[0, 1], [0, 2], [1, 4], [2, 4], [1, 3], [2, 5], [3, 6], [5, 7], [6, 8], [7, 8], [4, 8]]
  },
  {
    id: 'cygne',
    name: "Le Cygne d'Étoiles",
    symbol: '🦢',
    target: 12,
    message: 'La grâce réside dans le calme et la régularité.',
    stars: [
      { x: 50, y: 25 },
      { x: 50, y: 40 },
      { x: 50, y: 55 },
      { x: 30, y: 55 },
      { x: 70, y: 55 },
      { x: 20, y: 60 },
      { x: 80, y: 60 },
      { x: 50, y: 75 },
      { x: 45, y: 88 }
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 5], [2, 4], [4, 6], [2, 7], [7, 8]]
  },
  {
    id: 'tortue',
    name: 'La Tortue Sacrée',
    symbol: '🐢',
    target: 15,
    message: 'Prendre son temps est le plus sûr chemin vers la guérison.',
    stars: [
      { x: 50, y: 25 },
      { x: 40, y: 40 },
      { x: 60, y: 40 },
      { x: 32, y: 55 },
      { x: 68, y: 55 },
      { x: 40, y: 70 },
      { x: 60, y: 70 },
      { x: 28, y: 80 },
      { x: 72, y: 80 },
      { x: 50, y: 82 }
    ],
    lines: [[0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [1, 2], [3, 4], [5, 6], [5, 7], [6, 8], [5, 9], [6, 9]]
  }
];

export default function FireflyGarden({
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

  // Mode de jeu : 'constellation' (par niveaux) ou 'serenite' (infini)
  const [showCollection, setShowCollection] = useState(false);
  const [themeId, setThemeId] = useState(() => getGameConfig('fireflies', 'theme', 'azure'));
  const [gameMode, setGameMode] = useState('constellation');
  const [constellationIdx, setConstellationIdx] = useState(0);
  const [collectedInLevel, setCollectedInLevel] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [levelVictory, setLevelVictory] = useState(false);

  // Vitesse / Rythme : 'douceur' (6s), 'eveil' (4.5s), 'harmonie' (3.5s)
  const [tempo, setTempo] = useState(intermissionDifficulty === 'difficile' ? 'harmonie' : 'douceur');

  // Luciole cible à trouver actuellement
  const [targetFireflyType, setTargetFireflyType] = useState(null);

  // Message d'encouragement temporaire
  const [encouragementMessage, setEncouragementMessage] = useState(null);

  // Liste active des lucioles affichées
  const [fireflies, setFireflies] = useState([]);
  // Particules d'ondulation / étincelles après capture
  const [ripples, setRipples] = useState([]);

  const fireflyIdRef = useRef(0);
  const spawnTimerRef = useRef(null);
  const lastMatchTimeRef = useRef(Date.now());

  const currentConstellation = CONSTELLATIONS[constellationIdx % CONSTELLATIONS.length];
  const targetCount = isIntermission
    ? Number(intermissionConfig?.fireflies?.target || (intermissionDifficulty === 'difficile' ? 50 : intermissionDifficulty === 'moyen' ? 30 : 15))
    : currentConstellation.target;

  // Types de lucioles distincts avec couleur, icône/symbole et nom descriptif
  const FIREFLY_TYPES = useMemo(() => [
    { id: 'cyan', name: 'Luciole d’Azur', color: '#38bdf8', icon: '❄️', aura: 'rgba(56, 189, 248, 0.6)' },
    { id: 'gold', name: 'Luciole Dorée', color: '#facc15', icon: '☀️', aura: 'rgba(250, 204, 21, 0.6)' },
    { id: 'emerald', name: 'Luciole d’Émeraude', color: '#34d399', icon: '🍃', aura: 'rgba(52, 211, 153, 0.6)' },
    { id: 'rose', name: 'Luciole de Rose', color: '#f472b6', icon: '🌸', aura: 'rgba(244, 114, 182, 0.6)' },
    { id: 'violet', name: 'Luciole Violette', color: '#a78bfa', icon: '🔮', aura: 'rgba(167, 139, 250, 0.6)' }
  ], []);

  // Synthèse Web Audio centralisée (DRY)
  const playCrystalChime = useCallback((isLeft = false) => {
    sound.playPentatonicNote(Math.floor(Math.random() * 5), isLeft, 0.9);
  }, []);

  // Sélectionner une nouvelle luciole cible parmi les types disponibles
  const pickNewTarget = useCallback((typesList = FIREFLY_TYPES) => {
    const nextTarget = typesList[Math.floor(Math.random() * typesList.length)];
    setTargetFireflyType(nextTarget);
    return nextTarget;
  }, [FIREFLY_TYPES]);

  // Initialiser la cible dès le départ
  useEffect(() => {
    pickNewTarget();
  }, [pickNewTarget]);

  // Génération d'une nouvelle luciole avec PONDÉRATION GAUCHE (Anti-Hémi-évi)
  const spawnFirefly = useCallback(() => {
    const id = ++fireflyIdRef.current;

    // 65% de chances d'apparaître dans l'hémichamp gauche/centre (10% à 50% de la largeur)
    // 35% de chances d'apparaître dans l'hémichamp droit (50% à 85% de la largeur)
    const isLeft = Math.random() < 0.65;
    const x = isLeft ? 10 + Math.random() * 40 : 50 + Math.random() * 35;
    // Éviter le sommet (header) et le bas extrême
    const y = 20 + Math.random() * 58;

    // Durée d'apparition selon le rythme
    const lifespan = tempo === 'douceur' ? 7000 : tempo === 'eveil' ? 5500 : 4200;
    // Les lucioles de gauche restent un peu plus pour donner amplement le temps de les remarquer
    const totalLife = isLeft ? lifespan + 800 : lifespan;

    setFireflies((prev) => {
      // Nombre de lucioles simultanées pour avoir un panel de recherche stimulant
      const maxCount = tempo === 'douceur' ? 5 : tempo === 'eveil' ? 6 : 7;
      const activeFireflies = prev.filter((f) => Date.now() - f.born < f.lifespan);

      // S'assurer que le type cible est régulièrement présent à l'écran
      const currentTarget = targetFireflyType;
      const hasTargetOnScreen = currentTarget && activeFireflies.some((f) => f.type.id === currentTarget.id);

      // Si la cible n'est pas à l'écran ou au hasard, favoriser son apparition
      let chosenType;
      if (!hasTargetOnScreen && Math.random() < 0.6 && currentTarget) {
        chosenType = currentTarget;
      } else {
        chosenType = FIREFLY_TYPES[Math.floor(Math.random() * FIREFLY_TYPES.length)];
      }

      const newFirefly = {
        id,
        x,
        y,
        type: chosenType,
        color: chosenType.color,
        isLeft,
        size: isLeft ? 42 : 38,
        born: Date.now(),
        lifespan: totalLife
      };

      if (activeFireflies.length >= maxCount) {
        // Remplacer la plus ancienne si le plateau est plein
        return [...activeFireflies.slice(1), newFirefly];
      }
      return [...activeFireflies, newFirefly];
    });
  }, [tempo, targetFireflyType, FIREFLY_TYPES]);

  // Boucle de spawn continue
  useEffect(() => {
    if (levelVictory) return;

    const interval = tempo === 'douceur' ? 1800 : tempo === 'eveil' ? 1400 : 1000;
    spawnTimerRef.current = setInterval(spawnFirefly, interval);

    // Lucioles immédiates
    spawnFirefly();

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [spawnFirefly, tempo, levelVictory]);

  // Nettoyage des lucioles expirées
  useEffect(() => {
    const cleaner = setInterval(() => {
      setFireflies((prev) => {
        const filtered = prev.filter((f) => Date.now() - f.born < f.lifespan);
        return filtered;
      });
    }, 400);
    return () => clearInterval(cleaner);
  }, []);

  // Décroissance d'inactivité de 10 secondes : si le joueur ne capture pas de luciole valide
  useEffect(() => {
    if (levelVictory) return;

    const decayInterval = setInterval(() => {
      if (Date.now() - lastMatchTimeRef.current >= 10000) {
        setCollectedInLevel((prev) => {
          if (prev > 0) {
            // Décrémentation d'une jauge/bloc
            lastMatchTimeRef.current = Date.now(); // Réinitialise pour le prochain cycle de 10s
            return prev - 1;
          }
          return 0;
        });
      }
    }, 1000);

    return () => clearInterval(decayInterval);
  }, [levelVictory]);

  // Détection de présence de lucioles dans l'hémichamp gauche (pour pulser l'ancre visuelle)
  const hasLeftFirefly = useMemo(() => {
    return fireflies.some((f) => f.isLeft);
  }, [fireflies]);

  // Capture d'une luciole par toucher
  const handleCatchFirefly = (e, firefly) => {
    e.stopPropagation();

    const isCorrect = targetFireflyType && firefly.type.id === targetFireflyType.id;

    if (isCorrect) {
      // Réinitialiser le chronomètre d'inactivité
      lastMatchTimeRef.current = Date.now();

      // RETOUR HAPTIQUE DE SUCCÈS & ENCOURAGEMENT
      haptic.success();
      playCrystalChime(firefly.isLeft);

      // Encouragements positifs et bienveillants
      const messages = [
        "Merveilleux ! ✨",
        "Excellente observation !",
        "Bien trouvé ! 🌟",
        "Bravo, belle attention !",
        "Parfaitement repérée !"
      ];
      setEncouragementMessage(messages[Math.floor(Math.random() * messages.length)]);
      setTimeout(() => setEncouragementMessage(null), 1800);

      // Création d'une ondulation lumineuse éclatante
      const rippleId = Date.now() + Math.random();
      setRipples((prev) => [
        ...prev.slice(-8),
        {
          id: rippleId,
          x: firefly.x,
          y: firefly.y,
          color: firefly.color,
          isSuccess: true
        }
      ]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 1000);

      // Retirer la luciole attrapée
      setFireflies((prev) => prev.filter((f) => f.id !== firefly.id));

      // Choisir une nouvelle luciole cible
      pickNewTarget();

      // Mise à jour des scores
      const nextTotal = totalCollected + 1;
      setTotalCollected(nextTotal);
      if (onScoreSave) onScoreSave('fireflies', nextTotal);

      if (gameMode === 'constellation') {
        const nextLevel = collectedInLevel + 1;
        setCollectedInLevel(nextLevel);
        if (nextLevel >= targetCount) {
          // Niveau complété !
          sound.playWin?.();
          haptic.success();
          setLevelVictory(true);
        }
      }
    } else {
      // RETOUR HAPTIQUE TRÈS LÉGER, SUBTIL POUR NON-CORRESPONDANCE
      haptic.light(15);
      sound.playClick();

      // Ondulation plus discrète sans validation
      const rippleId = Date.now() + Math.random();
      setRipples((prev) => [
        ...prev.slice(-8),
        {
          id: rippleId,
          x: firefly.x,
          y: firefly.y,
          color: 'rgba(255, 255, 255, 0.3)',
          isSuccess: false
        }
      ]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== rippleId));
      }, 700);
    }
  };

  // Passer à la constellation suivante
  const handleNextLevel = () => {
    sound.playClick();
    haptic.tap();
    setLevelVictory(false);
    setCollectedInLevel(0);
    setConstellationIdx((prev) => prev + 1);
    pickNewTarget();
  };

  // Bascule entre mode constellation et méditation libre
  const toggleGameMode = () => {
    sound.playClick();
    haptic.tap();
    setGameMode((prev) => (prev === 'constellation' ? 'serenite' : 'constellation'));
    setCollectedInLevel(0);
    setLevelVictory(false);
    pickNewTarget();
  };

  // Retour avec modale accessible de confirmation
  const handleBackWithConfirm = async () => {
    if (collectedInLevel > 0 && !levelVictory) {
      const ok = await confirm({
        title: 'Quitter le Jardin ?',
        message: 'Voulez-vous vraiment quitter votre promenade avec les lucioles ?',
        confirmText: 'Oui, quitter',
        cancelText: 'Continuer à jouer',
        confirmVariant: 'danger'
      });
      if (ok) onBack();
    } else {
      onBack();
    }
  };

  return (
    <div
      className="firefly-garden-container"
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 30%, #0d1527 0%, #050811 100%)',
        overflow: 'hidden',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Outfit', -apple-system, sans-serif"
      }}
    >
      <style>{`
        @keyframes float-drift {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(6px, -10px) scale(1.05); }
          66% { transform: translate(-6px, 8px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes glow-pulse {
          0%, 100% { filter: drop-shadow(0 0 10px currentColor) drop-shadow(0 0 20px currentColor); opacity: 0.85; }
          50% { filter: drop-shadow(0 0 18px currentColor) drop-shadow(0 0 35px currentColor); opacity: 1; }
        }
        @keyframes ripple-expand {
          0% { transform: translate(-50%, -50%) scale(0.2); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(3.5); opacity: 0; }
        }
        @keyframes left-anchor-pulse {
          0%, 100% { opacity: 0.35; box-shadow: 0 0 10px #38bdf8; }
          50% { opacity: 1; box-shadow: 0 0 25px #38bdf8, inset 0 0 15px #38bdf8; }
        }
        @keyframes star-twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        .firefly-hitbox {
          position: absolute;
          transform: translate(-50%, -50%);
          /* Zone tactile généreuse d'au moins 72px pour le pouce droit */
          min-width: 76px;
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          touch-action: manipulation;
          z-index: 20;
        }
        .firefly-core {
          border-radius: 50%;
          animation: float-drift 4s ease-in-out infinite, glow-pulse 2s ease-in-out infinite;
          position: relative;
          pointer-events: none;
        }
        .left-anchor-bar {
          position: absolute;
          left: 0;
          top: 70px;
          bottom: 20px;
          width: 5px;
          border-radius: 0 4px 4px 0;
          background: linear-gradient(180deg, rgba(56,189,248,0.2) 0%, rgba(56,189,248,0.9) 50%, rgba(56,189,248,0.2) 100%);
          z-index: 15;
          pointer-events: none;
          transition: all 0.3s ease;
        }
        @keyframes target-glow-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 12px currentColor) brightness(1); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 24px currentColor) brightness(1.2); }
        }
        @keyframes board-border-glow {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        @keyframes battery-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.02); }
        }
        @keyframes battery-block-glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.25); }
        }
      `}</style>

      {showCollection && (
        <FireflyGardenCollection
          currentSelections={{
            theme: themeId,
            constellation: constellationIdx,
            tempo: tempo
          }}
          onSelect={(catKey, itemId) => {
            if (catKey === 'theme') {
              setThemeId(itemId);
              updateGameConfig('fireflies', 'theme', itemId);
            } else if (catKey === 'constellation') {
              setConstellationIdx(Number(itemId));
              setCollectedInLevel(0);
              setLevelVictory(false);
              pickNewTarget();
            } else if (catKey === 'tempo') {
              setTempo(itemId);
            }
          }}
          onClose={() => setShowCollection(false)}
        />
      )}

      {/* Header Unifié ou Header Entracte */}
      {isIntermission ? (
        <div style={{ width: '100%', marginBottom: '6px', zIndex: 10, flexShrink: 0, padding: '0 8px', boxSizing: 'border-box' }}>
          <IntermissionHeader
            instructionText="Trouvez les lucioles demandées pour retourner au jeu principal."
            onRestart={() => {
              setCollectedInLevel(0);
              setLevelVictory(false);
              pickNewTarget();
            }}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={Math.min(1.0, collectedInLevel / targetCount)}
            extraControls={
              targetFireflyType ? (
                <div
                  className="target-firefly-indicator"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px',
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: `2px solid ${targetFireflyType.color}`,
                    boxShadow: `0 0 8px ${targetFireflyType.color}, inset 0 0 6px ${targetFireflyType.color}44`,
                    marginRight: '6px'
                  }}
                  title={`Luciole cible : ${targetFireflyType.color}`}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '50%',
                      backgroundColor: targetFireflyType.color,
                      boxShadow: `0 0 8px ${targetFireflyType.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'target-glow-pulse 2s ease-in-out infinite'
                    }}
                  >
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff'
                      }}
                    />
                  </div>
                </div>
              ) : null
            }
          />
        </div>
      ) : (
        <GameHeader
          title="JARDIN DES LUCIOLES"
          gameId="fireflies"
          onBack={handleBackWithConfirm}
          onLaunchIntermission={onLaunchIntermission || onIntermissionRequest}
          onShop={() => setShowCollection(true)}
          showShop={true}
          centerContent={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              {/* Indicateur épuré de la Luciole Cible (sans texte, grand, démarqué et éclatant) */}
              {targetFireflyType && (
                <div
                  className="target-firefly-indicator"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    borderRadius: '50%',
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: `2.5px solid ${targetFireflyType.color}`,
                    boxShadow: `0 0 12px ${targetFireflyType.color}, inset 0 0 8px ${targetFireflyType.color}44`,
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }}
                  title={`Luciole cible : ${targetFireflyType.color}`}
                  aria-label={`Couleur cible : ${targetFireflyType.color}`}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: targetFireflyType.color,
                      boxShadow: `0 0 12px ${targetFireflyType.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      animation: 'target-glow-pulse 2s ease-in-out infinite'
                    }}
                  >
                    {/* Cœur lumineux étincelant */}
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 8px #ffffff'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Compteur d'étoiles / score */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '20px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>✨</span>
                <span
                  style={{
                    fontFamily: 'Orbitron, sans-serif',
                    fontWeight: '800',
                    color: '#f8fafc',
                    fontSize: '1rem',
                    letterSpacing: '0.5px'
                  }}
                >
                  {gameMode === 'constellation'
                    ? `${collectedInLevel} / ${targetCount}`
                    : `${totalCollected} captées`}
                </span>
              </div>
            </div>
          }
          extraControls={
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={toggleGameMode}
                className="retro-btn"
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  borderRadius: '16px',
                  minHeight: '48px',
                  background: gameMode === 'constellation' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  borderColor: gameMode === 'constellation' ? '#38bdf8' : '#10b981',
                  color: '#ffffff'
                }}
                title="Changer de mode"
              >
                {gameMode === 'constellation' ? '⭐ Constellation' : '🌿 Sérénité'}
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  haptic.tap();
                  setTempo((prev) => (prev === 'douceur' ? 'eveil' : prev === 'eveil' ? 'harmonie' : 'douceur'));
                }}
                className="retro-btn"
                style={{
                  padding: '8px 12px',
                  fontSize: '12px',
                  borderRadius: '16px',
                  minHeight: '48px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#cbd5e1'
                }}
                title="Ajuster le rythme"
              >
                ⏱️ {tempo === 'douceur' ? 'Doux' : tempo === 'eveil' ? 'Actif' : 'Vif'}
              </button>
            </div>
          }
        />
      )}

      {/* ANCRE VISUELLE GAUCHE (Spéciale Hémi-évi) */}
      <div className={`left-anchor-bar ${hasLeftFirefly ? 'left-anchor-active' : ''}`} />

      {/* Espace de jeu interactif avec contour dynamique et fond teinté de la couleur de la luciole cible */}
      <div
        className="firefly-play-grid"
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          border: targetFireflyType
            ? `3px solid ${targetFireflyType.color}`
            : '2px solid rgba(56, 189, 248, 0.3)',
          boxShadow: targetFireflyType
            ? `inset 0 0 20px ${targetFireflyType.color}22, 0 4px 16px rgba(0, 0, 0, 0.4)`
            : 'none',
          backgroundColor: targetFireflyType
            ? `${targetFireflyType.color}18`
            : 'rgba(5, 8, 17, 0.4)',
          background: targetFireflyType
            ? `radial-gradient(ellipse at 50% 40%, ${targetFireflyType.color}33 0%, ${targetFireflyType.color}16 55%, rgba(5, 8, 17, 0.75) 100%)`
            : 'radial-gradient(ellipse at 50% 40%, rgba(56, 189, 248, 0.08) 0%, rgba(5, 8, 17, 0.75) 100%)',
          transition: 'border-color 0.5s ease, box-shadow 0.5s ease, background 0.5s ease, background-color 0.5s ease'
        }}
      >
        {/* Voile d'ambiance teinté dynamique pour renforcer visuellement la couleur cible */}
        {targetFireflyType && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              background: `radial-gradient(ellipse at 50% 35%, ${targetFireflyType.color}2e 0%, ${targetFireflyType.color}14 65%, transparent 100%)`,
              mixBlendMode: 'screen',
              transition: 'background 0.5s ease',
              zIndex: 1
            }}
          />
        )}
        {/* Fond d'étoiles scintillantes apaisantes */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[
            { x: 15, y: 15, s: 2, d: 2 },
            { x: 25, y: 40, s: 3, d: 3 },
            { x: 45, y: 10, s: 2, d: 4 },
            { x: 75, y: 22, s: 3, d: 2.5 },
            { x: 85, y: 55, s: 2, d: 3.5 },
            { x: 35, y: 75, s: 2.5, d: 4 },
            { x: 65, y: 80, s: 2, d: 2 }
          ].map((star, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.s}px`,
                height: `${star.s}px`,
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                boxShadow: '0 0 6px #ffffff',
                animation: `star-twinkle ${star.d}s ease-in-out infinite`
              }}
            />
          ))}
        </div>

        {/* Jauge Centrale en Pile / Batterie Digitale HUD (20% de largeur, 40% opacité, non bloquante) */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20%',
            minWidth: '68px',
            maxWidth: '120px',
            height: '240px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            opacity: 0.4,
            pointerEvents: 'none',
            zIndex: 6,
            userSelect: 'none',
            transition: 'opacity 0.3s ease'
          }}
          aria-hidden="true"
        >
          {/* Borne / plot supérieur de la pile */}
          <div
            style={{
              width: '32%',
              height: '8px',
              borderRadius: '4px 4px 0 0',
              background: 'rgba(255, 255, 255, 0.4)',
              border: '1.5px solid rgba(255, 255, 255, 0.5)',
              borderBottom: 'none',
              boxShadow: '0 0 8px rgba(255, 255, 255, 0.2)'
            }}
          />

          {/* Corps principal de la pile digitale */}
          <div
            style={{
              width: '100%',
              flex: 1,
              borderRadius: '12px',
              border: '2px solid rgba(255, 255, 255, 0.45)',
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.7) 0%, rgba(3, 7, 18, 0.85) 100%)',
              boxShadow: '0 0 20px rgba(0, 0, 0, 0.5), inset 0 0 15px rgba(255, 255, 255, 0.05)',
              padding: '6px',
              display: 'flex',
              flexDirection: 'column-reverse',
              gap: '4px',
              boxSizing: 'border-box'
            }}
          >
            {Array.from({ length: targetCount }).map((_, idx) => {
              const isFilled = (collectedInLevel % (targetCount + 1)) > idx;
              // Ratio de progression du bloc (0 = bas, 1 = haut)
              const ratio = idx / Math.max(1, targetCount - 1);

              // Palette évolutive par palier :
              // Bas : Cyan / Azur | Milieu : Émeraude / Ambre | Haut : Or / Violet électrique
              let blockColor = '#38bdf8';
              let blockGlow = 'rgba(56, 189, 248, 0.7)';
              if (ratio >= 0.7) {
                blockColor = '#f59e0b';
                blockGlow = 'rgba(245, 158, 11, 0.8)';
              } else if (ratio >= 0.35) {
                blockColor = '#34d399';
                blockGlow = 'rgba(52, 211, 153, 0.75)';
              }

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    width: '100%',
                    borderRadius: '4px',
                    transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    background: isFilled
                      ? `linear-gradient(90deg, ${blockColor}dd, ${blockColor})`
                      : 'rgba(255, 255, 255, 0.06)',
                    border: isFilled
                      ? `1px solid ${blockColor}`
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: isFilled
                      ? `0 0 10px ${blockGlow}, inset 0 0 4px #ffffff66`
                      : 'none',
                    animation: isFilled ? 'battery-block-glow 2.5s ease-in-out infinite' : 'none'
                  }}
                />
              );
            })}
          </div>

          {/* Indicateur numérique discret sous la pile */}
          <div
            style={{
              marginTop: '4px',
              fontFamily: 'Orbitron, monospace',
              fontSize: '11px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.6)',
              letterSpacing: '1px'
            }}
          >
            {gameMode === 'constellation'
              ? `${collectedInLevel}/${targetCount}`
              : `${collectedInLevel % targetCount}/${targetCount}`}
          </div>
        </div>

        {/* Silhouette décorative zen au bas de l'écran (Nénuphars et roseaux) */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '90px',
            background: 'linear-gradient(0deg, rgba(6, 10, 20, 0.95) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 10
          }}
        />

        {/* Ondulations lumineuses au toucher */}
        {ripples.map((rip) => (
          <div
            key={rip.id}
            style={{
              position: 'absolute',
              left: `${rip.x}%`,
              top: `${rip.y}%`,
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              border: `2px solid ${rip.color}`,
              boxShadow: `0 0 15px ${rip.color}`,
              pointerEvents: 'none',
              animation: 'ripple-expand 0.9s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
              zIndex: 18
            }}
          />
        ))}

        {/* Lucioles interactives */}
        {fireflies.map((f) => (
          <div
            key={f.id}
            className="firefly-hitbox"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`
            }}
            onClick={(e) => handleCatchFirefly(e, f)}
            role="button"
            aria-label={`Luciole ${f.type?.name || ''}`}
          >
            <div
              className="firefly-core"
              style={{
                width: `${f.size}px`,
                height: `${f.size}px`,
                backgroundColor: f.color,
                color: f.color,
                boxShadow: `0 0 10px ${f.color}, 0 2px 6px rgba(0,0,0,0.5)`
              }}
            >
              {/* Noyau lumineux interne */}
              <div
                style={{
                  position: 'absolute',
                  inset: '25%',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  opacity: 0.95
                }}
              />
            </div>
          </div>
        ))}

        {/* Message d'encouragement pop-up lors d'une trouvaille réussie */}
        {encouragementMessage && (
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 17,
              padding: '8px 24px',
              borderRadius: '24px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: `1.5px solid ${targetFireflyType ? targetFireflyType.color : '#38bdf8'}`,
              color: '#f8fafc',
              fontSize: '1rem',
              fontWeight: 'bold',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(8px)',
              animation: 'cm-fade-in 0.2s ease-out'
            }}
          >
            {encouragementMessage}
          </div>
        )}

        {/* Consigne apaisante discrète en bas d'écran */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 12,
            color: '#94a3b8',
            fontSize: '0.88rem',
            fontWeight: '600',
            textAlign: 'center',
            pointerEvents: 'none',
            padding: '6px 16px',
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            maxWidth: '90%'
          }}
        >
          {gameMode === 'constellation'
            ? `Éclaire ${currentConstellation.name} (${collectedInLevel}/${targetCount})`
            : 'Explorez et touchez les lucioles correspondant à la couleur demandée'}
        </div>
      </div>

      {/* ÉCRAN DE VICTOIRE / CONSTELLATION COMPLÉTÉE */}
      {/* Unified Victory Overlay */}
      <GameVictoryOverlay
        isOpen={levelVictory}
        gameKey="fireflies"
        score={totalCollected * 50}
        title={currentConstellation.name.toUpperCase()}
        badgeIcon={currentConstellation.symbol}
        subtitle={currentConstellation.message}
        stats={[
          { label: 'Lucioles', value: totalCollected, color: '#facc15' },
          { label: 'Constellation', value: `${constellationIndex + 1}/${CONSTELLATIONS.length}`, color: '#38bdf8' }
        ]}
        detailsNode={(
          <div
            style={{
              position: 'relative',
              width: '240px',
              height: '140px',
              margin: '0 auto',
              borderRadius: '16px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              overflow: 'hidden'
            }}
          >
            <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
              {currentConstellation.lines.map(([i1, i2], idx) => {
                const s1 = currentConstellation.stars[i1];
                const s2 = currentConstellation.stars[i2];
                return (
                  <line
                    key={idx}
                    x1={`${s1.x}%`}
                    y1={`${s1.y}%`}
                    x2={`${s2.x}%`}
                    y2={`${s2.y}%`}
                    stroke="#38bdf8"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                  />
                );
              })}
            </svg>
            {currentConstellation.stars.map((s, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 8px #38bdf8'
                }}
              />
            ))}
          </div>
        )}
        onRestart={() => { setLevelVictory(false); setCollectedInLevel(0); }}
        restartText="🔄 Rejouer"
        onContinue={handleNextLevel}
        continueText="Constellation Suivante ➔"
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
