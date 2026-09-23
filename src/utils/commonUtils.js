/**
 * Utilitaires mathématiques, manipulation de tableaux et formatage standardisés (DRY).
 */

/**
 * Mélange un tableau de façon immuable selon l'algorithme de Fisher-Yates (Knuth).
 * @template T
 * @param {T[]} array
 * @returns {T[]} Nouveau tableau mélangé
 */
export function shuffle(array) {
  if (!Array.isArray(array)) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Mélange un tableau en place (mutation directe) selon Fisher-Yates.
 * @template T
 * @param {T[]} array
 * @returns {T[]} Le même tableau mélangé
 */
export function shuffleInPlace(array) {
  if (!Array.isArray(array)) return array;
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Sélectionne un élément aléatoire dans un tableau de façon sécurisée.
 * @template T
 * @param {T[]} array
 * @returns {T|null}
 */
export function randomChoice(array) {
  if (!Array.isArray(array) || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Génère un entier pseudo-aléatoire uniforme dans l'intervalle fermé [min, max].
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function randomInt(min, max) {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

/**
 * Borne une valeur numérique dans l'intervalle [min, max].
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Formate un nombre total de secondes en chaîne "MM:SS".
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds || 0));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
