import React from 'react';
import { sound } from '../utils/sound';

export default function IntermissionIntroModal({
  gameKey,
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

        {/* Section: Non-persistent session parameters */}
        <div 
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '16px',
            padding: '16px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: '24px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              ⚡ Difficulté de l'entracte
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontStyle: 'italic' }}>
              (Session uniquement)
            </span>
          </div>

          {/* Difficulty selector buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
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
                    padding: '10px 6px',
                    borderRadius: '12px',
                    border: `2px solid ${isSelected ? d.color : 'rgba(255, 255, 255, 0.08)'}`,
                    background: isSelected ? `${d.color}22` : 'rgba(15, 23, 42, 0.6)',
                    color: isSelected ? d.color : '#94A3B8',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{d.icon}</span>
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Main Play Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onStart) onStart();
            }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: '800',
              fontSize: '1.05rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              transition: 'transform 0.15s ease, filter 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>▶️</span> Démarrer l'entracte
          </button>

          {/* Random Game Change Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onChangeRandomGame) onChangeRandomGame();
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              background: 'rgba(59, 130, 246, 0.12)',
              color: '#60A5FA',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              fontWeight: '700',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span>🎲</span> Proposer un autre jeu aléatoire
          </button>

          {/* Skip Red Button */}
          <button
            onClick={() => {
              sound.playClick();
              if (onSkip) onSkip();
            }}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#F87171',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '4px'
            }}
          >
            <span>⏭️</span> Passer l'entracte (Bouton Rouge)
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalPop {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
