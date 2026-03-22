/**
 * SigPro Debug Plugin
 * Reactive state logger for signals and computed values.
 */
export const Debug = ($) => {
  /**
   * Tracks a signal and logs every state change to the browser console.
   * @param {Function} $sig - The reactive signal or computed function to monitor.
   * @param {string} [name="Signal"] - A custom label to identify the log entry.
   * @example
   * const $count = $(0);
   * $.debug($count, "Counter");
   * $count(1); // Logs: Counter | Old: 0 | New: 1
   */
  _debug = ($sig, name = "Signal") => {
    if (typeof $sig !== 'function') {
      return console.warn(`[SigPro Debug] Cannot track "${name}": Not a function/signal.`);
    }

    let prev = $sig();

    $(() => {
      const next = $sig();

      if (Object.is(prev, next)) return;

      console.group(`%c SigPro Debug: ${name} `, "background: #1a1a1a; color: #bada55; font-weight: bold; border-radius: 3px; padding: 2px;");

      console.log("%c Previous Value:", "color: #ff6b6b; font-weight: bold;", prev);
      console.log("%c Current Value: ", "color: #51cf66; font-weight: bold;", next);

      if (next && typeof next === 'object') {
        console.table(next);
      }

      console.groupEnd();

      prev = next;
    });
  };
};