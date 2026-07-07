import React, { useState } from 'react';

const collections = {
  category: [
    { id: 'mixte', type: 'free', name: 'Mélange (Aléatoire)', icon: '🎲' },
    { id: 'logique', type: 'free', name: 'Logique & Énigmes', icon: '🧠' },
    { id: 'science', type: 'free', name: 'Science & Espace', icon: '🚀' },
    { id: 'mythes', type: 'free', name: 'Mythes & Légendes', icon: '🐉' }
  ],
  difficulty: [
    { id: 'facile', type: 'free', name: 'Clément (8 Vies + 1 Indice)', icon: '🟢' },
    { id: 'moyen', type: 'free', name: 'Classique (6 Vies)', icon: '🟡' },
    { id: 'difficile', type: 'free', name: 'Strict (4 Vies)', icon: '🔴' }
  ],
  theme: [
    { id: 'chalk', type: 'free', name: 'Tableau Noir', icon: '🖍️' },
    { id: 'paper', type: 'free', name: 'Cahier d\'écolier', icon: '📝' },
    { id: 'neon', type: 'free', name: 'Cyber-Pendu', icon: '🌌' },
    { id: 'parchment', type: 'free', name: 'Parchemin Ancien', icon: '📜' }
  ]
};

const HangmanCollection = ({ onClose, currentSelections, onSelect }) => {
  const [activeTab, setActiveTab] = useState('category');

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: '#1A1C29', zIndex: 1000, display: 'flex', flexDirection: 'column', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ef4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>◀</button>
        <h2 style={{ margin: 0, color: '#ef4444' }}>BOUTIQUE PENDU</h2>
        <div style={{ width: '40px' }} />
      </div>

      <div style={{ display: 'flex', padding: '0 20px', gap: '10px', marginBottom: '20px' }}>
        {['category', 'difficulty', 'theme'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', background: activeTab === tab ? '#ef4444' : '#333', color: activeTab === tab ? '#FFF' : 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize' }}>
            {tab === 'category' ? 'Catégorie' : tab === 'difficulty' ? 'Niveau' : 'Thème'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px' }}>
          {collections[activeTab].map(item => {
            const isSelected = currentSelections[activeTab] === item.id;
            return (
              <div key={item.id} onClick={() => onSelect(activeTab, item.id)} style={{ background: '#2A2C39', padding: '15px', borderRadius: '12px', border: `2px solid ${isSelected ? '#ef4444' : 'transparent'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
                  {item.icon}
                </div>
                <div style={{ fontWeight: 'bold', textAlign: 'center' }}>{item.name}</div>
                {isSelected && <div style={{ color: '#ef4444', marginTop: '5px' }}>✅ Actif</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HangmanCollection;
