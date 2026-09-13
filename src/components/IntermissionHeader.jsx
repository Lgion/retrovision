import React from 'react';
import { sound } from '../utils/sound';

export default function IntermissionHeader({
  instructionText = "Relevez le défi pour retourner au jeu principal.",
  onRestart,
  onOtherGame,
  onSkip,
  replaySame = false,
  onToggleReplaySame,
  extraControls,
  progress = null, // ratio 0.0 to 1.0 (e.g. 0.85 = 85% complete)
  showCTA = false   // explicit force show CTA boolean
}) {
  // Persistent state: once 80% progress is reached, Sprint Mode persists until unmounted/restarted
  const [reached80, setReached80] = React.useState(false);
  const [showFlyover, setShowFlyover] = React.useState(false);
  const soundPlayedRef = React.useRef(false);

  const isCurrent80 = (progress !== null && progress >= 0.8) || showCTA === true || !!replaySame;

  React.useEffect(() => {
    if (isCurrent80 && !reached80) {
      setReached80(true);
      setShowFlyover(true);
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        sound.playPowerup();
      }
      const timer = setTimeout(() => {
        setShowFlyover(false);
      }, 2600);
      return () => clearTimeout(timer);
    }
  }, [isCurrent80, reached80]);

  // CTA & Visual transformation remains persistent once 80% is reached
  const isCtaVisible = reached80 || isCurrent80;

  return (
    <>
      {/* 1. Dramatic Screen-Crossing CTA Flyover Animation (Traverses Game Zone) */}
      {showFlyover && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: 99999,
            pointerEvents: 'none',
            transform: 'translate(-50%, -50%)',
            animation: 'ctaTraverseScreen 2.6s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <div
            style={{
              padding: '18px 36px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.96))',
              backdropFilter: 'blur(16px)',
              border: '2px solid #F59E0B',
              boxShadow: '0 0 50px rgba(245, 158, 11, 0.65), inset 0 0 30px rgba(245, 158, 11, 0.3)',
              color: '#FFFFFF',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              minWidth: '300px'
            }}
          >
            <div style={{ fontSize: '2.5rem', animation: 'spinPulse 1.2s infinite ease-in-out' }}>
              ⚡
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#FDE68A', letterSpacing: '1px', textTransform: 'uppercase' }}>
              80% DE COMPLÉTION ATTEINTS !
            </div>
            <div style={{ fontSize: '0.92rem', color: '#E2E8F0', fontWeight: '600' }}>
              🔄 Rejouer l'entracte déverrouillé dans l'en-tête
            </div>
          </div>
        </div>
      )}

      {/* 2. Persistent Game Zone Background Ambient Aura */}
      {isCtaVisible && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '25px',
            zIndex: 9998,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '20px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            backdropFilter: 'blur(6px)',
            color: '#FDE68A',
            fontSize: '0.78rem',
            fontWeight: '800',
            letterSpacing: '0.5px',
            animation: 'ambientAuraPulse 3s infinite alternate ease-in-out',
            boxShadow: '0 0 20px rgba(245, 158, 11, 0.2)'
          }}
        >
          <span style={{ fontSize: '1rem' }}>⚡</span>
          <span>SPRINT FINAL 80%+</span>
        </div>
      )}

      {/* 3. Main Intermission Header */}
      <div 
        className="entract-header"
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: isCtaVisible 
            ? 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)' 
            : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          borderBottom: isCtaVisible 
            ? '2px solid #F59E0B' 
            : '2px solid #3B82F6',
          borderRadius: '12px',
          marginBottom: '14px',
          boxShadow: isCtaVisible 
            ? '0 0 25px rgba(245, 158, 11, 0.4), inset 0 0 15px rgba(245, 158, 11, 0.12)' 
            : '0 4px 20px rgba(0,0,0,0.4)',
          color: '#FFFFFF',
          gap: '12px',
          flexWrap: 'wrap',
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          transition: 'all 0.5s ease-in-out'
        }}
      >
        <style>{`
          @keyframes ctaSlideDown {
            0% {
              opacity: 0;
              transform: translateY(-8px) scale(0.95);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes amberGlowPulse {
            0% {
              box-shadow: 0 0 10px rgba(245, 158, 11, 0.4), inset 0 0 10px rgba(245, 158, 11, 0.2);
              border-color: #F59E0B;
            }
            100% {
              box-shadow: 0 0 22px rgba(245, 158, 11, 0.75), inset 0 0 18px rgba(245, 158, 11, 0.4);
              border-color: #FBBF24;
            }
          }

          @keyframes badgePulse {
            0% {
              transform: scale(1);
              filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
            }
            100% {
              transform: scale(1.04);
              filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.8));
            }
          }

          @keyframes ctaTraverseScreen {
            0% {
              opacity: 0;
              transform: translate(-50%, 40%) scale(0.3) rotate(-24deg);
              filter: blur(10px);
            }
            25% {
              opacity: 0.95;
              transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
              filter: blur(0px);
            }
            50% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1.05) rotate(-3deg);
            }
            75% {
              opacity: 0.9;
              transform: translate(-50%, -100%) scale(0.85) rotate(2deg);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -180%) scale(0.4) rotate(0deg);
              filter: blur(6px);
            }
          }

          @keyframes spinPulse {
            0% { transform: scale(1) rotate(0deg); }
            50% { transform: scale(1.25) rotate(15deg); }
            100% { transform: scale(1) rotate(0deg); }
          }

          @keyframes ambientAuraPulse {
            0% { opacity: 0.65; transform: translateY(0); }
            100% { opacity: 1; transform: translateY(-4px); }
          }
        `}</style>

        {/* Left side: Badge & text */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 auto', minWidth: '220px' }}>
          <span 
            style={{
              background: isCtaVisible 
                ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.35))' 
                : 'rgba(59, 130, 246, 0.2)',
              border: isCtaVisible 
                ? '1px solid #F59E0B' 
                : '1px solid rgba(59, 130, 246, 0.4)',
              color: isCtaVisible ? '#FDE68A' : '#60A5FA',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '800',
              letterSpacing: '0.5px',
              whiteSpace: 'nowrap',
              transition: 'all 0.4s ease',
              animation: isCtaVisible ? 'badgePulse 1.6s infinite alternate ease-in-out' : 'none'
            }}
          >
            {isCtaVisible ? '⚡ SPRINT FINAL (80%+)' : '🎬 ENTRACTE'}
          </span>
          <span 
            className="entract-header-text" 
            style={{ 
              fontSize: '0.88rem', 
              color: isCtaVisible ? '#FEF08A' : '#E2E8F0', 
              fontWeight: isCtaVisible ? '700' : '600', 
              lineHeight: '1.3',
              transition: 'color 0.4s ease'
            }}
          >
            {instructionText}
          </span>
        </div>

        {/* Right side: Controls & 80% CTA Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Frosted Glass Amber Pill CTA (appears ONCE 80% reached, persists) */}
          {isCtaVisible && (
            <label 
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '6px 14px',
                borderRadius: '20px',
                background: replaySame 
                  ? 'rgba(16, 185, 129, 0.3)' 
                  : 'rgba(30, 41, 59, 0.88)',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${replaySame ? '#10B981' : 'rgba(245, 158, 11, 0.75)'}`,
                color: replaySame ? '#34D399' : '#FDE68A',
                fontSize: '0.85rem',
                fontWeight: '700',
                userSelect: 'none',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: replaySame 
                  ? '0 0 16px rgba(16, 185, 129, 0.4)' 
                  : '0 0 16px rgba(245, 158, 11, 0.35)',
                animation: 'ctaSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1), amberGlowPulse 2s infinite alternate ease-in-out'
              }}
              title="Activez pour relancer automatiquement cette entracte une fois terminée"
            >
              <input
                type="checkbox"
                checked={!!replaySame}
                onChange={(e) => {
                  sound.playClick();
                  if (onToggleReplaySame) onToggleReplaySame(e.target.checked);
                }}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: replaySame ? '#10B981' : '#F59E0B',
                  cursor: 'pointer'
                }}
              />
              <span>{replaySame ? '🔄 Rejouer activé' : '⚡ Rejouer cette entracte ?'}</span>
            </label>
          )}

          {/* Restart current intermission game button */}
          {onRestart && (
            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="entract-header-btn"
              style={{
                background: 'rgba(16, 185, 129, 0.2) !important',
                color: '#34D399 !important',
                border: '1px solid rgba(16, 185, 129, 0.5) !important',
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.3) !important'
              }}
              title="Relancer une nouvelle partie immédiatement"
            >
              🔄 Relancer
            </button>
          )}

          {/* Other game button */}
          {onOtherGame && (
            <button 
              onClick={() => {
                sound.playClick();
                onOtherGame();
              }} 
              className="entract-header-btn" 
              style={{
                background: 'rgba(59, 130, 246, 0.2) !important',
                color: '#60a5fa !important',
                border: '1px solid rgba(59, 130, 246, 0.4) !important',
                boxShadow: '0 0 10px rgba(59, 130, 246, 0.3) !important'
              }}
              title="Changer pour une autre entracte aléatoire"
            >
              🎲 Autre jeu
            </button>
          )}

          {/* Skip button */}
          {onSkip && (
            <button
              onClick={() => {
                sound.playClick();
                onSkip();
              }}
              className="entract-header-btn"
              style={{
                background: 'rgba(239, 68, 68, 0.2) !important',
                color: '#f87171 !important',
                border: '1px solid rgba(239, 68, 68, 0.4) !important',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.3) !important'
              }}
              title="Quitter l'entracte et retourner au Mahjong"
            >
              Passer l'entracte ⏭
            </button>
          )}

          {extraControls}
        </div>
      </div>
    </>
  );
}
