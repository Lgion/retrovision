import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import GameIntro from '../components/GameIntro';
import IntermissionHeader from '../components/IntermissionHeader';
import { sound } from '../utils/sound';
import { storage } from '../utils/storage';
import { haptic } from '../utils/haptics';
import { randomChoice } from '../utils/commonUtils';
import { useConfirm } from '../components/ConfirmContext';

// Cloches pentatoniques zen (Do, Ré, Mi, Sol, La) - Fréquences réelles en Hz
const BELLS_CONFIG = [
  { id: 'bell_1', note: 'Do', freq: 261.63, label: 'Cloche Boréale', color: '#0284c7', glow: 'rgba(2, 132, 199, 0.4)', isLeftAnchor: true },
  { id: 'bell_2', note: 'Ré', freq: 293.66, label: 'Cloche Solaire', color: '#0d9488', glow: 'rgba(13, 148, 136, 0.4)' },
  { id: 'bell_3', note: 'Mi', freq: 329.63, label: 'Cloche Zénith', color: '#d97706', glow: 'rgba(217, 119, 6, 0.4)' },
  { id: 'bell_4', note: 'Sol', freq: 392.00, label: 'Cloche Étoilée', color: '#7c3aed', glow: 'rgba(124, 58, 237, 0.4)' },
  { id: 'bell_5', note: 'La', freq: 440.00, label: 'Cloche Céleste', color: '#db2777', glow: 'rgba(219, 39, 119, 0.4)' }
];

const ENCOURAGEMENTS = [
  "Votre écoute et votre regard s'accordent en parfaite harmonie.",
  "La résonance des cloches apaise l'esprit et renforce votre mémoire.",
  "Chaque note retrouvée guide votre attention avec douceur.",
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
  onIntermissionComplete,
  onIntermissionRequest,
  replaySameIntermission,
  onToggleReplaySameIntermission,
  skipIntro = false
}) {
  const confirm = useConfirm();
  const [showIntro, setShowIntro] = useState(!skipIntro && !isIntermission);
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
  const [encouragement, setEncouragement] = useState('');

  // Objectifs en mode entracte : 5 mélodies à réussir (comme demandé)
  const targetRounds = isIntermission ? 5 : 5;

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

  // Lancement d'une manche : progression mélodique classique (2 notes à la manche 1, 3 notes à la manche 2, etc.)
  const startNewRound = useCallback((roundNum) => {
    setPlayerStep(0);
    const seqLen = roundNum + 1; // 2 notes au round 1, 3 notes au round 2, etc.

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
  }, [activeBells, playBellSequence]);

  // Initialisation
  const initGame = useCallback(() => {
    clearAllTimers();
    setActiveBellId(null);
    setRound(1);
    setScore(0);
    setIsWon(false);
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
        const nextScore = score + sequence.length * 10;
        setScore(nextScore);

        if (nextScore > highScore) {
          setHighScore(nextScore);
          storage.setItem('retrovision_carillon_highscore', nextScore.toString());
        }

        if (isIntermission) {
          // En entracte : aller le plus loin possible sans se tromper !
          // Chaque manche réussie incrémente le round et enchaîne directement avec une note de plus
          const nextRoundNum = round + 1;
          setRound(nextRoundNum);
          const nextTimer = setTimeout(() => {
            startNewRound(nextRoundNum);
          }, 900);
          timersRef.current.push(nextTimer);
        } else {
          // En mode normal : objectif targetRounds (5 mélodies)
          if (round >= targetRounds) {
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
        // En entracte : fin du parcours d'endurance dès la première erreur
        setIsWon(true);
        if (onScoreSave) onScoreSave('carillon', score);
        setEncouragement(`Magnifique parcours ! Vous avez validé ${round - 1} manche${round - 1 > 1 ? 's' : ''} sans erreur.`);

        if (onIntermissionComplete) {
          if (replaySameIntermission) {
            if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
            const replayTimer = setTimeout(() => initGame(), 2000);
            timersRef.current.push(replayTimer);
          } else {
            const compTimer = setTimeout(() => onIntermissionComplete(true), 2400);
            timersRef.current.push(compTimer);
          }
        }
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
    ? Math.min(1, (round - 1) / 5) // repère visuel montant avec les manches réussies
    : Math.min(1, (round - 1 + (playerStep / (sequence.length || 1))) / targetRounds);

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
      {/* Intro Animation avec bouton JOUER */}
      {showIntro && !isIntermission && (
        <GameIntro
          gameName="Carillon Céleste"
          icon="🔔"
          colors={['#0284c7', '#0d9488', '#d97706']}
          onComplete={() => setShowIntro(false)}
        />
      )}

      {/* Repère d'ancrage visuel gauche - Ligne solide sobre bleu médical */}
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

      <div style={{ width: '100%', maxWidth: '640px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* En-tête : Intermission ou Standard */}
        {isIntermission ? (
          <IntermissionHeader
            instructionText={`Allez le plus loin possible sans vous tromper ! (${round - 1} réussie${round - 1 > 1 ? 's' : ''})`}
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
            showShop={false}
            onLaunchIntermission={onLaunchIntermission}
          />
        )}

        {/* Barre de statut sobre */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            gap: '12px',
            margin: '12px 0 20px 0',
            padding: '12px 16px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '14px', fontWeight: '700' }}>
            <div>
              <span style={{ color: '#64748b', marginRight: '6px' }}>{isIntermission ? 'Manche :' : 'Mélodie :'}</span>
              <span style={{ color: '#0284c7', fontWeight: '900' }}>
                {isIntermission ? `${round}` : `${round} / ${targetRounds}`}
              </span>
            </div>
            <div>
              <span style={{ color: '#64748b', marginRight: '6px' }}>Notes :</span>
              <span style={{ color: '#16a34a', fontWeight: '900' }}>{playerStep} / {sequence.length}</span>
            </div>
          </div>

          <div
            style={{
              fontSize: '12px',
              fontWeight: '800',
              color: isPlayingSequence ? '#d97706' : '#16a34a',
              background: isPlayingSequence ? '#fffbeb' : '#f0fdf4',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${isPlayingSequence ? '#fde68a' : '#bbf7d0'}`
            }}
          >
            {isPlayingSequence ? 'Écoutez attentivement...' : 'À vous de jouer !'}
          </div>
        </div>

        {/* Espace des cloches célestes suspendues */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'flex-start',
            width: '100%',
            padding: '24px 12px',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1.5px solid #cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            marginBottom: '24px',
            minHeight: '260px',
            position: 'relative'
          }}
        >
          {/* Ligne de suspension horizontale en bois de bambou */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              left: '20px',
              right: '20px',
              height: '8px',
              background: '#b45309',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                  paddingTop: '20px',
                  position: 'relative'
                }}
              >
                {/* Cordon de suspension */}
                <div
                  style={{
                    width: '2px',
                    height: '35px',
                    background: '#78350f',
                    marginBottom: '2px'
                  }}
                />

                {/* Cloche 3D tactile */}
                <button
                  type="button"
                  onClick={() => handleBellClick(bell)}
                  disabled={isPlayingSequence || isWon}
                  title={`${bell.label} (${bell.note})`}
                  aria-label={`${bell.label}, note ${bell.note}`}
                  style={{
                    width: '64px',
                    height: '110px',
                    borderRadius: '24px 24px 10px 10px',
                    border: `2px solid ${isActive ? '#f59e0b' : '#cbd5e1'}`,
                    borderLeft: bell.isLeftAnchor ? '4px solid #0284c7' : `2px solid ${isActive ? '#f59e0b' : '#cbd5e1'}`,
                    background: isActive ? '#fef3c7' : '#ffffff',
                    color: '#0f172a',
                    cursor: isPlayingSequence ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 4px',
                    boxSizing: 'border-box',
                    boxShadow: isActive
                      ? '0 0 16px rgba(245, 158, 11, 0.6), 0 4px 8px rgba(0,0,0,0.1)'
                      : '0 2px 0 #cbd5e1, 0 4px 0 #94a3b8, 0 6px 10px rgba(0,0,0,0.08)',
                    transform: isActive ? 'scale(1.06) translateY(-4px)' : 'none',
                    transition: 'transform 0.1s ease, box-shadow 0.15s ease, background 0.15s ease',
                    outline: 'none'
                  }}
                >
                  <span style={{ fontSize: '11px', fontWeight: '800', color: bell.color }}>
                    {bell.note}
                  </span>

                  <span style={{ fontSize: '26px' }}>
                    🔔
                  </span>

                  <span
                    style={{
                      fontSize: '9.5px',
                      fontWeight: '700',
                      color: '#64748b',
                      textTransform: 'uppercase'
                    }}
                  >
                    {bell.isLeftAnchor ? 'G' : ''}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Message bienveillant lors de la victoire */}
        {isWon && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '12px',
              background: '#f0fdf4',
              border: '2px solid #86efac',
              color: '#166534',
              fontSize: '15px',
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: '20px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            🌸 {encouragement || "Merveilleux ! Vous avez complété toutes les mélodies du carillon avec calme."}
          </div>
        )}

        {/* Bouton de réinitialisation */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            type="button"
            onClick={initGame}
            disabled={isPlayingSequence}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              background: '#ffffff',
              color: '#334155',
              fontWeight: '800',
              fontSize: '14px',
              cursor: isPlayingSequence ? 'not-allowed' : 'pointer',
              opacity: isPlayingSequence ? 0.5 : 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            🔄 Recommencer la mélodie
          </button>
        </div>
      </div>
    </div>
  );
}
