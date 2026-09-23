import { useState, useEffect } from 'react';
import { isRandomThemeEnabled, normalizeGameId } from '../utils/themeManager';

/**
 * Hook React réutilisable pour synchroniser l'état du thème aléatoire d'un jeu (DRY).
 * Écoute l'événement global 'retrovision_random_theme_toggled' et met à jour l'état réactif.
 * 
 * @param {string} gameId - L'identifiant canonique ou le nom du jeu
 * @returns {boolean} randomThemeActive
 */
export function useRandomTheme(gameId) {
  const normalizedId = normalizeGameId(gameId);
  const [randomThemeActive, setRandomThemeActive] = useState(() => isRandomThemeEnabled(normalizedId));

  useEffect(() => {
    const handleToggle = (e) => {
      if (e.detail?.gameId === normalizedId) {
        setRandomThemeActive(Boolean(e.detail.enabled));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('retrovision_random_theme_toggled', handleToggle);
      return () => window.removeEventListener('retrovision_random_theme_toggled', handleToggle);
    }
  }, [normalizedId]);

  return randomThemeActive;
}
