/**
 * Utilitaire de retour haptique pour smartphone
 * Offre un feedback tactile discret pour accompagner les actions motrices et cognitives.
 * Conçu spécifiquement pour la rééducation post-AVC (sécurisé, non-intrusif).
 */

const canVibrate = typeof window !== 'undefined' && typeof navigator !== 'undefined' && Boolean(navigator.vibrate);

export const haptic = {
  /**
   * Vibration courte (30ms) pour clic sur bouton ou sélection tactile
   */
  tap: (duration = 30) => {
    if (!canVibrate) return;
    try {
      navigator.vibrate(duration);
    } catch {
      // Ignorer silencieusement si l'API est restreinte
    }
  },

  /**
   * Double pulsation douce (40ms, 50ms pause, 40ms) pour action réussie ou victoire
   */
  success: () => {
    if (!canVibrate) return;
    try {
      navigator.vibrate([40, 50, 40]);
    } catch {
      // Ignorer silencieusement
    }
  },

  /**
   * Pulsation très douce (20ms) pour les mots doux et transitions apaisantes
   */
  gentle: () => {
    if (!canVibrate) return;
    try {
      navigator.vibrate(20);
    } catch {
      // Ignorer silencieusement
    }
  },

  /**
   * Pulsation d'alerte ou annulation (50ms, 40ms pause, 50ms)
   */
  warning: () => {
    if (!canVibrate) return;
    try {
      navigator.vibrate([50, 40, 50]);
    } catch {
      // Ignorer silencieusement
    }
  }
};

export default haptic;
