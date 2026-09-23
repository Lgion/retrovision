import { useState } from 'react';
import { getIntermissionGames } from '../utils/gamesConfig';
import { storage } from '../utils/storage';

/**
 * Modale de configuration des entractes (activation des jeux, fréquence, difficulté, panneau d'intro).
 * Utilise GAMES_CONFIG comme unique source de vérité.
 */
export default function IntermissionSettingsModal({ config, onClose, onSave, onChange }) {
  const [tempConfig, setTempConfig] = useState(() => JSON.parse(JSON.stringify(config)));
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggle = (gameKey) => {
    setTempConfig((prev) => {
      const next = { ...prev };
      const current = next[gameKey] || { enabled: false, frequency: 'medium', difficulty: 'facile' };
      next[gameKey] = {
        ...current,
        enabled: !current.enabled,
      };
      if (onChange) onChange(next);
      return next;
    });
    setErrorMsg('');
  };

  const handleFrequency = (gameKey, freq) => {
    setTempConfig((prev) => {
      const next = { ...prev };
      const current = next[gameKey] || { enabled: true, frequency: 'medium', difficulty: 'facile' };
      next[gameKey] = {
        ...current,
        frequency: freq,
      };
      if (onChange) onChange(next);
      return next;
    });
  };

  const handleDifficulty = (gameKey, diff) => {
    setTempConfig((prev) => {
      const next = { ...prev };
      const current = next[gameKey] || { enabled: true, frequency: 'medium', difficulty: 'facile' };
      next[gameKey] = {
        ...current,
        difficulty: diff,
      };
      if (onChange) onChange(next);
      return next;
    });
  };

  const handleToggleShowIntro = () => {
    setTempConfig((prev) => {
      const next = {
        ...prev,
        showIntroModal: !prev.showIntroModal,
      };
      const parsed = storage.getJSON('retrovision_intermission_config', {}) || {};
      parsed.showIntroModal = next.showIntroModal;
      storage.setJSON('retrovision_intermission_config', parsed);
      if (onChange) onChange(next);
      return next;
    });
  };

  const handleSave = () => {
    const anyEnabled = Object.keys(tempConfig)
      .filter((k) => k !== 'showIntroModal')
      .some((g) => tempConfig[g]?.enabled);
    if (!anyEnabled) {
      setErrorMsg('Veuillez activer au moins un jeu pour les entractes.');
      return;
    }
    onSave(tempConfig);
  };

  const handleClose = () => {
    const anyEnabled = Object.keys(tempConfig)
      .filter((k) => k !== 'showIntroModal')
      .some((g) => tempConfig[g]?.enabled);
    if (anyEnabled) {
      onSave(tempConfig);
    } else {
      onClose();
    }
  };

  // Liste des jeux disponibles pour les entractes depuis la configuration centralisée (SSOT)
  const intermissionGames = getIntermissionGames();

  return (
    <div
      className="modal-backdrop"
      style={modalBackdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>
            ⚙️ PARAMÈTRES DES ENTRACTES
          </h2>
          <button onClick={handleClose} style={closeBtnStyle} aria-label="Fermer">✕</button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.4' }}>
          Sélectionnez les jeux qui apparaîtront en entracte après vos parties de Mahjong, et ajustez leur fréquence d'apparition.
        </p>

        {/* Option globale d'affichage de la modale de pré-configuration */}
        <div
          style={{
            background: 'rgba(59, 130, 246, 0.05)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '16px',
            padding: '16px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '2px' }}>
              🎬 Panneau de Pré-configuration
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: '1.3' }}>
              Afficher le modal de réglage temporaire avant le début de chaque entracte (désactivé par défaut).
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleShowIntro}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: `2px solid ${tempConfig.showIntroModal ? '#10B981' : '#CBD5E1'}`,
              background: tempConfig.showIntroModal ? '#10B98122' : '#F1F5F9',
              color: tempConfig.showIntroModal ? '#059669' : '#64748B',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {tempConfig.showIntroModal ? '🟢 Activé' : '⚪ Désactivé'}
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              color: '#ef4444',
              background: '#fee2e2',
              padding: '10px 16px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontWeight: 'bold',
              fontSize: '0.85rem',
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          {intermissionGames.map((game) => {
            const gameKey = game.id;
            const gameConf = tempConfig[gameKey] || { enabled: false, frequency: 'medium' };
            const icon = game.settingsIcon || game.icon;

            return (
              <div
                key={gameKey}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '16px',
                  border: `1px solid ${gameConf.enabled ? 'rgba(59, 130, 246, 0.2)' : '#e2e8f0'}`,
                  background: gameConf.enabled ? 'rgba(59, 130, 246, 0.03)' : '#f8fafc',
                  transition: 'all 0.2s ease',
                }}
              >
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                  onClick={() => handleToggle(gameKey)}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      border: `2px solid ${gameConf.enabled ? game.color : '#94a3b8'}`,
                      background: gameConf.enabled ? game.color : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {gameConf.enabled && '✓'}
                  </div>
                  <span style={{ fontSize: '20px' }}>{icon}</span>
                  <span
                    style={{
                      fontWeight: '700',
                      color: gameConf.enabled ? 'var(--text-main)' : '#64748b',
                      fontSize: '0.95rem',
                    }}
                  >
                    {game.name}
                  </span>
                </div>

                {gameConf.enabled ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '10px' }}>
                      {['low', 'medium', 'high'].map((freq) => {
                        const label = freq === 'low' ? 'Rare' : freq === 'medium' ? 'Normal' : 'Fréquent';
                        const isSelected = gameConf.frequency === freq;
                        return (
                          <button
                            key={freq}
                            onClick={() => handleFrequency(gameKey, freq)}
                            style={{
                              border: 'none',
                              background: isSelected ? '#ffffff' : 'transparent',
                              color: isSelected ? game.color : '#64748b',
                              boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: '800',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', background: '#fef08a', padding: '3px', borderRadius: '10px' }}>
                      {['facile', 'moyen', 'difficile'].map((diff) => {
                        const isSelected = (gameConf.difficulty || 'facile') === diff;
                        return (
                          <button
                            key={diff}
                            onClick={() => handleDifficulty(gameKey, diff)}
                            style={{
                              border: 'none',
                              background: isSelected ? '#eab308' : 'transparent',
                              color: isSelected ? '#ffffff' : '#a16207',
                              boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.1)' : 'none',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                              textTransform: 'capitalize',
                            }}
                          >
                            {diff}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', paddingRight: '12px' }}>
                    Désactivé
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClose}
            className="retro-btn"
            style={{
              padding: '10px 20px',
              borderColor: '#cbd5e1',
              color: '#64748b',
              background: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            Fermer
          </button>
          <button
            onClick={handleSave}
            className="retro-btn"
            style={{
              padding: '10px 24px',
              borderColor: 'var(--primary)',
              color: '#ffffff',
              background: 'var(--primary)',
              fontSize: '0.9rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)',
            }}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

const modalBackdropStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(8px)',
  zIndex: 10000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px',
};

const modalContentStyle = {
  width: '520px',
  maxWidth: '100%',
  height: '100%',
  overflowY: 'scroll',
  background: '#ffffff',
  borderRadius: '24px',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15)',
  border: '1px solid rgba(226, 232, 240, 0.8)',
  padding: '28px',
  fontFamily: "'Outfit', 'Inter', sans-serif",
  boxSizing: 'border-box',
  position: 'relative',
  animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both',
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
};

const closeBtnStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '18px',
  cursor: 'pointer',
  color: '#94a3b8',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'color 0.15s ease',
};
