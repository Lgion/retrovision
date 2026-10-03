import { useState, useEffect, useCallback } from 'react';
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
  const activeBells = difficulty === 'facile' ? BELLS_CONFIG.slice(0, 4) : BELLS_CONFIG;
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

  // Objectifs en mode entracte : réussir 2 mélodies en facile, 3 en moyen/difficile
  const targetRounds = isIntermission ? (difficulty === 'facile' ? 2 : 3) : 5;

  // Lancement d'une manche
  const startNewRound = useCallback((roundNum) => {
    setIsPlayingSequence(true);
    setPlayerStep(0);

    // Longueur de la mélodie : roundNum + 1 (ex: round 1 = 2 notes, round 2 = 3 notes)
    const seqLen = roundNum + 1;
    const newSeq = [];
    for (let i = 0; i < seqLen; i++) {
      newSeq.push(randomChoice(activeBells).id);
    }
    setSequence(newSeq);

    // Lecture de la séquence avec tempo calme
    newSeq.forEach((bellId, index) => {
      setTimeout(() => {
        const bell = BELLS_CONFIG.find((b) => b.id === bellId);
        if (bell) {
          synth.playChime(bell.freq, bell.isLeftAnchor);
          setActiveBellId(bell.id);
          setTimeout(() => setActiveBellId(null), 450);
        }
        if (index === newSeq.length - 1) {
          setTimeout(() => setIsPlayingSequence(false), 550);
        }
      }, (index + 1) * 750);
    });
  }, [activeBells]);

  // Initialisation
  const initGame = useCallback(() => {
    setRound(1);
    setScore(0);
    setIsWon(false);
    setEncouragement('');
    startNewRound(1);
  }, [startNewRound]);

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
    setTimeout(() => setActiveBellId(null), 300);

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

        if (round >= targetRounds) {
          // Victoire finale de la partie ou de l'entracte
          setIsWon(true);
          sound.playSudokuSuccess();
          setEncouragement(randomChoice(ENCOURAGEMENTS));
          if (onScoreSave) onScoreSave('carillon', nextScore);

          if (isIntermission && onIntermissionComplete) {
            if (replaySameIntermission) {
              if (onToggleReplaySameIntermission) onToggleReplaySameIntermission(false);
              setTimeout(() => initGame(), 1500);
            } else {
              setTimeout(() => onIntermissionComplete(true), 1200);
            }
          }
        } else {
          // Passer à la mélodie suivante
          setTimeout(() => {
            setRound((prev) => prev + 1);
            startNewRound(round + 1);
          }, 800);
        }
      }
    } else {
      // Erreur bienveillante : replay de la séquence
      sound.playClick();
      setPlayerStep(0);
      setIsPlayingSequence(true);
      setTimeout(() => {
        sequence.forEach((bId, idx) => {
          setTimeout(() => {
            const b = BELLS_CONFIG.find((item) => item.id === bId);
            if (b) {
              synth.playChime(b.freq, b.isLeftAnchor);
              setActiveBellId(b.id);
              setTimeout(() => setActiveBellId(null), 450);
            }
            if (idx === sequence.length - 1) {
              setTimeout(() => setIsPlayingSequence(false), 550);
            }
          }, (idx + 1) * 750);
        });
      }, 500);
    }
  };

  const handleBackWithConfirm = () => {
    if (confirm) {
      confirm('Voulez-vous retourner à l\'accueil ?', () => onBack());
    } else {
      onBack();
    }
  };

  const progressRatio = Math.min(1, (round - 1 + (playerStep / (sequence.length || 1))) / targetRounds);

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
            instructionText={`Reproduisez ${targetRounds} mélodies harmoniques !`}
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
              <span style={{ color: '#64748b', marginRight: '6px' }}>Mélodie :</span>
              <span style={{ color: '#0284c7', fontWeight: '900' }}>{round} / {targetRounds}</span>
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
