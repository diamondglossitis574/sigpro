/**
 * SigPro Storage Plugin
 * Automatically synchronizes signals with localStorage.
 */
export const Storage = ($) => {
  /**
   * Persists a signal's value in localStorage.
   * @param {Function} $sig - The signal to persist.
   * @param {string} key - The localStorage key name.
   * @returns {Function} The same signal for chaining.
   */
  _storage = ($sig, key) => {
    // 1. Initial Load: If there's data in storage, update the signal immediately
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      try {
        $sig(JSON.parse(saved));
      } catch (e) {
        console.error(`[SigPro Storage] Error parsing key "${key}":`, e);
      }
    }

    // 2. Auto-Save: Every time the signal changes, update localStorage
    $(() => {
      const val = $sig();
      localStorage.setItem(key, JSON.stringify(val));
    });

    return $sig;
  };
};