import React, { useState } from 'react';

// Mock data for the collections
const collections = {
  tube: [
    { id: 'wt1', type: 'free', name: 'Classique' },
    { id: 'wt2', type: 'free', name: 'Verre Fin' },
    { id: 'wt3', type: 'free', name: 'Fioles' },
    { id: 'wt4', type: 'free', name: 'Eprouvette' },
    { id: 'wt5', type: 'free', name: 'Gourde' },
    { id: 'wt6', type: 'free', name: 'Flacon' },
    { id: 'wt7', type: 'free', name: 'Bouteille' },
    { id: 'wt8', type: 'free', name: 'Vase' },
    { id: 'wt9', type: 'free', name: 'Carré' }
  ],
  theme: [
    { id: 'bg1', type: 'free', bg: '#1A1A1A', name: 'Sombre' },
    { id: 'bg2', type: 'free', bg: 'url("https://images.unsplash.com/photo-1518495973542-4542c06a5843?q=80&w=500&auto=format&fit=crop")', name: 'Nature' },
    { id: 'bg3', type: 'free', bg: 'url("https://images.unsplash.com/photo-1513569771920-c9e1d31714cb?q=80&w=500&auto=format&fit=crop")', name: 'Zen Galets' },
    { id: 'bg4', type: 'free', bg: 'url("https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?q=80&w=500&auto=format&fit=crop")', name: 'Rosée' },
    { id: 'bg5', type: 'free', bg: 'url("https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=500&auto=format&fit=crop")', name: 'Kawaii Art' },
    { id: 'bg6', type: 'free', bg: 'url("https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=500&auto=format&fit=crop")', name: 'Pastel' },
    { id: 'bg7', type: 'free', bg: 'url("https://images.unsplash.com/photo-1508739773402-3ce9cef36851?q=80&w=500&auto=format&fit=crop")', name: 'Cosmos' },
    { id: 'bg8', type: 'free', bg: 'url("https://images.unsplash.com/photo-1473448912268-2022ce9509d8?q=80&w=500&auto=format&fit=crop")', name: 'Forêt' },
    { id: 'bg9', type: 'free', bg: 'url("https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=500&auto=format&fit=crop")', name: 'Aurore' }
  ],
  color: [
    { id: 'wc1', type: 'free', palette: ['#00F0FF', '#39FF14', '#FF00CC'], name: 'Eau Néon' },
    { id: 'wc2', type: 'free', palette: ['#BAE1FF', '#BAFFC9', '#FFB3BA'], name: 'Sirop Pastel' },
    { id: 'wc3', type: 'free', palette: ['#FF007F', '#7DF9FF', '#BFFF00'], name: 'Boisson Cyber' },
    { id: 'wc4', type: 'free', palette: ['#A0522D', '#228B22', '#CD853F'], name: 'Terre & Nature' },
    { id: 'wc5', type: 'free', palette: ['#555555', '#999999', '#DDDDDD'], name: 'Encre Grise' },
    { id: 'wc6', type: 'free', palette: ['#FF0000', '#00FF00', '#0000FF'], name: 'Classique' },
    { id: 'wc7', type: 'free', palette: ['#00BFFF', '#1E90FF', '#000080'], name: 'Océan Profond' },
    { id: 'wc8', type: 'free', palette: ['#FF4500', '#FF8C00', '#FFD700'], name: 'Lave' },
    { id: 'wc9', type: 'free', palette: ['#000000', '#FFFFFF', '#FFFF00'], name: 'Contraste' }
  ]
};

const WaterSortCollection = ({ onClose, currentSelections, onSelect }) => {
  const [activeTab, setActiveTab] = useState('tube');

  const getMiniTubeStyle = (id) => {
    const baseColor = 'rgba(255,255,255,0.8)';
    const bgComplete = 'rgba(255,255,255,0.2)';
    switch(id) {
      case 'wt1': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 15px 15px', background: bgComplete };
      case 'wt2': return { border: `1px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 10px 10px', background: 'rgba(255,255,255,0.1)' };
      case 'wt3': return { border: `3px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 20px 20px', background: bgComplete };
      case 'wt4': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 5px 5px', background: bgComplete, width: '15px' };
      case 'wt5': return { border: `3px double ${baseColor}`, borderTop: 'none', borderRadius: '0 0 20px 20px', background: bgComplete };
      case 'wt6': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 8px 8px', background: bgComplete, width: '30px' };
      case 'wt7': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 12px 12px', background: bgComplete };
      case 'wt8': return { borderLeft: `3px solid ${baseColor}`, borderRight: `3px solid ${baseColor}`, borderBottom: `4px solid ${baseColor}`, borderRadius: '0 0 3px 3px', background: bgComplete };
      case 'wt9': return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 0 0', background: bgComplete };
      default: return { border: `2px solid ${baseColor}`, borderTop: 'none', borderRadius: '0 0 15px 15px', background: bgComplete };
    }
  };

  const renderItem = (item, index, category) => {
    const isSelected = currentSelections[category] === item.id;

    return (
      <div 
        key={item.id}
        onClick={() => onSelect(category, item.id)}
        style={{
          background: '#FFF8E7', // Polaroid off-white
          padding: '10px 10px 15px 10px',
          borderRadius: '8px',
          boxShadow: isSelected ? '0 0 0 4px #4CD964' : '0 4px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          cursor: 'pointer',
          aspectRatio: '1/1.4',
          overflow: 'hidden'
        }}
      >
        {/* Preview Area */}
        <div style={{
          width: '100%',
          flex: 1,
          background: category === 'theme' ? item.bg : '#60A5FA', // Use blue background for tubes/colors to contrast with white glass
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative'
        }}>
          {category === 'tube' && (
            <div style={{
              width: '24px',
              height: '60px',
              ...getMiniTubeStyle(item.id)
            }}></div>
          )}
          {category === 'color' && (
            <div style={{ display: 'flex', gap: '5px' }}>
              {item.palette.map((color, i) => (
                <div key={i} style={{ width: '15px', height: '20px', borderRadius: '4px', background: color, boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              ))}
            </div>
          )}
        </div>

        {/* Status / Requirement & Name */}
        <div style={{
          marginTop: '8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}>
          <span style={{ 
            fontSize: '1rem', 
            fontWeight: 'bold', 
            color: '#333',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}>
            {item.name}
          </span>
          {isSelected && <span style={{ fontSize: '1.2rem', color: '#4CD964', marginTop: '4px' }}>✅</span>}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, width: '100%', height: '100%',
      background: '#1A1C29', // Dark background for the whole screen
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        color: 'white'
      }}>
        <button 
          onClick={onClose}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: '#3B82F6',
            border: 'none',
            color: 'white',
            fontSize: '1.5rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
          }}
        >
          <span style={{ transform: 'translateX(-2px)' }}>◀</span>
        </button>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes floatSlow { 0%, 100% { transform: translateY(0) rotate(var(--rot)); } 50% { transform: translateY(-15px) rotate(calc(var(--rot) + 5deg)); } }
        @keyframes floatFast { 0%, 100% { transform: translateY(0) rotate(var(--rot)); } 50% { transform: translateY(-10px) rotate(calc(var(--rot) - 5deg)); } }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 15px rgba(123, 97, 255, 0.5), inset 0 0 10px rgba(123, 97, 255, 0.5); } 50% { box-shadow: 0 0 30px rgba(123, 97, 255, 0.8), inset 0 0 20px rgba(123, 97, 255, 0.8); } }
        @keyframes fall { 0% { transform: translateY(-50px) rotate(0deg); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(150px) rotate(360deg); opacity: 0; } }
      `}} />

      {/* Book Banner */}
      <div style={{
        textAlign: 'center',
        padding: '30px 10px 40px 10px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '-20px' // Pull up slightly
      }}>
        {/* Magical Aura Behind Book */}
        <div style={{
          position: 'absolute',
          width: '180px', height: '180px',
          background: 'radial-gradient(circle, rgba(123,97,255,0.6) 0%, rgba(0,0,0,0) 70%)',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }} />

        {/* Floating Polaroids (CSS simulated) */}
        {[
          { color: '#00F0FF', rot: '-20deg', top: '10%', left: '15%', anim: 'floatSlow' },
          { color: '#39FF14', rot: '15deg', top: '5%', right: '20%', anim: 'floatFast' },
          { color: '#FF00CC', rot: '-10deg', bottom: '20%', left: '10%', anim: 'floatFast' },
          { color: '#FFD700', rot: '25deg', bottom: '25%', right: '15%', anim: 'floatSlow' }
        ].map((p, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: p.top, left: p.left, right: p.right, bottom: p.bottom,
            width: '40px', height: '50px',
            background: 'white',
            borderRadius: '4px',
            padding: '4px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            '--rot': p.rot,
            animation: `${p.anim} ${3 + i}s ease-in-out infinite`,
            zIndex: 1,
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ flex: 1, background: p.color, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '24px', border: '1px solid rgba(255,255,255,0.8)', borderRadius: '0 0 6px 6px', borderTop: 'none' }} />
            </div>
            <div style={{ height: '8px' }} />
          </div>
        ))}

        {/* Confetti Particles */}
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: '8px', height: '8px',
            background: ['#FFD700', '#FF3366', '#33CCFF'][i % 3],
            left: `${15 + i * 15}%`,
            top: '0',
            animation: `fall ${2 + i * 0.5}s linear infinite`,
            animationDelay: `${i * 0.3}s`
          }} />
        ))}

        {/* The Book */}
        <div style={{ 
          fontSize: '7rem', 
          zIndex: 2, 
          filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.5))',
          transform: 'perspective(500px) rotateX(10deg)',
          marginTop: '-10px'
        }}>
          📖
        </div>

        {/* Collection Badge */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          background: 'linear-gradient(90deg, rgba(76, 58, 204, 0.9), rgba(116, 94, 255, 0.9))',
          border: '3px solid rgba(255, 215, 0, 0.6)',
          borderRadius: '30px',
          padding: '5px 30px',
          zIndex: 10,
          backdropFilter: 'blur(5px)',
          animation: 'pulseGlow 2s infinite',
          boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
          transform: 'scale(1.1)'
        }}>
          <h1 style={{
            margin: 0,
            background: 'linear-gradient(180deg, #FFF9C4, #FFD700, #F59E0B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.8))',
            fontSize: '2rem',
            fontWeight: '900',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Collection
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        marginTop: '20px',
        background: '#3B82F6',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        padding: '10px 10px 0 10px',
        gap: '5px'
      }}>
        {['tube', 'theme', 'color'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '12px 0',
              background: activeTab === tab ? '#FDF6E3' : '#60A5FA',
              border: 'none',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              color: activeTab === tab ? '#8B4513' : 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background 0.2s',
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
          >
            {tab === 'theme' ? 'Thème' : tab === 'color' ? 'Couleur' : 'Tube'}
          </button>
        ))}
      </div>

      {/* Grid Container */}
      <div style={{
        flex: 1,
        background: '#FDF6E3',
        padding: '20px',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          {collections[activeTab].map((item, index) => renderItem(item, index, activeTab))}
        </div>
      </div>
    </div>
  );
};

export default WaterSortCollection;
