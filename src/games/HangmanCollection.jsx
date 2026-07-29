import React from 'react';
import Boutique from '../components/Boutique';

const categories = [
  {
    id: 'category',
    name: 'Thème de Mots',
    icon: '📚',
    items: [
      { id: 'mixte', name: 'Mélange (Aléatoire)', icon: '🎲' },
      { id: 'logique', name: 'Logique & Énigmes', icon: '🧠' },
      { id: 'science', name: 'Science & Espace', icon: '🚀' },
      { id: 'mythes', name: 'Mythes & Légendes', icon: '🐉' }
    ]
  },
  {
    id: 'difficulty',
    name: 'Niveau',
    icon: '⚡',
    items: [
      { id: 'facile', name: 'Clément (8 Vies + 1 Indice)', icon: '🟢' },
      { id: 'moyen', name: 'Classique (6 Vies)', icon: '🟡' },
      { id: 'difficile', name: 'Strict (4 Vies)', icon: '🔴' }
    ]
  },
  {
    id: 'theme',
    name: 'Style Visuel',
    icon: '🎨',
    items: [
      { id: 'chalk', name: 'Tableau Noir', icon: '🖍️' },
      { id: 'paper', name: 'Cahier d\'écolier', icon: '📝' },
      { id: 'neon', name: 'Cyber-Pendu', icon: '🌌' },
      { id: 'parchment', name: 'Parchemin Ancien', icon: '📜' }
    ]
  }
];

export default function HangmanCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE PENDU"
      icon="🔤"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
