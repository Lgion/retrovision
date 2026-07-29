import React, { useState } from 'react';
import { sound } from '../utils/sound';

/**
 * Generic reusable Boutique / Collection component for all games in RetroVision.
 * 
 * Props:
 * - title: string (e.g. "BOUTIQUE PENDU")
 * - icon: string (e.g. "🛒")
 * - categories: Array of category objects:
 *     {
 *       id: 'theme',
 *       name: 'Thèmes Visuels',
 *       icon: '🎨',
 *       layout: 'grid' | 'list' | 'buttons',
 *       items: [
 *         { id: 'classic', name: 'Classique', icon: '✨', description: 'Style rétro', renderPreview?: (isActive) => ReactNode }
 *       ]
 *     }
 * - currentSelections: Record<string, string|number> (e.g. { theme: 'classic', difficulty: 'easy' })
 * - onSelect: (categoryKey: string, itemId: string|number) => void
 * - onClose: () => void
 */
export default function Boutique({
  title = "BOUTIQUE",
  icon = "🛒",
  categories = [],
  currentSelections = {},
  onSelect,
  onClose
}) {
  const [activeTabId, setActiveTabId] = useState(() => {
    return categories.length > 0 ? categories[0].id : '';
  });

  const handleSelect = (categoryKey, itemId) => {
    sound.playClick();
    if (onSelect) {
      onSelect(categoryKey, itemId);
    }
    if (onClose) {
      onClose();
    }
  };

  const handleClose = () => {
    sound.playClick();
    if (onClose) {
      onClose();
    }
  };

  const activeCategory = categories.find(cat => cat.id === activeTabId) || categories[0];

  return (
    <div 
      className="boutique-panel collection-panel" 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#1A1C29',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: '16px 20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <button
          onClick={handleClose}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#39FF14',
            color: '#000000',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(57, 255, 20, 0.4)',
            transition: 'transform 0.15s ease'
          }}
          title="Fermer la boutique"
        >
          ◀
        </button>

        <h2 
          style={{
            margin: 0,
            fontSize: '1.3rem',
            color: '#39FF14',
            fontFamily: 'Orbitron, system-ui, sans-serif',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>{icon}</span> {title}
        </h2>

        <div style={{ width: '40px' }} />
      </div>

      {/* Navigation Tabs (only shown if there are multiple categories) */}
      {categories.length > 1 && (
        <div 
          style={{
            display: 'flex',
            padding: '12px 20px 4px 20px',
            gap: '10px',
            overflowX: 'auto',
            background: 'rgba(0,0,0,0.1)'
          }}
        >
          {categories.map(cat => {
            const isActiveTab = cat.id === activeTabId;
            return (
              <button
                key={cat.id}
                onClick={() => { sound.playClick(); setActiveTabId(cat.id); }}
                style={{
                  flex: 1,
                  minWidth: '90px',
                  padding: '10px 14px',
                  background: isActiveTab ? '#39FF14' : '#2A2C39',
                  color: isActiveTab ? '#000000' : '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Content Body */}
      <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
        {activeCategory && (
          <div>
            {categories.length === 1 && (
              <h3 style={{ margin: '0 0 16px 0', color: '#8E8A9F', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {activeCategory.icon && <span style={{ marginRight: '6px' }}>{activeCategory.icon}</span>}
                {activeCategory.name}
              </h3>
            )}

            {/* Layout switch based on category config */}
            {activeCategory.layout === 'buttons' ? (
              /* Button grid layout (useful for levels or numerical choices) */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))', gap: '12px' }}>
                {activeCategory.items.map(item => {
                  const isSelected = currentSelections[activeCategory.id] === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(activeCategory.id, item.id)}
                      style={{
                        height: '60px',
                        borderRadius: '12px',
                        border: `2px solid ${isSelected ? '#39FF14' : 'transparent'}`,
                        backgroundColor: isSelected ? '#39FF14' : '#2A2C39',
                        color: isSelected ? '#000000' : '#FFFFFF',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {item.icon && <span>{item.icon}</span>}
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Standard Card Grid Layout */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
                {activeCategory.items.map(item => {
                  const isSelected = currentSelections[activeCategory.id] === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelect(activeCategory.id, item.id)}
                      style={{
                        background: '#2A2C39',
                        padding: '16px',
                        borderRadius: '14px',
                        border: `2px solid ${isSelected ? '#39FF14' : 'transparent'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isSelected ? '0 0 15px rgba(57, 255, 20, 0.2)' : 'none',
                        position: 'relative'
                      }}
                    >
                      {/* Optional custom render preview or icon */}
                      {item.renderPreview ? (
                        item.renderPreview(isSelected)
                      ) : item.icon ? (
                        <div style={{ fontSize: '2.8rem', marginBottom: '10px' }}>{item.icon}</div>
                      ) : null}

                      <div style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '1rem', color: '#FFFFFF' }}>
                        {item.name}
                      </div>

                      {item.description && (
                        <div style={{ fontSize: '0.8rem', color: '#8E8A9F', marginTop: '4px', textAlign: 'center' }}>
                          {item.description}
                        </div>
                      )}

                      {/* Status / Active Badge */}
                      <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 'bold', color: isSelected ? '#39FF14' : item.badge ? '#10B981' : '#8E8A9F' }}>
                        {isSelected ? '✅ Actif' : item.badge || 'Utiliser'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
