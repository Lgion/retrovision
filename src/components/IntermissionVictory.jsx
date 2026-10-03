import { useEffect, useRef, useState } from 'react';
import { sound } from '../utils/sound';
import { randomChoice } from '../utils/commonUtils';

const KIND_WORDS = [
  "Prends tout ton temps, chaque instant de jeu fait progresser ton cerveau.",
  "Chaque petit pas renforce tes repères et ta confiance.",
  "Bravo pour ta patience et ta détermination aujourd'hui.",
  "La régularité et le calme créent chaque jour de nouveaux chemins.",
  "Ton regard et ton esprit s'harmonisent un peu plus à chaque manche.",
  "Savoure cette belle victoire, tu as fait un travail formidable !"
];

export default function IntermissionVictory({
  isPassed = false,
  returnGameName = 'Jeu Principal',
  totalRounds = 1,
  onReturnToMain,
  onReplayCurrent,
  onNextIntermission
}) {
  const canvasRef = useRef(null);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const [encouragement] = useState(() => randomChoice(KIND_WORDS));
  const [isPaused, setIsPaused] = useState(false);

  // Décompte de 10 secondes pour retour automatique
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onReturnToMain) onReturnToMain();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, onReturnToMain]);

  // Son de victoire et animation confettis
  useEffect(() => {
    if (!isPassed) {
      sound.playChapterVictory?.();
    } else {
      sound.playClick?.();
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Particules de confettis
    const colors = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#38bdf8', '#fbbf24'];
    const particles = Array.from({ length: 80 }).map(() => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 80,
      y: canvas.height * 0.45,
      vx: (Math.random() - 0.5) * 12,
      vy: -(Math.random() * 12 + 6),
      size: Math.random() * 8 + 5,
      color: randomChoice(colors),
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      alpha: 1
    }));

    let animId;
    const renderConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravité
        p.rotation += p.vRotation;
        p.alpha = Math.max(0, p.alpha - 0.005);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      });

      if (particles.some((p) => p.alpha > 0.01)) {
        animId = requestAnimationFrame(renderConfetti);
      }
    };

    renderConfetti();
    return () => cancelAnimationFrame(animId);
  }, [isPassed]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#0a0f1d',
        zIndex: 9999,
        padding: '20px',
        boxSizing: 'border-box',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}
    >
      {/* Canvas des confettis festifs */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      {/* Cadre de contenu principal */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '560px',
          width: '100%',
          textAlign: 'center',
          background: '#1e293b',
          border: '2px solid #334155',
          borderRadius: '24px',
          padding: '32px 24px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Emblème */}
        <div style={{ fontSize: '72px', lineHeight: 1, marginBottom: '16px' }}>
          {isPassed ? '⏭️' : totalRounds > 1 ? '🌟' : '🏆'}
        </div>

        {/* Titre */}
        <h1
          style={{
            fontSize: '2.2rem',
            fontWeight: '900',
            color: isPassed ? '#f87171' : '#f59e0b',
            margin: '0 0 8px 0',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {isPassed
            ? 'Entracte Passé'
            : totalRounds > 1
            ? `Série de ${totalRounds} Entractes Réussie !`
            : 'Entracte Réussi !'}
        </h1>

        {/* Mot doux réconfortant (très grand et lisible) */}
        <div
          style={{
            margin: '16px 0 24px 0',
            padding: '16px 20px',
            borderRadius: '16px',
            background: '#0f172a',
            border: '2px solid #38bdf8',
            color: '#f8fafc',
            fontSize: '1.25rem',
            lineHeight: '1.5',
            fontWeight: '700',
            textAlign: 'center'
          }}
        >
          🌸 {encouragement}
        </div>

        {/* BOUTON PRINCIPAL : Reprendre le jeu (sans texte, le plus visible et simple à cliquer) */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0 24px 0' }}>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              if (onReturnToMain) onReturnToMain();
            }}
            title={`Reprendre ${returnGameName}`}
            aria-label={`Reprendre ${returnGameName}`}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: '#10b981',
              border: '4px solid #34d399',
              color: '#ffffff',
              fontSize: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
              outline: 'none',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            ▶️
          </button>

          {/* Indication du décompte automatique de 10s */}
          <div
            style={{
              marginTop: '10px',
              fontSize: '0.9rem',
              color: '#94a3b8',
              fontWeight: '600'
            }}
          >
            Retour automatique au {returnGameName} dans <strong style={{ color: '#34d399' }}>{secondsLeft}s</strong>
          </div>

          {/* Barre visuelle de progression du décompte */}
          <div
            style={{
              width: '180px',
              height: '5px',
              background: '#0f172a',
              borderRadius: '3px',
              marginTop: '8px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${(secondsLeft / 10) * 100}%`,
                height: '100%',
                background: '#10b981',
                transition: 'width 1s linear'
              }}
            />
          </div>
        </div>

        {/* Boutons d'action secondaires */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          {onReplayCurrent && (
            <button
              type="button"
              onClick={() => {
                setIsPaused(true);
                sound.playClick();
                onReplayCurrent();
              }}
              style={{
                flex: 1,
                minWidth: '160px',
                minHeight: '48px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#0f172a',
                border: '2px solid #0284c7',
                color: '#38bdf8',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🔄 Rejouer cette entracte
            </button>
          )}

          {onNextIntermission && (
            <button
              type="button"
              onClick={() => {
                setIsPaused(true);
                sound.playClick();
                onNextIntermission();
              }}
              style={{
                flex: 1,
                minWidth: '160px',
                minHeight: '48px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: '#0f172a',
                border: '2px solid #ca8a04',
                color: '#facc15',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              🎲 Autre entracte
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
