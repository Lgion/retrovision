
import Boutique from '../components/Boutique';

const categories = [
  {
    id: 'difficulty',
    name: 'Niveau',
    icon: '⚡',
    items: [
      { id: 'facile', name: 'Facile (Petit)', icon: '🟢' },
      { id: 'moyen', name: 'Moyen (Moyen)', icon: '🟡' },
      { id: 'difficile', name: 'Difficile (Grand)', icon: '🔴' }
    ]
  },
  {
    id: 'theme',
    name: 'Thème Visuel',
    icon: '🎨',
    items: [
      { id: 'classic', name: 'Minimaliste', icon: '🏹' },
      { id: 'light', name: 'Clair Épuré', icon: '☀️' },
      { id: 'midnight', name: 'Nuit Mate', icon: '🌙' },
      { id: 'nature', name: 'Bambou Zen', icon: '🎋' },
      { id: 'navy', name: 'Encre Bleue', icon: '🖋️' }
    ]
  }
];

export default function ArrowPuzzleCollection({ onClose, currentSelections, onSelect }) {
  return (
    <Boutique
      title="BOUTIQUE ARROW"
      icon="🏹"
      categories={categories}
      currentSelections={currentSelections}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
}
