/**
 * Écran de transition de victoire ou de passage d'un entracte
 * avec animations soignées et barre de progression de retour.
 */
export default function IntermissionVictory({ isPassed = false, returnGameName = 'Jeu Principal' }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(circle at center, #0f172a, #020617)',
        zIndex: 9999,
        animation:
          'fadeInVictory 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards, fadeOutVictory 0.6s cubic-bezier(0.16, 1, 0.3, 1) 2.4s forwards',
        opacity: 0,
        fontFamily: "'Outfit', 'Inter', sans-serif",
      }}
    >
      {/* Halo lumineux d'ambiance */}
      <div
        style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: isPassed ? 'rgba(239, 68, 68, 0.18)' : 'rgba(59, 130, 246, 0.15)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          animation: 'pulseGlow 2s infinite alternate',
        }}
      />

      {/* Emblème */}
      <div
        style={{
          fontSize: '80px',
          marginBottom: '24px',
          filter: isPassed
            ? 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.5))'
            : 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))',
          animation: 'victoryScale 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}
      >
        {isPassed ? '⏭️' : '🏆'}
      </div>

      {/* Titre */}
      <h1
        style={{
          fontSize: '2.8rem',
          fontWeight: '800',
          letterSpacing: '2px',
          background: isPassed
            ? 'linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)'
            : 'linear-gradient(135deg, #fef08a 0%, #f59e0b 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: '0 0 12px 0',
          textAlign: 'center',
          textTransform: 'uppercase',
          animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        }}
      >
        {isPassed ? 'Entracte Passé' : 'Entracte Réussi'}
      </h1>

      <div
        style={{
          width: '80px',
          height: '4px',
          background: isPassed
            ? 'linear-gradient(90deg, transparent, #ef4444, transparent)'
            : 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
          marginBottom: '20px',
          borderRadius: '2px',
          animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both',
        }}
      />

      <p
        style={{
          fontSize: '1.2rem',
          color: '#94a3b8',
          margin: 0,
          fontWeight: '500',
          letterSpacing: '0.5px',
          textAlign: 'center',
          animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both',
        }}
      >
        Retour au {returnGameName}...
      </p>

      <div
        style={{
          marginTop: '16px',
          padding: '8px 18px',
          borderRadius: '20px',
          background: 'rgba(56, 189, 248, 0.12)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          color: '#7dd3fc',
          fontSize: '0.95rem',
          fontWeight: '600',
          textAlign: 'center',
          maxWidth: '85%',
          animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both'
        }}
      >
        🌸 Prends tout ton temps, chaque instant de jeu fait progresser ton cerveau.
      </div>

      {/* Barre de progression épurée */}
      <div
        style={{
          width: '160px',
          height: '3px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px',
          marginTop: '32px',
          overflow: 'hidden',
          animation: 'victorySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both',
        }}
      >
        <div
          style={{
            height: '100%',
            background: isPassed
              ? 'linear-gradient(90deg, #ef4444, #f87171)'
              : 'linear-gradient(90deg, #3b82f6, #60a5fa)',
            borderRadius: '2px',
            animation: 'victoryProgressBar 2.2s linear forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes fadeInVictory {
          0% { opacity: 0; backdrop-filter: blur(0px); }
          100% { opacity: 1; backdrop-filter: blur(12px); }
        }
        @keyframes fadeOutVictory {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes victoryScale {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes victorySlideUp {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes victoryProgressBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes pulseGlow {
          0% { transform: scale(0.9); opacity: 0.12; }
          100% { transform: scale(1.1); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
