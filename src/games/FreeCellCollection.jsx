import React, { useState } from 'react';

const collections = {
  difficulty: [
    { id: 'facile', type: 'free', name: 'Facile (4 Cellules Libres)' },
    { id: 'moyen', type: 'free', name: 'Moyen (3 Cellules Libres)' },
    { id: 'difficile', type: 'free', name: 'Difficile (2 Cellules Libres)' }
  ],
  theme: [
    { id: 'classic', type: 'free', name: 'Tapis Vert Classique' },
    { id: 'dark', type: 'free', name: 'Mode Sombre' },
    { id: 'royal', type: 'free', name: 'Tapis Rouge Royal' }
  ]
};

const FreeCellCollection = ({ onClose, currentSelections, onSelect }) => {
  const [activeTab, setActiveTab] = useState('difficulty');

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#1A1C29', zIndex: 1000, display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>◀</button>
        <h2 style={{ margin: 0, color: '#10b981' }}>BOUTIQUE FREECELL</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ display: 'flex', padding: '0 20px', gap: '10px', marginBottom: '20px' }}>
        {['difficulty', 'theme'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', background: activeTab === tab ? '#10b981' : '#333', color: activeTab === tab ? '#FFF' : 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {tab === 'difficulty' ? 'Niveau' : 'Thème'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
          {collections[activeTab].map(item => {
            const isSelected = currentSelections[activeTab] === item.id;
            return (
              <div key={item.id} onClick={() => onSelect(activeTab, item.id)} style={{ background: '#2A2C39', padding: '15px', borderRadius: '12px', border: `2px solid ${isSelected ? '#10b981' : 'transparent'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                  {activeTab === 'difficulty' ? (item.id === 'facile' ? '🟢' : item.id === 'moyen' ? '🟡' : '🔴') : '🎨'}
                </div>
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{item.name}</div>
                {isSelected && <div style={{ color: '#10b981', marginTop: '5px' }}>✅ Actif</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FreeCellCollection;
