import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import IntermissionProposal from '../components/IntermissionProposal';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { shuffle, randomChoice } from '../utils/commonUtils';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';
import { useGameCustomizations } from '../hooks/useGameCustomizations';
import FindCharlieCollection from './FindCharlieCollection';
import { renderTargetIcon, renderSceneBackground, renderCrowdDecoy } from './charlieAssets';

// Types d'objets cibles à retrouver
const TARGET_DEFINITIONS = {
  charlie: {
    id: 'charlie',
    name: 'Charlie',
    icon: '🕵️‍♂️',
    points: 100,
    color: '#ef4444',
    badge: 'Cible principale'
  },
  dog: {
    id: 'dog',
    name: 'Ouaf le Chien',
    icon: '🐶',
    points: 60,
    color: '#f59e0b',
    badge: 'Compagnon fidèle'
  },
  glasses: {
    id: 'glasses',
    name: 'Lunettes',
    icon: '👓',
    points: 40,
    color: '#0284c7',
    badge: 'Objet égaré'
  },
  cane: {
    id: 'cane',
    name: 'Canne de marche',
    icon: '🦯',
    points: 40,
    color: '#854d0e',
    badge: 'Objet égaré'
  },
  camera: {
    id: 'camera',
    name: 'Appareil photo',
    icon: '📷',
    points: 40,
    color: '#475569',
    badge: 'Souvenir'
  },
  key: {
    id: 'key',
    name: 'Clé secrète',
    icon: '🗝️',
    points: 40,
    color: '#eab308',
    badge: 'Trésor'
  },
  beanie: {
    id: 'beanie',
    name: 'Bonnet rayé',
    icon: '🧶',
    points: 40,
    color: '#dc2626',
    badge: 'Vêtement'
  },
  compass: {
    id: 'compass',
    name: 'Boussole',
    icon: '🧭',
    points: 40,
    color: '#0d9488',
    badge: 'Navigation'
  }
};

// Figurants et leurres de foule vectoriels SVG (dessinés à la main, zéro émoji de téléphone)
const DECOY_SYMBOLS = [
  { key: 'decoy_stripes_green', color: '#16a34a', label: 'Promeneur Rayé Vert' },
  { key: 'decoy_stripes_blue', color: '#2563eb', label: 'Promeneur Rayé Bleu' },
  { key: 'decoy_casual_red', color: '#dc2626', label: 'Promeneur Rouge' },
  { key: 'decoy_casual_purple', color: '#9333ea', label: 'Promeneur Violet' },
  { key: 'decoy_dress_yellow', color: '#eab308', label: 'Promeneuse Robe Jaune' },
  { key: 'decoy_runner_orange', color: '#f97316', label: 'Coureur Athlétique' },
  { key: 'decoy_dog', color: '#b45309', label: 'Chien Roux' },
  { key: 'decoy_cat', color: '#64748b', label: 'Chat Tigré' },
  { key: 'decoy_umbrella', color: '#ef4444', label: 'Parasol de Plage' },
  { key: 'decoy_balloon', color: '#dc2626', label: 'Ballon Rouge' },
  { key: 'decoy_beach_ball', color: '#0ea5e9', label: 'Ballon Gonflable' },
  { key: 'decoy_icecream', color: '#f43f5e', label: 'Cornet de Glace' },
  { key: 'decoy_tent', color: '#dc2626', label: 'Tente Rayée' },
  { key: 'decoy_kite', color: '#a855f7', label: 'Cerf-Volant' },
  { key: 'decoy_suitcase', color: '#854d0e', label: 'Valise Vintage' },
  { key: 'decoy_bicycle', color: '#0d9488', label: 'Bicyclette Rétro' }
];

// Configuration des manches : durée de base, seuil de score et types d'objets
const ROUNDS_CONFIG = [
  {
    round: 1,
    name: 'Manche 1 : Les Premiers Pas',
    baseTime: 60,
    targetScoreToPass: 180,
    requiredItems: ['charlie', 'dog', 'glasses', 'cane']
  },
  {
    round: 2,
    name: 'Manche 2 : La Foule s’Anime',
    baseTime: 55,
    targetScoreToPass: 240,
    requiredItems: ['charlie', 'dog', 'camera', 'key', 'beanie']
  },
  {
    round: 3,
    name: 'Manche 3 : Grand Rassemblement',
    baseTime: 50,
    targetScoreToPass: 280,
    requiredItems: ['charlie', 'glasses', 'cane', 'camera', 'compass', 'key']
  },
  {
    round: 4,
    name: 'Manche 4 : L’Œil de Lynx',
    baseTime: 45,
    targetScoreToPass: 320,
    requiredItems: ['charlie', 'dog', 'glasses', 'cane', 'camera', 'key', 'beanie']
  },
  {
    round: 5,
    name: 'Manche 5 : Le Défi Suprême',
    baseTime: 40,
    targetScoreToPass: 360,
    requiredItems: ['charlie', 'dog', 'glasses', 'cane', 'camera', 'key', 'beanie', 'compass']
  }
];

// Mots d'encouragement bienveillants
const ENCOURAGEMENTS = [
  "Votre regard balaie la foule avec une magnifique finesse.",
  "Chaque trouvaille aiguise votre perception spatiale et votre concentration.",
  "Prenez un instant pour savourer cette belle clarté visuelle.",
  "Bravo ! Vous distinguez les détails les plus subtils avec aisance.",
  "Votre persévérance et votre calme font toute la différence."
];

// Génération procédurale d'une foule riche et d'objets bien disséminés
function generateCrowdScene(roundConfig, sceneType = 'beach') {
  const elements = [];
  const occupiedSpots = [];

  // Vérifie si un spot est trop proche d'un autre
  const isTooClose = (x, y, minDist = 6.5) => {
    return occupiedSpots.some((p) => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < minDist;
    });
  };

  const getFreeSpot = (minDist = 6.5) => {
    let attempts = 0;
    while (attempts < 150) {
      const x = Math.floor(Math.random() * 84) + 8; // 8% à 92%
      const y = Math.floor(Math.random() * 80) + 10; // 10% à 90%
      if (!isTooClose(x, y, minDist)) {
        occupiedSpots.push({ x, y });
        return { x, y };
      }
      attempts++;
    }
    // Fallback
    const fx = Math.floor(Math.random() * 84) + 8;
    const fy = Math.floor(Math.random() * 80) + 10;
    occupiedSpots.push({ x: fx, y: fy });
    return { x: fx, y: fy };
  };

  // 1. Placer les cibles obligatoires de la manche
  const targets = roundConfig.requiredItems.map((targetKey, index) => {
    const def = TARGET_DEFINITIONS[targetKey];
    const spot = getFreeSpot(7.5);
    return {
      id: `target_${targetKey}_${index}`,
      type: 'target',
      targetKey,
      name: def.name,
      icon: def.icon,
      points: def.points,
      color: def.color,
      x: spot.x,
      y: spot.y,
      found: false,
      rotation: (Math.random() * 10 - 5).toFixed(1)
    };
  });

  // 2. Placer des leurres de foule (entre 50 et 75 figurants)
  const decoyCount = 55 + roundConfig.round * 4;
  for (let i = 0; i < decoyCount; i++) {
    const decoy = randomChoice(DECOY_SYMBOLS);
    const spot = getFreeSpot(4.8);
    elements.push({
      id: `decoy_${i}`,
      type: 'decoy',
      decoyKey: decoy.key,
      name: decoy.label,
      color: decoy.color,
      x: spot.x,
      y: spot.y,
      scale: (Math.random() * 0.3 + 0.85).toFixed(2),
      rotation: (Math.random() * 16 - 8).toFixed(1)
    });
  }

  return { targets, elements };
}

export default function FindCharlie({
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
  intermissionGames,
  skipIntro = false
}) {
  const confirm = useConfirm();

  // Customisations
  const { custom, updateCustom } = useGameCustomizations('findcharlie', {
    scene: 'beach',
    timerMode: 'standard',
    elementSize: 'standard'
  });

  const sizeScale = useMemo(() => {
    if (custom.elementSize === 'giant') return 1.4;
    if (custom.elementSize === 'large') return 1.2;
    return 1.0;
  }, [custom.elementSize]);

  const [sceneType, setSceneType] = useState(() => custom.scene || 'beach');
  const [timerMode, setTimerMode] = useState(() => custom.timerMode || 'standard');
  const [showCollection, setShowCollection] = useState(false);
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);

  // Manche actuelle
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const roundConfig = useMemo(() => {
    const idx = (currentRoundNumber - 1) % ROUNDS_CONFIG.length;
    return ROUNDS_CONFIG[idx];
  }, [currentRoundNumber]);

  // Objectif en entracte : nombre de manches à remporter
  const targetIntermissionRounds = isIntermission
    ? (Number(intermissionConfig?.findcharlie?.roundsCount) || 3)
    : ROUNDS_CONFIG.length;
  const [intermissionRoundsWon, setIntermissionRoundsWon] = useState(0);

  // Génération de la scène
  const [sceneData, setSceneData] = useState(() => generateCrowdScene(roundConfig, sceneType));
  const [targets, setTargets] = useState(() => sceneData.targets);

  // Chronomètre de la manche
  const initialTime = useMemo(() => {
    let t = roundConfig.baseTime;
    if (timerMode === 'relax') t += 15;
    if (timerMode === 'express') t -= 15;
    if (isIntermission && intermissionDifficulty === 'facile') t += 15;
    if (isIntermission && intermissionDifficulty === 'difficile') t -= 10;
    return Math.max(25, t);
  }, [roundConfig, timerMode, isIntermission, intermissionDifficulty]);

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [highScore, setHighScore] = useState(() => storage.getNumber('retrovision_findcharlie_highscore', 0));

  // États de manche
  const [roundCompleted, setRoundCompleted] = useState(false);
  const [isRoundWon, setIsRoundWon] = useState(false);
  const [encouragement, setEncouragement] = useState('');
  const [hintTargetId, setHintTargetId] = useState(null);
  const [floatingPoints, setFloatingPoints] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);

  const timerRef = useRef(null);

  // Initialiser / réinitialiser une manche
  const initRound = useCallback((roundNum = currentRoundNumber) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const cfg = ROUNDS_CONFIG[(roundNum - 1) % ROUNDS_CONFIG.length];
    const newScene = generateCrowdScene(cfg, sceneType);
    setSceneData(newScene);
    setTargets(newScene.targets);
    setRoundScore(0);
    setRoundCompleted(false);
    setIsRoundWon(false);
    setHintTargetId(null);
    setFloatingPoints([]);

    let t = cfg.baseTime;
    if (timerMode === 'relax') t += 15;
    if (timerMode === 'express') t -= 15;
    if (isIntermission && intermissionDifficulty === 'facile') t += 15;
    if (isIntermission && intermissionDifficulty === 'difficile') t -= 10;
    const dur = Math.max(25, t);

    setTimeLeft(dur);
    setIsTimerRunning(true);
  }, [currentRoundNumber, sceneType, timerMode, isIntermission, intermissionDifficulty]);

  // Lancement automatique du chrono après l'intro
  useEffect(() => {
    if (!showIntro) {
      initRound(currentRoundNumber);
    }
  }, [showIntro, initRound, currentRoundNumber]);

  // Boucle du chronomètre
  useEffect(() => {
    if (isTimerRunning && !roundCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          if (prev <= 10 && prev > 1) {
            sound.playClick?.();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, roundCompleted]);

  // Fin du temps écoulé
  const handleTimeUp = () => {
    setIsTimerRunning(false);
    setRoundCompleted(true);
    // Vérifier si le score accumulé dépasse le seuil
    const won = roundScore >= roundConfig.targetScoreToPass;
    setIsRoundWon(won);
    if (won) {
      handleRoundVictory(0);
    } else {
      sound.playExplosion?.();
      haptic.warning?.();
      setEncouragement("Le temps est écoulé ! Vous étiez tout près, réessayez pour franchir le seuil.");
    }
  };

  // Victoire de la manche
  const handleRoundVictory = (timeBonus = 0) => {
    setIsTimerRunning(false);
    setRoundCompleted(true);
    setIsRoundWon(true);
    sound.playChapterVictory?.() || sound.playScore?.();
    haptic.success();
    setEncouragement(randomChoice(ENCOURAGEMENTS));

    const finalRoundScore = roundScore + timeBonus;
    const newTotal = totalScore + finalRoundScore;
    setTotalScore(newTotal);

    if (newTotal > highScore) {
      setHighScore(newTotal);
      storage.setItem('retrovision_findcharlie_highscore', newTotal.toString());
    }
    if (onScoreSave) onScoreSave('findcharlie', newTotal);

    // Progression en entracte
    if (isIntermission) {
      const nextWon = intermissionRoundsWon + 1;
      setIntermissionRoundsWon(nextWon);
    }
  };

  // Clic sur une cible
  const handleTargetClick = (target) => {
    if (target.found || roundCompleted || !isTimerRunning) return;

    haptic.success();
    sound.playScore();

    // Marquer comme trouvée
    setTargets((prev) =>
      prev.map((t) => (t.id === target.id ? { ...t, found: true } : t))
    );

    // Points de la cible
    const pts = target.points;
    const nextRoundScore = roundScore + pts;
    setRoundScore(nextRoundScore);

    // Effet visuel flottant +pts
    const animId = Date.now() + Math.random();
    setFloatingPoints((prev) => [
      ...prev,
      { id: animId, x: target.x, y: target.y, text: `+${pts}` }
    ]);
    setTimeout(() => {
      setFloatingPoints((prev) => prev.filter((p) => p.id !== animId));
    }, 1200);

    // Vérifier si toutes les cibles sont trouvées pour finir avec bonus de temps
    const remainingTargets = targets.filter((t) => t.id !== target.id && !t.found);
    if (remainingTargets.length === 0) {
      // Toutes les cibles trouvées ! Bonus de temps restant (2 pts par seconde)
      const timeBonus = Math.floor(timeLeft * 2);
      handleRoundVictory(timeBonus);
    }
  };

  // Clic sur le décor / leurre (léger bruitage neutre)
  const handleDecoyClick = () => {
    if (roundCompleted || !isTimerRunning) return;
    sound.playClick();
    haptic.tap();
  };

  // Utiliser un indice
  const handleUseHint = () => {
    if (roundCompleted || !isTimerRunning || hintTargetId) return;
    const unfound = targets.filter((t) => !t.found);
    if (unfound.length === 0) return;

    const candidate = randomChoice(unfound);
    setHintTargetId(candidate.id);
    sound.playPowerup?.();
    haptic.tap();

    setTimeout(() => {
      setHintTargetId(null);
    }, 2500);
  };

  // Passer à la manche suivante
  const handleNextRound = () => {
    const nextRound = currentRoundNumber + 1;
    setCurrentRoundNumber(nextRound);
    initRound(nextRound);
  };

  // Quitter avec confirmation
  const handleBackWithConfirm = async () => {
    if (isTimerRunning && !roundCompleted) {
      const ok = await confirm({
        title: 'Quitter la recherche ?',
        message: 'Une manche est en cours. Vos points de cette manche ne seront pas enregistrés.',
        confirmText: 'Quitter',
        cancelText: 'Continuer',
        confirmVariant: 'danger'
      });
      if (!ok) return;
    }
    onBack();
  };

  // Décor d'arrière-plan de la scène
  const sceneBg = useMemo(() => {
    switch (sceneType) {
      case 'carnival':
        return 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 50%, #f5d0fe 100%)';
      case 'fair':
        return 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)';
      case 'market':
        return 'linear-gradient(135deg, #fefce8 0%, #fef9c3 50%, #fef08a 100%)';
      case 'beach':
      default:
        return 'linear-gradient(135deg, #f0fdfa 0%, #e0f2fe 45%, #fef3c7 100%)';
    }
  }, [sceneType]);

  const progressRatio = isIntermission
    ? intermissionRoundsWon / targetIntermissionRounds
    : (currentRoundNumber - 1) / ROUNDS_CONFIG.length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        minHeight: '100vh',
        boxSizing: 'border-box',
        padding: '14px',
        color: '#0f172a',
        background: '#f8fafc',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
        position: 'relative'
      }}
    >
      <style>{`
        @keyframes targetPulse {
          0% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0)); }
          50% { transform: scale(1.35); filter: drop-shadow(0 0 14px rgba(239, 68, 68, 0.8)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(239, 68, 68, 0)); }
        }
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }
        .charlie-target-hint {
          animation: targetPulse 0.9s infinite ease-in-out;
          z-index: 30 !important;
        }
      `}</style>

      {/* Intro Animation */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Trouvez Charlie !"
          icon="🕵️‍♂️"
          colors={['#ef4444', '#ffffff', '#0284c7']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Repère d'ancrage visuel gauche */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          background: '#ef4444',
          zIndex: 40,
          pointerEvents: 'none'
        }}
      />

      {/* En-tête : Intermission ou Standard */}
      {isIntermission ? (
        <IntermissionHeader
          instructionText={`Entracte : Gagnez ${targetIntermissionRounds} manches ! Manche ${intermissionRoundsWon + 1} / ${targetIntermissionRounds}`}
          onRestart={() => initRound(currentRoundNumber)}
          onOtherGame={onIntermissionRequest}
          onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
          replaySame={replaySameIntermission}
          onToggleReplaySame={onToggleReplaySameIntermission}
          progress={progressRatio}
        />
      ) : (
        <GameHeader
          title="TROUVEZ CHARLIE !"
          subtitle="Balayage visuel & cache-cache géant"
          onBack={handleBackWithConfirm}
          onRestart={() => initRound(currentRoundNumber)}
          showShop={true}
          onShop={() => setShowCollection(true)}
          onOpenShop={() => setShowCollection(true)}
          onLaunchIntermission={onLaunchIntermission}
        />
      )}

      {/* Barre de contrôles & HUD : Chronomètre, Score et Seuil */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '920px',
          flexWrap: 'wrap',
          gap: '12px',
          margin: '12px 0 14px 0',
          padding: '12px 18px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
        }}
      >
        {/* Info Manche & Titre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '6px 14px',
              borderRadius: '10px',
              background: '#fee2e2',
              color: '#dc2626',
              fontWeight: '900',
              fontSize: '13px',
              border: '1px solid #fca5a5'
            }}
          >
            {roundConfig.name}
          </span>
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            title="Activer/désactiver le zoom d’observation"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              minHeight: '34px',
              borderRadius: '8px',
              fontWeight: '700',
              cursor: 'pointer',
              background: isZoomed ? '#0284c7' : '#f1f5f9',
              color: isZoomed ? '#ffffff' : '#334155',
              border: isZoomed ? '1px solid #0284c7' : '1px solid #cbd5e1'
            }}
          >
            {isZoomed ? '🔍 Zoom ×1.4' : '🔍 Vue Globale'}
          </button>
        </div>

        {/* Jauge de Score & Seuil */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Score de la manche vs Seuil */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>🎯</span>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '800' }}>
                Score de Manche / Seuil
              </div>
              <div style={{ fontSize: '18px', fontWeight: '900' }}>
                <span style={{ color: roundScore >= roundConfig.targetScoreToPass ? '#16a34a' : '#d97706' }}>
                  {roundScore}
                </span>
                <span style={{ color: '#94a3b8', margin: '0 4px' }}>/</span>
                <span style={{ color: '#0284c7' }}>{roundConfig.targetScoreToPass} pts requis</span>
              </div>
            </div>
          </div>

          {/* Bouton Indice */}
          <button
            type="button"
            onClick={handleUseHint}
            disabled={!isTimerRunning || roundCompleted || hintTargetId}
            title="Mettre en surbrillance un objet"
            style={{
              padding: '8px 16px',
              minHeight: '38px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '800',
              background: '#fffbeb',
              border: '1.5px solid #f59e0b',
              color: '#b45309',
              cursor: !isTimerRunning || roundCompleted || hintTargetId ? 'not-allowed' : 'pointer',
              opacity: !isTimerRunning || roundCompleted || hintTargetId ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>💡</span>
            <span>Indice</span>
          </button>
        </div>
      </div>

      {/* Barre d'objectifs : liste des vignettes des cibles à trouver (agrandies) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
          maxWidth: '920px',
          overflowX: 'auto',
          padding: '10px 14px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          marginBottom: '14px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          À trouver :
        </div>
        {targets.map((target) => (
          <div
            key={target.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 16px',
              borderRadius: '14px',
              background: target.found ? '#dcfce7' : '#f8fafc',
              border: target.found ? '2.5px solid #22c55e' : '1.5px solid #cbd5e1',
              color: target.found ? '#15803d' : '#1e293b',
              fontSize: '16px',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              boxShadow: target.found ? '0 2px 8px rgba(34, 197, 94, 0.2)' : '0 2px 4px rgba(0,0,0,0.03)',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px' }}>
              {renderTargetIcon(target.targetKey, 38)}
            </div>
            <span style={{ fontSize: '16px', fontWeight: '800' }}>{target.name}</span>
            {target.found ? (
              <span style={{ color: '#16a34a', fontWeight: '900', fontSize: '18px' }}>✓</span>
            ) : (
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>+{target.points}</span>
            )}
          </div>
        ))}
      </div>

      {/* Plateau de recherche illustré interactif avec DÉCOR DE FOND IMMERSIF */}
      <div
        onClick={handleDecoyClick}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '920px',
          height: isZoomed ? '680px' : '520px',
          borderRadius: '20px',
          border: '2px solid #cbd5e1',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          cursor: isTimerRunning && !roundCompleted ? 'crosshair' : 'default',
          transition: 'height 0.3s ease',
          userSelect: 'none'
        }}
      >
        {/* 1. DÉCOR DE FOND IMMERSIF PANORAMIQUE (Plage, Fête Foraine, etc.) */}
        {renderSceneBackground(custom.scene || 'beach')}

        {/* 2. CHRONOMÈTRE GÉANT À L'INTÉRIEUR DE LA GRILLE */}
        <div
          style={{
            position: 'absolute',
            top: '14px',
            right: '16px',
            zIndex: 35,
            background: timeLeft <= 10 ? 'rgba(220, 38, 38, 0.94)' : 'rgba(15, 23, 42, 0.90)',
            backdropFilter: 'blur(10px)',
            border: timeLeft <= 10 ? '3px solid #fecaca' : '2.5px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '18px',
            padding: '10px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: timeLeft <= 10
              ? '0 0 24px rgba(239, 68, 68, 0.8), 0 8px 24px rgba(0,0,0,0.4)'
              : '0 8px 24px rgba(0,0,0,0.4)',
            color: '#ffffff',
            pointerEvents: 'none',
            transition: 'all 0.3s ease'
          }}
        >
          <span style={{ fontSize: '32px' }}>⏱️</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.85, fontWeight: '800' }}>
              CHRONO
            </div>
            <div
              style={{
                fontSize: '36px',
                fontWeight: '900',
                color: timeLeft <= 10 ? '#ffffff' : '#f8fafc',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1
              }}
            >
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* 3. Figurants de foule (Leurres) en graphismes vectoriels SVG HAUTE FIDÉLITÉ */}
        {sceneData.elements.map((decoy) => (
          <div
            key={decoy.id}
            style={{
              position: 'absolute',
              left: `${decoy.x}%`,
              top: `${decoy.y}%`,
              transform: `translate(-50%, -50%) scale(${decoy.scale}) rotate(${decoy.rotation}deg)`,
              pointerEvents: 'none',
              transition: 'transform 0.15s ease',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))'
            }}
          >
            {renderCrowdDecoy(decoy.decoyKey, Math.round(44 * sizeScale), decoy.color)}
          </div>
        ))}

        {/* 4. Cibles réelles avec SVG HAUTE FIDÉLITÉ AGRANDI */}
        {targets.map((target) => {
          const isHinted = hintTargetId === target.id;
          const baseSize = target.targetKey === 'charlie' ? 72 : target.targetKey === 'dog' ? 64 : 54;
          const targetSize = Math.round(baseSize * sizeScale);

          return (
            <div
              key={target.id}
              onClick={(e) => {
                e.stopPropagation();
                handleTargetClick(target);
              }}
              className={isHinted ? 'charlie-target-hint' : ''}
              title={target.found ? `${target.name} (Trouvé !)` : 'Objet caché'}
              style={{
                position: 'absolute',
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: `translate(-50%, -50%) rotate(${target.rotation}deg) scale(${target.found ? 1.15 : 1})`,
                padding: '4px',
                borderRadius: '50%',
                background: target.found
                  ? 'rgba(34, 197, 94, 0.3)'
                  : isHinted
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'transparent',
                border: target.found
                  ? '2.5px solid #22c55e'
                  : isHinted
                  ? '2.5px dashed #ef4444'
                  : 'none',
                cursor: target.found ? 'default' : 'pointer',
                zIndex: target.found ? 10 : 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {renderTargetIcon(target.targetKey, targetSize)}
              {target.found && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    fontSize: '12px',
                    fontWeight: '900',
                    color: '#ffffff',
                    background: '#16a34a',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
                  }}
                >
                  ✓
                </span>
              )}
            </div>
          );
        })}

        {/* 3. Textes flottants de score (+100 / +40) */}
        {floatingPoints.map((pt) => (
          <div
            key={pt.id}
            style={{
              position: 'absolute',
              left: `${pt.x}%`,
              top: `${pt.y}%`,
              transform: 'translate(-50%, -50%)',
              animation: 'floatUp 1.2s forwards ease-out',
              color: '#16a34a',
              fontWeight: '900',
              fontSize: '18px',
              textShadow: '0 2px 6px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
              zIndex: 35
            }}
          >
            {pt.text}
          </div>
        ))}
      </div>

      {/* Modal de Victoire de Manche Unifié */}
      <GameVictoryOverlay
        isOpen={roundCompleted && isRoundWon}
        gameKey="findcharlie"
        score={roundScore}
        title="MANCHE REMPORTÉE !"
        badgeIcon="🎉"
        subtitle={encouragement}
        stats={[
          { label: 'Score Manche', value: `${roundScore} pts`, color: '#22c55e' },
          { label: 'Seuil Requis', value: `${roundConfig.targetScoreToPass} pts`, color: '#38bdf8' },
          { label: 'Total Cumulé', value: `${totalScore} pts`, color: '#f59e0b' }
        ]}
        onRestart={() => initRound(currentRoundNumber)}
        restartText="🔄 Rejouer la manche"
        onContinue={handleNextRound}
        continueText="Manche Suivante ➡️"
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

      {/* Modal d'Échec de Manche (Temps écoulé sous le seuil) */}
      {roundCompleted && !isRoundWon && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px'
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '28px 24px',
              maxWidth: '440px',
              width: '100%',
              textAlign: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              border: '2px solid #f97316'
            }}
          >
            <div style={{ fontSize: '44px', marginBottom: '8px' }}>⏱️</div>
            <h2 style={{ color: '#ea580c', margin: '0 0 6px 0', fontSize: '1.5rem', fontWeight: '900' }}>
              TEMPS ÉCOULÉ !
            </h2>
            <p style={{ color: '#475569', fontSize: '0.95rem', margin: '0 0 16px 0', fontWeight: '500' }}>
              {encouragement}
            </p>

            <div
              style={{
                background: '#fff7ed',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '18px',
                border: '1px solid #fed7aa',
                fontSize: '14px',
                fontWeight: '700',
                color: '#c2410c'
              }}
            >
              Score obtenu : {roundScore} pts (Seuil à battre : {roundConfig.targetScoreToPass} pts)
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={() => initRound(currentRoundNumber)}
                style={{
                  minHeight: '46px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '14px',
                  background: '#ea580c',
                  color: '#ffffff',
                  border: 'none',
                  flex: 1,
                  cursor: 'pointer'
                }}
              >
                Réessayer la manche 🔄
              </button>
              {isIntermission && (
                <button
                  type="button"
                  onClick={() => onIntermissionComplete && onIntermissionComplete(false)}
                  style={{
                    minHeight: '46px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '14px',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  Passer ⏭
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Boutique Trouvez Charlie */}
      {showCollection && (
        <FindCharlieCollection
          currentSelections={{
            scene: custom.scene || 'beach',
            timerMode: custom.timerMode || 'standard',
            elementSize: custom.elementSize || 'standard'
          }}
          onSelect={(catKey, itemId) => {
            updateCustom(catKey, itemId);
            if (catKey === 'scene') setSceneType(itemId);
            if (catKey === 'timerMode') setTimerMode(itemId);
          }}
          onClose={() => setShowCollection(false)}
        />
      )}
    </div>
  );
}
