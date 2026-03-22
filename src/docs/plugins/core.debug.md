# Development Tool: `_debug`

The **Debug Plugin** is a lightweight reactive listener. Once attached to a signal or a computed function, it automatically monitors changes, compares values, and formats the output in the browser console.

## 1. Core Features

* **Reactive Tracking:** Automatically logs whenever the tracked signal updates.
* **Visual Grouping:** Uses styled console groups to keep your dev tools organized.
* **Object Inspection:** Automatically uses `console.table()` when the signal contains an object or array.
* **Efficient Comparison:** Uses `Object.is` to prevent redundant logging if the value hasn't actually changed.

---

## 2. Installation

To use `_debug`, you only need the SigPro core. Register the plugin in your `main.js`. You can conditionally load it so it only runs during development.

```javascript
import { $ } from 'sigpro';
import { Debug } from 'sigpro/plugins';

// Only load Debug in development mode
const plugins = [];
if (import.meta.env.DEV) plugins.push(Debug);

$.plugin(plugins).then(() => {
  import('./App.js').then(app => $.mount(app.default));
});
```

::: code-group
```bash [NPM]
npm install sigpro
```

```bash [PNPM]
pnpm add sigpro
```

```bash [Yarn]
yarn add sigpro
```

```bash [Bun]
bun add sigpro
```
:::

---

## 3. Basic Usage

Call `_debug` anywhere in your component. It stays active in the background, watching the signal's lifecycle.

```javascript
export default () => {
  const $count = $(0);
  const $user = $({ name: "Guest", role: "Viewer" });

  // Start tracking
  _debug($count, "Main Counter");
  _debug($user, "User Session");

  return div([
    button({ onclick: () => $count(c => c + 1) }, "Increment"),
    button({ onclick: () => $user({ name: "Admin", role: "Super" }) }, "Promote")
  ]);
};
```

---

## 4. Console Output Breakdown

When a signal changes, the console displays a structured block:

1.  **Header:** A styled badge with the name (e.g., `SigPro Debug: Main Counter`).
2.  **Previous Value:** The value before the update (in red).
3.  **Current Value:** The new value (in green).
4.  **Table View:** If the value is an object, a formatted table appears automatically.



---

## 5. Debugging Computed Values

You can also debug **computed functions** to see exactly when derived state is recalculated.

```javascript
const $price = $(100);
const $tax = $(0.21);
const $total = $(() => $price() * (1 + $tax()));

// Monitor the result of the calculation
_debug($total, "Final Invoice Total");
```

---

## 6. Why use `_debug`?

1.  **Clean Logic:** No need to scatter `console.log` inside your reactive functions.
2.  **State History:** Instantly see the "Before" and "After" of any user action.
3.  **No-Noise:** It only logs when a real change occurs, keeping the console clean.
4.  **Deep Inspection:** The automatic `console.table` makes debugging large API responses much faster.

