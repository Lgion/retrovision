import React from 'react';
import Boutique from '../components/Boutique';

const categories = [
  {
    id: 'tileset',
    name: 'Sets de Tuiles',
    icon: '🀄',
    items: [
      { id: 'classic', name: 'Classique', icon: '🀄', description: 'Symboles chinois traditionnels et bambous.' },
      { id: 'nature', name: 'Créatures Célestes', icon: '🐉', description: 'Créatures mythologiques en émail cloisonné & or 24K sur onyx noir.' },
      { id: 'cyber', name: 'Marbre Noir & Or', icon: '⚜️', description: 'Gravure or pur et rubis sur marbre noir profond, haute lisibilité.' },
      { id: 'modern', name: 'Chiffres Kanjis (Bois)', icon: '🪵', description: 'Kanjis d\'honneur gravés sur bois noble.' },
      { id: 'mosaic', name: 'Art Graphique & Botanique', icon: '🌿', description: 'Faune, flore et symboles géométriques modernes sur porcelaine ivoire.' },
      { id: 'luxury_marble_2', name: 'Marbre & Joaillerie', icon: '👑', description: 'Marbre blanc de Carrare, émail saphir et jade émeraude.' }
    ]
  },
  {
    id: 'mode',
    name: 'Modes de Jeu',
    icon: '🎮',
    items: [
      { id: 'zen', name: 'Zen (Solitaire)', icon: '🧘', description: 'Associez les tuiles libres sur plusieurs niveaux Z.' },
      { id: 'slide', name: 'Slider (Alignement)', icon: '↕️', description: 'Glissez les tuiles pour connecter 2 symboles identiques.' }
    ]
  },
  {
    id: 'boardSize',
    name: 'Tailles de Grille',
    icon: '📐',
    items: [
      { id: 'small', name: 'Petite', icon: '🟢', description: 'Parfait pour des parties courtes et rapides.' },
      { id: 'medium', name: 'Moyenne', icon: '🟡', description: 'Équilibre idéal entre fun et réflexion.' },
      { id: 'large', name: 'Grande', icon: '🔴', description: 'Pour les vrais amateurs de Mahjong.' }
    ]
  },
  {
    id: 'showArrows',
    name: 'Flèches d\'Aide',
    icon: '➡️',
    items: [
      { id: 'show', name: 'Afficher', icon: '➡️', description: 'Flèches de glissement en mode Slider.' },
      { id: 'hide', name: 'Masquer', icon: '❌', description: 'Masquer les flèches d\'aide pour plus de défi.' }
    ]
  }
];

export default function MahjongCollection({ onClose, currentSelections, onSelect }) {
  const selections = {
    ...currentSelections,
    showArrows: currentSelections.showArrows ? 'show' : 'hide'
  };

  const handleSelect = (categoryKey, itemId) => {
    if (categoryKey === 'showArrows') {
      onSelect('showArrows', itemId === 'show');
    } else {
      onSelect(categoryKey, itemId);
    }
  };

  return (
    <Boutique
      title="BOUTIQUE MAHJONG"
      icon="🀄"
      categories={categories}
      currentSelections={selections}
      onSelect={handleSelect}
      onClose={onClose}
    />
  );
}
