/**
 * Moteur de stockage résilient avec fallback mémoire automatique (DRY).
 * Sécurise les accès à localStorage contre les erreurs de quota, la navigation privée,
 * ou les environnements où le stockage local est restreint.
 */

const memoryStore = new Map();

function isLocalStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;
    const testKey = '__retrovision_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const hasLocalStorage = isLocalStorageAvailable();

export const storage = {
  /**
   * Récupère une chaîne brute.
   * @param {string} key
   * @param {string|null} [defaultValue=null]
   * @returns {string|null}
   */
  getItem(key, defaultValue = null) {
    try {
      if (hasLocalStorage) {
        const val = window.localStorage.getItem(key);
        return val !== null ? val : defaultValue;
      }
      return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
    } catch {
      return memoryStore.has(key) ? memoryStore.get(key) : defaultValue;
    }
  },

  /**
   * Enregistre une chaîne brute.
   * @param {string} key
   * @param {string} value
   */
  setItem(key, value) {
    const strVal = String(value);
    memoryStore.set(key, strVal);
    try {
      if (hasLocalStorage) {
        window.localStorage.setItem(key, strVal);
      }
    } catch {
      // Ignorer si quota ou restriction
    }
  },

  /**
   * Récupère et parse un objet JSON en toute sécurité.
   * @template T
   * @param {string} key
   * @param {T} [defaultValue=null]
   * @returns {T}
   */
  getJSON(key, defaultValue = null) {
    const raw = this.getItem(key, null);
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  },

  /**
   * Sérialise et enregistre un objet JSON.
   * @param {string} key
   * @param {any} value
   */
  setJSON(key, value) {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch {
      // Ignorer
    }
  },

  /**
   * Récupère un nombre typé (entier ou flottant).
   * @param {string} key
   * @param {number} [defaultValue=0]
   * @returns {number}
   */
  getNumber(key, defaultValue = 0) {
    const raw = this.getItem(key, null);
    if (raw === null) return defaultValue;
    const num = Number(raw);
    return Number.isFinite(num) ? num : defaultValue;
  },

  /**
   * Récupère un booléen ('true'/'false').
   * @param {string} key
   * @param {boolean} [defaultValue=false]
   * @returns {boolean}
   */
  getBoolean(key, defaultValue = false) {
    const raw = this.getItem(key, null);
    if (raw === null) return defaultValue;
    return raw === 'true' || raw === '1';
  },

  /**
   * Supprime une clé.
   * @param {string} key
   */
  removeItem(key) {
    memoryStore.delete(key);
    try {
      if (hasLocalStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignorer
    }
  }
};
