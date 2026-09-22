import React, { useEffect } from 'react';
import { sound } from '../utils/sound';
import { haptic } from '../utils/haptics';

export default function ConfirmModal({
  isOpen,
  title = "Confirmation",
  message = "Voulez-vous vraiment continuer ?",
  confirmText = "Confirmer",
  cancelText = "Annuler",
  confirmVariant = "danger", // 'danger' | 'warning' | 'primary'
  onConfirm,
  onCancel
}) {
  useEffect(() => {
    if (isOpen) {
      haptic.warning();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          sound.playClick();
          onCancel();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    sound.playClick();
    onConfirm();
  };

  const handleCancel = () => {
    sound.playClick();
    onCancel();
  };

  const isDanger = confirmVariant === 'danger';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(7, 11, 22, 0.78)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'cm-fade-in 0.2s ease-out forwards'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      <style>{`
        @keyframes cm-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes cm-slide-up {
          from { transform: translateY(20px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        .cm-dialog {
          width: 100%;
          max-width: 420px;
          background: linear-gradient(145deg, #111827 0%, #1f2937 100%);
          border: 2px solid ${isDanger ? '#ef4444' : '#38bdf8'};
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px ${isDanger ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.25)'};
          color: #ffffff;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          animation: cm-slide-up 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          box-sizing: border-box;
        }
        .cm-btn {
          flex: 1;
          min-height: 52px;
          padding: 12px 18px;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          border: none;
          touch-action: manipulation;
          user-select: none;
          box-sizing: border-box;
        }
        .cm-btn:active {
          transform: scale(0.96);
        }
        .cm-btn-cancel {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          border: 2px solid #34d399;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
        }
        .cm-btn-confirm-danger {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          border: 2px solid #ef4444;
          box-shadow: 0 4px 14px rgba(239, 68, 68, 0.2);
        }
        .cm-btn-confirm-primary {
          background: linear-gradient(135deg, #38bdf8, #2563eb);
          color: #ffffff;
          border: 2px solid #60a5fa;
          box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
        }
        @media (max-width: 480px) {
          .cm-dialog {
            padding: 20px 18px;
          }
          .cm-actions {
            flex-direction: column-reverse !important;
            gap: 12px !important;
          }
          .cm-btn {
            width: 100%;
            min-height: 52px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="cm-dialog">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
          <span style={{ fontSize: '2rem', lineHeight: 1 }}>{isDanger ? '⚠️' : 'ℹ️'}</span>
          <h2
            id="confirm-modal-title"
            style={{
              margin: 0,
              fontSize: '1.3rem',
              fontWeight: 800,
              color: '#f8fafc',
              fontFamily: 'Orbitron, sans-serif',
              letterSpacing: '0.5px'
            }}
          >
            {title}
          </h2>
        </div>

        <p
          style={{
            margin: '0 0 24px 0',
            fontSize: '1.05rem',
            lineHeight: '1.5',
            color: '#cbd5e1'
          }}
        >
          {message}
        </p>

        {/* Buttons: On mobile stacked with Cancel ("Rester") on bottom closest to thumb */}
        <div
          className="cm-actions"
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'stretch'
          }}
        >
          <button
            type="button"
            className={isDanger ? 'cm-btn cm-btn-confirm-danger' : 'cm-btn cm-btn-confirm-primary'}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="cm-btn cm-btn-cancel"
            onClick={handleCancel}
            autoFocus
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
