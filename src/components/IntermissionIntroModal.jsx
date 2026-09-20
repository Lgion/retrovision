import { sound } from '../utils/sound';

export default function IntermissionIntroModal({
  gameName,
  gameIcon = "🎮",
  returnGameName = "Jeu Principal",
  currentDifficulty = "facile",
  onDifficultyChange,
  onStart,
  onSkip,
  onChangeRandomGame
}) {
  const difficulties = [
    { id: 'facile', label: 'Facile', icon: '🟢', color: '#10B981', desc: 'Rapide & relaxant' },
    { id: 'moyen', label: 'Moyen', icon: '🟡', color: '#F59E0B', desc: 'Équilibre parfait' },
    { id: 'difficile', label: 'Difficile', icon: '🔴', color: '#EF4444', desc: 'Défi maximal' }
  ];

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 15, 30, 0.88)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(145deg, #1E293B, #0F172A)',
          borderRadius: '24px',
          border: '2px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.15)',
          padding: '28px',
          color: '#FFFFFF',
          textAlign: 'center',
          animation: 'modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Badge Entracte Header */}
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#60A5FA',
            fontSize: '0.85rem',
            fontWeight: '700',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}
        >
          <span>🎬</span> ENTRACTE DE PAUSE
        </div>

        {/* Title & Game Icon */}
        <div style={{ fontSize: '3.5rem', marginBottom: '8px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
          {gameIcon}
        </div>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '1.8rem', fontWeight: '800', color: '#F8FAFC' }}>
          {gameName}
        </h2>
        <p style={{ margin: '0 0 24px 0', fontSize: '0.9rem', color: '#94A3B8' }}>
          Pause avant de poursuivre votre partie de <strong style={{ color: '#E2E8F0' }}>{returnGameName}</strong>
        </p>

        {/* Section: Compact Session Difficulty */}
        <div 
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '14px',
            padding: '10px 14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Difficulté de session
            </span>
          </div>

          {/* Difficulty selector buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {difficulties.map(d => {
              const isSelected = currentDifficulty === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    sound.playClick();
                    if (onDifficultyChange) onDifficultyChange(d.id);
                  }}
                  style={{
                    padding: '6px 4px',
                    borderRadius: '10px',
                    border: `1.5px solid ${isSelected ? d.color : 'rgba(255, 255, 255, 0.08)'}`,
                    background: isSelected ? `${d.color}25` : 'rgba(15, 23, 42, 0.5)',
                    color: isSelected ? d.color : '#94A3B8',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '0.9rem' }}>{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls: Primary animated play CTA + Secondary random button */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Button 1: Aller vers l'entracte (Primary Action) */}
          <button
            onClick={() => {
              sound.playClick();
              if (onStart) onStart();
            }}
            className="retro-btn pulse-glow"
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: '2.5px solid #6EE7B7',
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: '17px',
              cursor: 'pointer',
              boxShadow: '0 0 28px rgba(16, 185, 129, 0.7), 0 4px 14px rgba(0, 0, 0, 0.35)',
              transition: 'transform 0.15s ease, filter 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: '900' }}>
              <span className="primary-play-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'block' }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span>Aller vers l'Entracte</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              fontSize: '15px',
              fontWeight: '800'
            }}>
              <span style={{ color: '#D1FAE5', opacity: 0.95 }}>Jouer :</span>
              <span style={{
                color: '#FDE047',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '3px 12px',
                borderRadius: '8px',
                border: '1.5px solid rgba(253, 224, 71, 0.5)',
                fontSize: '16px',
                fontWeight: '900',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                <span>{gameIcon}</span>
                <span>{gameName}</span>
              </span>
              <span style={{
                fontSize: '13px',
                color: '#6EE7B7',
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontWeight: '800',
                textTransform: 'capitalize'
              }}>
                ({currentDifficulty})
              </span>
            </div>
          </button>

          {/* Button 2: Lancer un Jeu Aléatoire (Secondary Action) */}
          <button
            onClick={() => {
              sound.playClick();
              if (onChangeRandomGame) onChangeRandomGame();
            }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(30, 41, 59, 0.75)',
              border: '1.5px solid rgba(96, 165, 250, 0.45)',
              color: '#93C5FD',
              fontWeight: '700',
              fontSize: '0.92rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59, 130, 246, 0.22)';
              e.currentTarget.style.borderColor = '#60A5FA';
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(30, 41, 59, 0.75)';
              e.currentTarget.style.borderColor = 'rgba(96, 165, 250, 0.45)';
              e.currentTarget.style.color = '#93C5FD';
            }}
          >
            <span style={{ fontSize: '1.15rem' }}>🎲</span>
            <span>Lancer un jeu aléatoire</span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: '600' }}>(Surprise)</span>
          </button>

          {/* Skip Button (Discrete link) */}
          <button
            onClick={() => {
              sound.playClick();
              if (onSkip) onSkip();
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontWeight: '600',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'color 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px',
              textDecoration: 'underline'
            }}
          >
            <span>⏭️</span> Passer cette entracte et continuer
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes playArrowPulseModal {
          0%, 100% {
            transform: scale(1) translateX(0);
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.8));
          }
          50% {
            transform: scale(1.22) translateX(4px);
            filter: drop-shadow(0 0 8px #6ee7b7) drop-shadow(0 0 14px #10b981);
          }
        }
        .primary-play-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: playArrowPulseModal 1.1s ease-in-out infinite;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
