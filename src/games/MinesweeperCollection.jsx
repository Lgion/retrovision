
import Boutique from '../components/Boutique';

const categories = [
  {
    id: 'difficulty',
    name: 'Niveau',
    icon: '💣',
    items: [
      { id: 'facile', name: 'Facile (9x9, 10 Mines)', icon: '🟢' },
      { id: 'moyen', name: 'Moyen (12x12, 25 Mines)', icon: '🟡' },
      { id: 'difficile', name: 'Difficile (16x16, 40 Mines)', icon: '🔴' }
    ]
  },
  {
    id: 'theme',
    name: 'Thème Visuel',
    icon: '🎨',
    items: [
      { id: 'classic', name: 'Classique Windows', icon: '💻' },
      { id: 'dark', name: 'Opération Nocturne', icon: '🌑' },
      { id: 'neon', name: 'Cyberspace', icon: '🌌' },
      { id: 'retro_green', name: 'Terminal Vert', icon: '📟' },
      { id: 'glassmorphism', name: 'Verre Dépoli', icon: '🧊' }
    ]
  }
];

export default function MinesweeperCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE DÉMINEUR"
      icon="💣"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
