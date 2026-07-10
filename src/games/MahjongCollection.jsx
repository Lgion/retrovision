import React, { useState } from 'react';

const collections = {
  mode: [
    { id: 'zen', type: 'free', name: 'Zen (Solitaire)', icon: '🧘', desc: 'Associez les tuiles libres sur plusieurs niveaux Z.' },
    { id: 'slide', type: 'free', name: 'Slider (Alignement)', icon: '↕️', desc: 'Glissez les tuiles pour connecter 2 symboles identiques.' }
  ],
  boardSize: [
    { id: 'small', type: 'free', name: 'Petite', icon: '🟢', desc: 'Parfait pour des parties courtes et rapides.' },
    { id: 'medium', type: 'free', name: 'Moyenne', icon: '🟡', desc: 'Équilibre idéal entre fun et réflexion.' },
    { id: 'large', type: 'free', name: 'Grande', icon: '🔴', desc: 'Pour les vrais amateurs de Mahjong.' }
  ],
  tileset: [
    { id: 'classic', type: 'free', name: 'Classique', icon: '🀄', desc: 'Symboles chinois traditionnels et bambous.' },
    { id: 'nature', type: 'free', name: 'Nature & Zen', icon: '🌸', desc: 'Fleurs, feuilles, vagues et montagnes.' },
    { id: 'cyber', type: 'free', name: 'Cyber Néon', icon: '⚡', desc: 'Éclairs néon, robots et gadgets futuristes.' },
    { id: 'modern', type: 'free', name: 'Formes & Chiffres', icon: '🟥', desc: 'Formes colorées et chiffres modernes.' }
  ],
  showArrows: [
    { id: 'show', type: 'free', name: 'Afficher', icon: '➡️', desc: 'Flèches de glissement en mode Slider.' },
    { id: 'hide', type: 'free', name: 'Masquer', icon: '❌', desc: 'Masquer les flèches d\'aide pour plus de défi.' }
  ]
};

const MahjongCollection = ({ onClose, currentSelections, onSelect }) => {
  const [activeTab, setActiveTab] = useState('tileset');

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: '#0a101d',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Title Header */}
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1a2936' }}>
        <button onClick={onClose} style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#ef4444',
          color: 'white',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
        }}>◀</button>
        <h2 style={{ margin: 0, color: '#10b981', fontFamily: 'Orbitron, sans-serif', textShadow: '0 0 10px rgba(16,185,129,0.3)' }}>BOUTIQUE MAHJONG</h2>
        <div style={{ width: '40px' }} />
      </div>

      {/* Tabs Menu */}
      <div style={{ display: 'flex', padding: '15px 20px', gap: '8px', overflowX: 'auto', background: '#0e1726' }}>
        {[
          { id: 'tileset', label: 'Sets de Tuiles' },
          { id: 'mode', label: 'Modes de Jeu' },
          { id: 'boardSize', label: 'Tailles de Grille' },
          { id: 'showArrows', label: 'Flèches d\'aide' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '10px 15px',
              background: activeTab === tab.id ? '#10b981' : '#1f2937',
              color: activeTab === tab.id ? '#FFF' : '#cbd5e1',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
          {collections[activeTab].map(item => {
            let isSelected = false;
            if (activeTab === 'showArrows') {
              const currentVal = currentSelections.showArrows ? 'show' : 'hide';
              isSelected = currentVal === item.id;
            } else {
              isSelected = currentSelections[activeTab] === item.id;
            }

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (activeTab === 'showArrows') {
                    onSelect('showArrows', item.id === 'show');
                  } else {
                    onSelect(activeTab, item.id);
                  }
                }}
                style={{
                  background: '#1e293b',
                  padding: '20px 15px',
                  borderRadius: '16px',
                  border: `2px solid ${isSelected ? '#10b981' : 'transparent'}`,
                  boxShadow: isSelected ? '0 0 15px rgba(16,185,129,0.2)' : '0 4px 6px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '12px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 'bold', textAlign: 'center', color: '#f8fafc', marginBottom: '6px', fontSize: '1rem' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', lineHeight: '1.3', flexGrow: 1 }}>
                  {item.desc}
                </div>
                {isSelected && (
                  <div style={{ color: '#10b981', marginTop: '10px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    ✅ Actif
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MahjongCollection;
