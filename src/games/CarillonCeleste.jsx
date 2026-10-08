import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import GameVictoryOverlay from '../components/GameVictoryOverlay';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { getGameConfig, updateGameConfig } from '../utils/config';
import { haptic } from '../utils/haptics';
import { randomChoice } from '../utils/commonUtils';
import { useConfirm } from '../components/ConfirmContext';
import CarillonCelesteCollection from './CarillonCelesteCollection';

// Cloches pentatoniques zen (Do, Ré, Mi, Sol, La) - Fréquences réelles en Hz et longueurs acoustiques proportionnelles
const BELLS_CONFIG = [
  { id: 'bell_1', note: 'Do', freq: 261.63, label: 'Carillon Boréal', color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.8)', tubeHeight: 145, icon: '❄️', isLeftAnchor: true },
  { id: 'bell_2', note: 'Ré', freq: 293.66, label: 'Carillon Émeraude', color: '#10b981', glow: 'rgba(16, 185, 129, 0.8)', tubeHeight: 132, icon: '🌿' },
  { id: 'bell_3', note: 'Mi', freq: 329.63, label: 'Carillon Solaire', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.8)', tubeHeight: 120, icon: '☀️' },
  { id: 'bell_4', note: 'Sol', freq: 392.00, label: 'Carillon Améthyste', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)', tubeHeight: 108, icon: '🔮' },
  { id: 'bell_5', note: 'La', freq: 440.00, label: 'Carillon Céleste', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.8)', tubeHeight: 96, icon: '✨' }
];

const ENCOURAGEMENTS = [
  "Votre écoute et votre regard s'accordent en parfaite harmonie.",
  "La résonance des carillons apaise l'esprit et renforce votre mémoire.",
  "Chaque onde céleste retrouvée guide votre attention avec douceur.",
  "Prenez le temps d'écouter les vibrations, votre concentration est remarquable."
];

// Synthétiseur audio Web Audio API pour carillons purs harmoniques
class ChimeSynth {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playChime(freq, isLeft = false) {
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Fondamentale
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      // Harmonique métallique cristalline (2.76x)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.76, now);

      // Panning acoustique : ancrage gauche amplifié si isLeft
      const panner = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
      if (panner) {
        panner.pan.setValueAtTime(isLeft ? -0.7 : 0, now);
      }

      // Enveloppes de sonnerie de cloche
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      gain2.gain.setValueAtTime(0, now);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.015);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc1.connect(gain1);
      osc2.connect(gain2);

      const target = panner || this.ctx.destination;
      gain1.connect(target);
      gain2.connect(target);
      if (panner) panner.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.9);
      osc2.stop(now + 1.0);
    } catch {
      // Ignorer si contexte indisponible
    }
  }
}

const synth = new ChimeSynth();

export default function CarillonCeleste({
  onBack,
  onScoreSave,
  onLaunchIntermission,
  isIntermission = false,
  intermissionDifficulty = 'facile',
  intermissionConfig,
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  upcomingIntermission,
  onSelectUpcomingIntermission,
  onShuffleUpcomingIntermission,
  intermissionGames,
  skipIntro = false
}) {
  const confirm = useConfirm();
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);
  const [showCollection, setShowCollection] = useState(false);
  const [themeId, setThemeId] = useState(() => getGameConfig('carillon', 'theme', 'celestial'));
  const [customTargetRounds, setCustomTargetRounds] = useState(() => getGameConfig('carillon', 'rounds', 5));
  const [difficulty] = useState(() => {
    if (isIntermission) return intermissionDifficulty || 'facile';
    return storage.getItem('retrovision_carillon_diff', 'moyen') || 'moyen';
  });

  // Cloches actives selon difficulté
  const activeBells = useMemo(
    () => (difficulty === 'facile' ? BELLS_CONFIG.slice(0, 4) : BELLS_CONFIG),
    [difficulty]
  );
  // Séquence cible
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [activeBellId, setActiveBellId] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => storage.getNumber('retrovision_carillon_highscore', 0));
  const [isWon, setIsWon] = useState(false);
  const [failedWave, setFailedWave] = useState(false);
  const [encouragement, setEncouragement] = useState('');

  // Mode Score en entracte ou Rounds personnalisés en mode standard
  const targetScore = isIntermission
    ? (Number(intermissionConfig?.carillon?.target) || 100)
    : customTargetRounds;

  // Référence pour nettoyer tous les timers en cours et éviter les chevauchements
  const timersRef = useRef([]);
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setIsPlayingSequence(false);
  }, []);

  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // Jouer une séquence de cloches de manière fiable et synchrone
  const playBellSequence = useCallback((seq) => {
    clearAllTimers();
    setIsPlayingSequence(true);

    seq.forEach((bellId, index) => {
      const delay = (index + 1) * 750;
      const t1 = setTimeout(() => {
        const bell = BELLS_CONFIG.find((b) => b.id === bellId);
        if (bell) {
          synth.playChime(bell.freq, bell.isLeftAnchor);
          setActiveBellId(bell.id);
          const tOff = setTimeout(() => setActiveBellId(null), 450);
          timersRef.current.push(tOff);
        }
      }, delay);
      timersRef.current.push(t1);
    });

    const totalDuration = (seq.length + 1) * 750;
    const endTimer = setTimeout(() => {
      setIsPlayingSequence(false);
    }, totalDuration);
    timersRef.current.push(endTimer);
  }, [clearAllTimers]);

  // Lancement d'une manche : longueurs aléatoires non-linéaires en entracte, ou progression linéaire en standard
  const startNewRound = useCallback((roundNum) => {
    setPlayerStep(0);
    let seqLen;
    if (isIntermission) {
      // En entracte : longueurs de sonorités aléatoires pour casser la monotonie linéaire
      if (difficulty === 'facile') {
        seqLen = Math.floor(Math.random() * 2) + 2; // 2 ou 3 sons
      } else if (difficulty === 'difficile') {
        seqLen = Math.floor(Math.random() * 3) + 4; // 4, 5 ou 6 sons
      } else {
        seqLen = Math.floor(Math.random() * 3) + 3; // 3, 4 ou 5 sons
      }
    } else {
      seqLen = roundNum + 1; // 2 notes au round 1, 3 notes au round 2, etc.
    }

    const newSeq = [];
    let lastBellId = null;
    for (let i = 0; i < seqLen; i++) {
      // Éviter de répéter immédiatement la même cloche 2 fois de suite
      const availableChoices = activeBells.filter((b) => b.id !== lastBellId);
      const chosenBell = randomChoice(availableChoices.length > 0 ? availableChoices : activeBells);
      newSeq.push(chosenBell.id);
      lastBellId = chosenBell.id;
    }
    setSequence(newSeq);
    playBellSequence(newSeq);
  }, [activeBells, playBellSequence, isIntermission, difficulty]);

  // Initialisation
  const initGame = useCallback(() => {
    clearAllTimers();
    setActiveBellId(null);
    setRound(1);
    setScore(0);
    setIsWon(false);
    setFailedWave(false);
    setEncouragement('');
    startNewRound(1);
  }, [clearAllTimers, startNewRound]);

  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        initGame();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showIntro, initGame]);

  // Clic joueur sur une cloche
  const handleBellClick = (bell) => {
    if (isPlayingSequence || isWon) return;

    haptic.tap();
    synth.playChime(bell.freq, bell.isLeftAnchor);
    setActiveBellId(bell.id);
    const tapTimer = setTimeout(() => setActiveBellId(null), 300);
    timersRef.current.push(tapTimer);

    const expectedBellId = sequence[playerStep];
    if (bell.id === expectedBellId) {
      const nextStep = playerStep + 1;
      setPlayerStep(nextStep);

      if (nextStep >= sequence.length) {
        // Mélodie réussie !
        sound.playScore();
        const pointsEarned = sequence.length * 10;
        const nextScore = score + pointsEarned;
        setScore(nextScore);

        if (nextScore > highScore) {
          setHighScore(nextScore);
          storage.setItem('retrovision_carillon_highscore', nextScore.toString());
        }

        if (isIntermission) {
          // Mode Score en entracte : atteindre targetScore
          if (nextScore >= targetScore) {
            setIsWon(true);
            sound.playChapterVictory?.() || sound.playSudokuSuccess?.();
            setEncouragement(`Harmonie céleste ! Vous avez atteint l'objectif de ${targetScore} points avec ${nextScore} points.`);
            if (onScoreSave) onScoreSave('carillon', nextScore);

            if (replaySameIntermission) {
              if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
              const replayTimer = setTimeout(() => initGame(), 1000);
              timersRef.current.push(replayTimer);
            }
          } else {
            // Passer à une nouvelle séquence aléatoire
            const nextRoundNum = round + 1;
            setRound(nextRoundNum);
            const nextTimer = setTimeout(() => {
              startNewRound(nextRoundNum);
            }, 900);
            timersRef.current.push(nextTimer);
          }
        } else {
          // En mode standard : objectif customTargetRounds (longueur max)
          if (round >= customTargetRounds) {
            setIsWon(true);
            sound.playSudokuSuccess();
            setEncouragement(randomChoice(ENCOURAGEMENTS));
            if (onScoreSave) onScoreSave('carillon', nextScore);
          } else {
            const nextRoundNum = round + 1;
            setRound(nextRoundNum);
            const nextTimer = setTimeout(() => {
              startNewRound(nextRoundNum);
            }, 900);
            timersRef.current.push(nextTimer);
          }
        }
      }
    } else {
      // Erreur du joueur
      sound.playClick();
      haptic.warning?.();

      if (isIntermission) {
        // En mode score entracte : pas de défaite punitive, on rejoue simplement la séquence
        setPlayerStep(0);
        setIsPlayingSequence(true);
        const replayTimer = setTimeout(() => {
          playBellSequence(sequence);
        }, 600);
        timersRef.current.push(replayTimer);
      } else {
        // En mode standard : rejouer la séquence de la manche en cours
        setPlayerStep(0);
        setIsPlayingSequence(true);
        const replayTimer = setTimeout(() => {
          playBellSequence(sequence);
        }, 500);
        timersRef.current.push(replayTimer);
      }
    }
  };

  const handleBackWithConfirm = async () => {
    if ((score > 0 || round > 1) && !isWon) {
      const ok = await confirm({
        title: 'Quitter le Carillon ?',
        message: 'Voulez-vous vraiment retourner à l\'accueil ?',
        confirmText: 'Oui, quitter',
        cancelText: 'Continuer à jouer',
        confirmVariant: 'danger'
      });
      if (ok) {
        clearAllTimers();
        onBack();
      }
    } else {
      clearAllTimers();
      onBack();
    }
  };

  const progressRatio = isIntermission
    ? Math.min(1, score / (targetScore || 100))
    : Math.min(1, (round - 1 + playerStep / (sequence.length || 1)) / (customTargetRounds || 5));

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
        color: '#f8fafc',
        background: 'radial-gradient(ellipse at 50% 15%, #1e1b4b 0%, #0f172a 60%, #020617 100%)',
        fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      <style>{`
        @keyframes chimeSway {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(-3.5deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-1deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes soundRipple {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.85); }
          50% { opacity: 0.85; transform: scale(1.15); }
        }
        .chime-tube-hover:hover {
          filter: brightness(1.15);
          transform: translateY(-2px);
        }
      `}</style>

      {/* Intro Animation avec bouton JOUER */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Carillon Céleste"
          icon="🔔"
          colors={['#00f0ff', '#a855f7', '#f59e0b']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Repère d'ancrage visuel gauche - Ligne solide bleu céleste */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '5px',
          background: '#00f0ff',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.6)',
          zIndex: 40,
          pointerEvents: 'none'
        }}
      />

      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {showCollection && (
          <CarillonCelesteCollection
            currentSelections={{
              theme: themeId,
              rounds: customTargetRounds
            }}
            onSelect={(catKey, itemId) => {
              if (catKey === 'theme') {
                setThemeId(itemId);
                updateGameConfig('carillon', 'theme', itemId);
              } else if (catKey === 'rounds') {
                setCustomTargetRounds(Number(itemId));
                updateGameConfig('carillon', 'rounds', Number(itemId));
                initGame();
              }
            }}
            onClose={() => setShowCollection(false)}
          />
        )}

        {/* En-tête : Intermission ou Standard */}
        {isIntermission ? (
          <IntermissionHeader
            instructionText={`Objectif Entracte : Atteignez ${targetScore} points en reproduisant les mélodies (${score} / ${targetScore} pts)`}
            onRestart={initGame}
            onOtherGame={onIntermissionRequest}
            onSkip={() => onIntermissionComplete && onIntermissionComplete(false)}
            replaySame={replaySameIntermission}
            onToggleReplaySame={onToggleReplaySameIntermission}
            progress={progressRatio}
          />
        ) : (
          <GameHeader
            title="CARILLON CÉLESTE"
            subtitle="Mémoire mélodique & résonance zen"
            onBack={handleBackWithConfirm}
            onRestart={initGame}
            onShop={() => setShowCollection(true)}
            showShop={true}
            onLaunchIntermission={onLaunchIntermission}
          />
        )}

        {/* Barre de statut Céleste (HUD) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '12px',
            margin: '12px 0 20px 0',
            padding: '12px 18px',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', fontWeight: '700' }}>
            <div>
              <span style={{ color: '#94a3b8', marginRight: '6px' }}>
                {isIntermission ? '🎯 Cible :' : '🎶 Vague :'}
              </span>
              <span style={{ color: '#00f0ff', fontWeight: '900', fontSize: '15px' }}>
                {isIntermission ? `${score} / ${targetScore} pts` : `${round} / ${customTargetRounds}`}
              </span>
            </div>
            <div>
              <span style={{ color: '#94a3b8', marginRight: '6px' }}>Notes :</span>
              <span style={{ color: '#10b981', fontWeight: '900', fontSize: '15px' }}>
                {playerStep} / {sequence.length}
              </span>
            </div>
            <div>
              <span style={{ color: '#94a3b8', marginRight: '6px' }}>Score :</span>
              <span style={{ color: '#f59e0b', fontWeight: '900', fontSize: '15px' }}>
                {score}
              </span>
            </div>
          </div>

          <div
            style={{
              fontSize: '12px',
              fontWeight: '800',
              color: isPlayingSequence ? '#fbbf24' : '#34d399',
              background: isPlayingSequence ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              padding: '6px 14px',
              borderRadius: '20px',
              border: `1.5px solid ${isPlayingSequence ? '#f59e0b' : '#10b981'}`,
              boxShadow: `0 0 12px ${isPlayingSequence ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
            }}
          >
            {isPlayingSequence ? '🎶 Écoutez la mélodie...' : '✨ À vous de jouer !'}
          </div>
        </div>

        {/* Sanctuaire des Carillons Célestes Suspendus */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            width: '100%',
            padding: '36px 14px 28px 14px',
            background: 'linear-gradient(180deg, rgba(30, 27, 75, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
            backdropFilter: 'blur(12px)',
            borderRadius: '24px',
            border: '2px solid rgba(99, 102, 241, 0.35)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
            marginBottom: '24px',
            minHeight: '290px',
            position: 'relative',
            boxSizing: 'border-box'
          }}
        >
          {/* Poutre céleste dorée sculptée avec embouts ouvragés */}
          <div
            style={{
              position: 'absolute',
              top: '18px',
              left: '16px',
              right: '16px',
              height: '10px',
              background: 'linear-gradient(90deg, #92400e 0%, #d97706 20%, #fef08a 50%, #d97706 80%, #92400e 100%)',
              borderRadius: '6px',
              boxShadow: '0 4px 16px rgba(245, 158, 11, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
            }}
          />

          {activeBells.map((bell) => {
            const isActive = activeBellId === bell.id;

            return (
              <div
                key={bell.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  paddingTop: '16px',
                  position: 'relative',
                  flex: 1,
                  maxWidth: '85px'
                }}
              >
                {/* Anneau de fixation doré */}
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    border: '2px solid #fbbf24',
                    background: '#78350f',
                    marginBottom: '1px'
                  }}
                />

                {/* Cordon de soie tressée avec perle de résonance */}
                <div
                  style={{
                    width: '2px',
                    height: '32px',
                    background: 'linear-gradient(180deg, #fbbf24 0%, #d97706 100%)',
                    marginBottom: '0px',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '-3px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#fbbf24',
                      boxShadow: '0 0 6px rgba(251, 191, 36, 0.8)'
                    }}
                  />
                </div>

                {/* Onde sonore circulaire animée lors de la résonance */}
                {isActive && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      top: '55px',
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      border: `2px solid ${bell.color}`,
                      animation: 'soundRipple 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards',
                      pointerEvents: 'none'
                    }}
                  />
                )}

                {/* Tube de Carillon Harmonique Métallique 3D */}
                <button
                  type="button"
                  onClick={() => handleBellClick(bell)}
                  disabled={isPlayingSequence || isWon || failedWave}
                  title={`${bell.label} (${bell.note})`}
                  aria-label={`${bell.label}, note ${bell.note}`}
                  className="chime-tube-hover"
                  style={{
                    width: '54px',
                    height: `${bell.tubeHeight}px`,
                    borderRadius: '16px',
                    border: `2px solid ${isActive ? '#ffffff' : bell.color}`,
                    borderLeft: bell.isLeftAnchor ? '4px solid #00f0ff' : `2px solid ${isActive ? '#ffffff' : bell.color}`,
                    background: isActive
                      ? `linear-gradient(90deg, rgba(255,255,255,0.4) 0%, ${bell.color} 30%, #ffffff 50%, ${bell.color} 70%, rgba(255,255,255,0.4) 100%)`
                      : `linear-gradient(90deg, rgba(15,23,42,0.85) 0%, ${bell.color}66 25%, #ffffffcc 50%, ${bell.color}66 75%, rgba(15,23,42,0.95) 100%)`,
                    color: '#ffffff',
                    cursor: isPlayingSequence || failedWave ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 4px',
                    boxSizing: 'border-box',
                    boxShadow: isActive
                      ? `0 0 32px ${bell.glow}, 0 0 50px ${bell.color}88, 0 8px 20px rgba(0,0,0,0.8)`
                      : `0 4px 14px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.4)`,
                    transform: isActive ? 'scale(1.06)' : 'none',
                    animation: isActive ? 'chimeSway 0.4s ease-in-out' : 'none',
                    transition: 'transform 0.15s ease, box-shadow 0.2s ease, filter 0.15s ease',
                    outline: 'none',
                    position: 'relative'
                  }}
                >
                  {/* Symbole céleste haut */}
                  <span style={{ fontSize: '14px', textShadow: `0 0 8px ${bell.color}` }}>
                    {bell.icon}
                  </span>

                  {/* Médaillon central gravé avec la Note */}
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: `1.5px solid ${bell.color}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 0 10px ${bell.glow}`
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '900',
                        color: bell.color,
                        letterSpacing: '0.04em'
                      }}
                    >
                      {bell.note}
                    </span>
                  </div>

                  {/* Fréquence harmonique gravée */}
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: '800',
                      color: '#cbd5e1',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {Math.round(bell.freq)}Hz
                  </span>
                </button>

                {/* Marteau battant & Prisme pendule céleste suspendu sous le tube */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginTop: '2px'
                  }}
                >
                  <div
                    style={{
                      width: '1.5px',
                      height: '14px',
                      background: 'rgba(255, 255, 255, 0.4)'
                    }}
                  />
                  {/* Battant / Clapper en laiton */}
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#d97706',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                      marginBottom: '3px'
                    }}
                  />
                  <div
                    style={{
                      width: '1px',
                      height: '12px',
                      background: 'rgba(255, 255, 255, 0.3)'
                    }}
                  />
                  {/* Pendentif attrape-vent en cristal céleste */}
                  <div
                    style={{
                      width: '14px',
                      height: '18px',
                      borderRadius: '3px 3px 8px 8px',
                      background: `linear-gradient(180deg, ${bell.color}88 0%, rgba(255,255,255,0.7) 100%)`,
                      border: `1px solid ${bell.color}`,
                      boxShadow: `0 0 8px ${bell.glow}`,
                      transform: isActive ? 'rotate(8deg)' : 'none',
                      transition: 'transform 0.3s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal / Alerte d'échec en mode Survie */}
        {failedWave && (
          <div
            style={{
              padding: '18px 24px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(15, 23, 42, 0.95) 100%)',
              border: '2px solid #ef4444',
              color: '#f8fafc',
              textAlign: 'center',
              marginBottom: '20px',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3)'
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#f87171', marginBottom: '6px' }}>
              💥 Séquence interrompue !
            </div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '14px' }}>
              Vous avez complété {round - 1} vague(s) avec un score de {score} points.
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={initGame}
                className="retro-btn"
                style={{
                  padding: '8px 18px',
                  borderRadius: '10px',
                  background: 'rgba(0, 240, 255, 0.2)',
                  borderColor: '#00f0ff',
                  color: '#00f0ff',
                  fontWeight: '800',
                  fontSize: '13px'
                }}
              >
                🔄 Réessayer la Survie
              </button>
              {isIntermission && (
                <button
                  type="button"
                  onClick={() => onIntermissionComplete && onIntermissionComplete(false)}
                  className="retro-btn"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    borderColor: '#ef4444',
                    color: '#f87171',
                    fontWeight: '800',
                    fontSize: '13px'
                  }}
                >
                  Passer ⏭
                </button>
              )}
            </div>
          </div>
        )}

        {/* Unified Victory Overlay */}
        <GameVictoryOverlay
          isOpen={isWon}
          gameKey="carillon"
          score={score}
          title="HARMONIE CÉLESTE !"
          badgeIcon="🔔"
          subtitle={encouragement || "Merveilleux ! Vous avez complété toutes les mélodies du carillon céleste avec calme et sérénité."}
          stats={[
            { label: 'Score', value: score, color: '#38bdf8' },
            { label: 'Séquence', value: `${round} sons`, color: '#f59e0b' }
          ]}
          onRestart={initGame}
          restartText="🔄 Rejouer"
          onContinue={initGame}
          continueText="Nouvelle Mélodie ➔"
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

        {/* Bouton de réinitialisation */}
        {!failedWave && !isWon && (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              type="button"
              onClick={initGame}
              disabled={isPlayingSequence}
              className="retro-btn"
              style={{
                padding: '10px 22px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(15, 23, 42, 0.65)',
                color: '#cbd5e1',
                fontWeight: '800',
                fontSize: '13px',
                cursor: isPlayingSequence ? 'not-allowed' : 'pointer',
                opacity: isPlayingSequence ? 0.4 : 1
              }}
            >
              🔄 Recommencer la mélodie
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
