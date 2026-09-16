import React, { useState, useRef, useEffect } from 'react';
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
  const [reached80, setReached80] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const soundPlayedRef = useRef(false);

  const isCurrent80 = (progress !== null && progress >= 0.8) || showCTA === true || !!replaySame;

  useEffect(() => {
    setIsDismissed(false);
  }, [instructionText]);

  useEffect(() => {
    if (isCurrent80 && !reached80) {
      setReached80(true);
      if (!soundPlayedRef.current) {
        soundPlayedRef.current = true;
        sound.playPowerup?.();
      }
    }
  }, [isCurrent80, reached80]);

  const isCtaVisible = reached80 || isCurrent80;

  return (
    <>
      <style>{`
        .entract-header-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px 14px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-radius: 14px;
          margin-bottom: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          width: 100%;
          box-sizing: border-box;
        }

        .entract-top-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
        }

        .entract-badge {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.4);
          color: #60a5fa;
          padding: 3px 10px;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.5px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .entract-instruction {
          font-size: 0.86rem;
          color: #e2e8f0;
          font-weight: 600;
          line-height: 1.3;
          flex: 1;
        }

        .entract-actions-row {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .entract-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 7px 6px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.15s ease;
          user-select: none;
          outline: none;
          box-sizing: border-box;
        }

        .entract-btn:active {
          transform: scale(0.96);
        }

        .entract-btn-restart {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.5);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.15);
        }

        .entract-btn-restart:hover {
          background: rgba(16, 185, 129, 0.3);
        }

        .entract-btn-other {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border: 1px solid rgba(59, 130, 246, 0.45);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.15);
        }

        .entract-btn-other:hover {
          background: rgba(59, 130, 246, 0.3);
        }

        .entract-btn-skip {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
          border: 1px solid rgba(239, 68, 68, 0.45);
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.15);
        }

        .entract-btn-skip:hover {
          background: rgba(239, 68, 68, 0.3);
        }



        .entract-footer-bar {
          position: fixed;
          bottom: 12px;
          right: 14px;
          z-index: 9999;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 6px 10px 6px 14px;
          border-radius: 20px;
          background: rgba(15, 23, 42, 0.94);
          border: 1px solid rgba(245, 158, 11, 0.55);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.55), 0 0 15px rgba(245, 158, 11, 0.2);
          backdrop-filter: blur(12px);
          pointer-events: auto;
          animation: entractFooterSlideIn 0.25s ease-out;
          max-width: calc(100vw - 28px);
          box-sizing: border-box;
        }

        @keyframes entractFooterSlideIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .entract-footer-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #94a3b8;
          font-size: 11px;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          padding: 0;
          margin-left: 2px;
          transition: all 0.15s ease;
          line-height: 1;
        }

        .entract-footer-close-btn:hover {
          background: rgba(239, 68, 68, 0.4);
          border-color: #ef4444;
          color: #ffffff;
        }

        .entract-footer-minimized-btn {
          position: fixed;
          bottom: 12px;
          right: 14px;
          z-index: 9999;
          height: 28px;
          padding: 0 10px;
          border-radius: 14px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(245, 158, 11, 0.5);
          color: #fde68a;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.45);
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          backdrop-filter: blur(8px);
          transition: all 0.2s ease;
        }

        .entract-footer-minimized-btn:hover {
          transform: scale(1.05);
          background: rgba(30, 41, 59, 0.95);
          border-color: #f59e0b;
        }
      `}</style>

      {/* --- STANDARDIZED COMPACT HEADER (2 ROWS, IDENTICAL ACROSS ALL 12 GAMES) --- */}
      <div className="entract-header-container">
        {/* Row 1: Badge & Instruction text */}
        <div className="entract-top-row">
          <span className="entract-badge">🎬 ENTRACTE</span>
          <span className="entract-instruction">{instructionText}</span>
        </div>

        {/* Row 2: 3 Compact Actions (Relancer, Jeu aléatoire, Passer l'entracte) */}
        <div className="entract-actions-row">
          {onRestart && (
            <button
              onClick={() => {
                sound.playClick();
                onRestart();
              }}
              className="entract-btn entract-btn-restart"
              title="Relancer cette partie d'entracte"
            >
              <span>🔄</span> Relancer
            </button>
          )}

          {onOtherGame && (
            <button
              onClick={() => {
                sound.playClick();
                onOtherGame();
              }}
              className="entract-btn entract-btn-other"
              title="Lancer immédiatement un autre jeu d'entracte au hasard"
            >
              <span>🎲</span> Jeu aléatoire
            </button>
          )}

          {onSkip && (
            <button
              onClick={() => {
                sound.playClick();
                onSkip();
              }}
              className="entract-btn entract-btn-skip"
              title="Passer cette entracte et reprendre le jeu principal"
            >
              <span>Passer</span> ⏭
            </button>
          )}

          {extraControls}
        </div>
      </div>

      {/* --- FOOTER OPTIONS (SPRINT FINAL 80% & REJOUER CETTE ENTRACTE) --- */}
      {isCtaVisible && !isDismissed && (
        <div className="entract-footer-bar">
          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#FDE68A', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span>⚡</span> SPRINT FINAL (80%+)
          </span>

          {onToggleReplaySame && (
            <button
              onClick={() => {
                sound.playClick();
                onToggleReplaySame(!replaySame);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                background: replaySame ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                border: replaySame ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '12px',
                padding: '3px 9px',
                fontSize: '0.75rem',
                fontWeight: '700',
                color: replaySame ? '#34d399' : '#e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none',
                whiteSpace: 'nowrap'
              }}
              title="Activer pour relancer automatiquement ce jeu d'entracte une fois terminé"
            >
              <span>{replaySame ? '🔄' : '🔁'}</span>
              <span>{replaySame ? 'Rejouer activé' : 'Rejouer cette entracte ?'}</span>
            </button>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              sound.playClick();
              setIsDismissed(true);
            }}
            className="entract-footer-close-btn"
            title="Fermer ce bloc"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>
      )}

      {isCtaVisible && isDismissed && (
        <button
          onClick={() => {
            sound.playClick();
            setIsDismissed(false);
          }}
          className="entract-footer-minimized-btn"
          title="Rouvrir les options d'entracte (80% / Rejouer)"
        >
          <span>⚡</span>
          <span>{replaySame ? 'Rejouer (ON)' : '80%+'}</span>
        </button>
      )}
    </>
  );
}
