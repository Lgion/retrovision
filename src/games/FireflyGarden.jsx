import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import GameHeader from '../components/GameHeader';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';
import { useConfirm } from '../components/ConfirmContext';

// Gamme pentatonique apaisante (notes en Hz) : C5, D5, E5, G5, A5, C6, D6, E6
const PENTATONIC_FREQS = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

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
  isIntermission = false,
  intermissionDifficulty = 'facile',
  onIntermissionComplete
}) {
  const confirm = useConfirm();

  // Mode de jeu : 'constellation' (par niveaux) ou 'serenite' (infini)
  const [gameMode, setGameMode] = useState('constellation');
  const [constellationIdx, setConstellationIdx] = useState(0);
  const [collectedInLevel, setCollectedInLevel] = useState(0);
  const [totalCollected, setTotalCollected] = useState(0);
  const [levelVictory, setLevelVictory] = useState(false);

  // Vitesse / Rythme : 'douceur' (6s), 'eveil' (4.5s), 'harmonie' (3.5s)
  const [tempo, setTempo] = useState(intermissionDifficulty === 'difficile' ? 'harmonie' : 'douceur');

  // Liste active des lucioles affichées
  const [fireflies, setFireflies] = useState([]);
  // Particules d'ondulation / étincelles après capture
  const [ripples, setRipples] = useState([]);

  // Audio Context pour carillons cristallins
  const audioCtxRef = useRef(null);
  const fireflyIdRef = useRef(0);
  const spawnTimerRef = useRef(null);

  const currentConstellation = CONSTELLATIONS[constellationIdx % CONSTELLATIONS.length];
  const targetCount = isIntermission ? 8 : currentConstellation.target;

  // Initialisation Web Audio
  const playCrystalChime = useCallback((isLeft = false) => {
    if (sound.muted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      // Sélection d'une note pentatonique (plus aiguë si trouvée à gauche pour valoriser)
      const freq = isLeft
        ? PENTATONIC_FREQS[Math.floor(Math.random() * 4) + 4] // Notes hautes C6-E6
        : PENTATONIC_FREQS[Math.floor(Math.random() * 5)];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isLeft ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Léger glissando harmonique
      osc.frequency.exponentialRampToValueAtTime(freq * 1.01, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(isLeft ? 0.12 : 0.08, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.9);
    } catch {
      // Ignorer si audio non disponible
    }
  }, []);

  // Génération d'une nouvelle luciole avec PONDÉRATION GAUCHE (Anti-Hémi-évi)
  const spawnFirefly = useCallback(() => {
    const id = ++fireflyIdRef.current;

    // 65% de chances d'apparaître dans l'hémichamp gauche/centre (10% à 50% de la largeur)
    // 35% de chances d'apparaître dans l'hémichamp droit (50% à 85% de la largeur)
    const isLeft = Math.random() < 0.65;
    const x = isLeft ? 10 + Math.random() * 40 : 50 + Math.random() * 35;
    // Éviter le sommet (header) et le bas extrême
    const y = 18 + Math.random() * 62;

    // Palette de teintes zen
    const colors = isLeft
      ? ['#38bdf8', '#22d3ee', '#facc15', '#a78bfa'] // Teintes très lumineuses à gauche
      : ['#fef08a', '#86efac', '#f472b6', '#38bdf8'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Durée d'apparition selon le rythme
    const lifespan = tempo === 'douceur' ? 6200 : tempo === 'eveil' ? 4800 : 3600;
    // Les lucioles de gauche restent 800ms de plus pour donner amplement le temps de les remarquer
    const totalLife = isLeft ? lifespan + 800 : lifespan;

    const newFirefly = {
      id,
      x,
      y,
      color,
      isLeft,
      size: isLeft ? 38 : 34, // Légèrement plus imposante à gauche
      born: Date.now(),
      lifespan: totalLife
    };

    setFireflies((prev) => {
      // Limiter à 4 lucioles simultanées maximum pour éviter toute surcharge cognitive
      const maxCount = tempo === 'douceur' ? 2 : tempo === 'eveil' ? 3 : 4;
      const filtered = prev.filter((f) => Date.now() - f.born < f.lifespan);
      if (filtered.length >= maxCount) return filtered;
      return [...filtered, newFirefly];
    });
  }, [tempo]);

  // Boucle de spawn continue
  useEffect(() => {
    if (levelVictory) return;

    const interval = tempo === 'douceur' ? 2200 : tempo === 'eveil' ? 1600 : 1200;
    spawnTimerRef.current = setInterval(spawnFirefly, interval);

    // Première luciole immédiate
    spawnFirefly();

    return () => {
      if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
    };
  }, [spawnFirefly, tempo, levelVictory]);

  // Nettoyage des lucioles expirées
  useEffect(() => {
    const cleaner = setInterval(() => {
      setFireflies((prev) => prev.filter((f) => Date.now() - f.born < f.lifespan));
    }, 500);
    return () => clearInterval(cleaner);
  }, []);

  // Détection de présence de lucioles dans l'hémichamp gauche (pour pulser l'ancre visuelle)
  const hasLeftFirefly = useMemo(() => {
    return fireflies.some((f) => f.isLeft);
  }, [fireflies]);

  // Capture d'une luciole par toucher
  const handleCatchFirefly = (e, firefly) => {
    e.stopPropagation();

    // Effet sonore et vibration
    if (firefly.isLeft) {
      haptic.success(); // Double vibration valorisante pour la gauche
      playCrystalChime(true);
    } else {
      haptic.tap();
      playCrystalChime(false);
    }

    // Création d'une ondulation lumineuse à l'endroit touché
    const rippleId = Date.now() + Math.random();
    setRipples((prev) => [
      ...prev.slice(-8),
      {
        id: rippleId,
        x: firefly.x,
        y: firefly.y,
        color: firefly.color,
        isLeft: firefly.isLeft
      }
    ]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 1000);

    // Retirer la luciole attrapée
    setFireflies((prev) => prev.filter((f) => f.id !== firefly.id));

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
        if (isIntermission && onIntermissionComplete) {
          setTimeout(() => onIntermissionComplete(true), 2500);
        }
      }
    }
  };

  // Passer à la constellation suivante
  const handleNextLevel = () => {
    sound.playClick();
    haptic.tap();
    setLevelVictory(false);
    setCollectedInLevel(0);
    setConstellationIdx((prev) => prev + 1);
  };

  // Bascule entre mode constellation et méditation libre
  const toggleGameMode = () => {
    sound.playClick();
    haptic.tap();
    setGameMode((prev) => (prev === 'constellation' ? 'serenite' : 'constellation'));
    setCollectedInLevel(0);
    setLevelVictory(false);
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
        .left-anchor-active {
          animation: left-anchor-pulse 1.4s ease-in-out infinite;
          width: 8px;
        }
      `}</style>

      {/* Header Unifié avec bouton retour haute visibilité */}
      <GameHeader
        title="JARDIN DES LUCIOLES"
        onBack={handleBackWithConfirm}
        showShop={false}
        centerContent={
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '6px 14px',
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

      {/* ANCRE VISUELLE GAUCHE (Spéciale Hémi-évi) */}
      <div className={`left-anchor-bar ${hasLeftFirefly ? 'left-anchor-active' : ''}`} />

      {/* Espace de jeu interactif */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          overflow: 'hidden'
        }}
      >
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
            aria-label="Luciole lumineuse"
          >
            <div
              className="firefly-core"
              style={{
                width: `${f.size}px`,
                height: `${f.size}px`,
                backgroundColor: f.color,
                color: f.color,
                boxShadow: `0 0 18px ${f.color}, 0 0 35px ${f.color}`
              }}
            >
              {/* Noyau lumineux interne */}
              <div
                style={{
                  position: 'absolute',
                  inset: '25%',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  opacity: 0.9
                }}
              />
            </div>
          </div>
        ))}

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
            : 'Explore et touche doucement les lucioles à ton rythme'}
        </div>
      </div>

      {/* ÉCRAN DE VICTOIRE / CONSTELLATION COMPLÉTÉE */}
      {levelVictory && (
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
            <div style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 0 20px #38bdf8)' }}>
              {currentConstellation.symbol}
            </div>

            <h2
              style={{
                fontFamily: 'Orbitron, sans-serif',
                fontSize: '1.6rem',
                fontWeight: '900',
                color: '#38bdf8',
                margin: 0,
                letterSpacing: '1px'
              }}
            >
              {currentConstellation.name}
            </h2>

            {/* Tracé de la constellation */}
            <div
              style={{
                position: 'relative',
                width: '240px',
                height: '180px',
                margin: '10px 0',
                borderRadius: '16px',
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.2)'
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

            <p
              style={{
                fontSize: '1.05rem',
                lineHeight: '1.5',
                color: '#e2e8f0',
                margin: 0,
                fontWeight: '500'
              }}
            >
              {currentConstellation.message}
            </p>

            <button
              onClick={handleNextLevel}
              className="retro-btn"
              style={{
                marginTop: '12px',
                width: '100%',
                minHeight: '52px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #2563eb 100%)',
                color: '#ffffff',
                border: '2px solid #7dd3fc',
                borderRadius: '16px',
                fontSize: '16px',
                fontWeight: '800'
              }}
            >
              Constellation Suivante ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
