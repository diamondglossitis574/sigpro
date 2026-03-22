# Persistence Tool: `_storage`

The Storage plugin synchronizes a signal with a specific key in your browser's `localStorage`. It handles both the **initial hydration** (loading data when the app starts) and **automatic saving** whenever the signal's value changes.

## 1. Core Concept

When you "attach" a signal to `_storage`, two things happen:
1.  **Hydration:** The plugin checks if the key already exists in `localStorage`. If it does, it parses the JSON and updates the signal immediately.
2.  **Reactive Sync:** It creates a reactive watcher that stringifies and saves the signal's value to the disk every time it is updated.

---

## 2. Installation

Register the `Storage` plugin in your `main.js`. Since this is a logic-only plugin, it doesn't require any CSS or UI dependencies.

```javascript
import { $ } from 'sigpro';
import { Storage } from 'sigpro/plugins';

$.plugin(Storage).then(() => {
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

You can wrap any signal with `_storage`. It is common practice to do this right after creating the signal.

```javascript
export default () => {
  // 1. Create a signal with a default value
  const $theme = $( 'light' );

  // 2. Persist it. If 'user_theme' exists in localStorage, 
  // $theme will be updated to that value instantly.
  _storage($theme, 'user_theme');

  return div({ class: () => `app-${$theme()}` }, [
    h1(`Current Theme: ${$theme()}`),
    button({ 
      onclick: () => $theme(t => t === 'light' ? 'dark' : 'light') 
    }, "Toggle Theme")
  ]);
};
```

---

## 4. Complex Data (Objects & Arrays)

Since the plugin uses `JSON.parse` and `JSON.stringify` internally, it works perfectly with complex state structures.

```javascript
const $settings = $({ 
  notifications: true, 
  fontSize: 16 
});

// Automatically saves the whole object whenever any property changes
_storage($settings, 'app_settings');
```

---

## 5. Why use `_storage`?

1.  **Zero Boilerplate:** You don't need to manually write `localStorage.getItem` or `setItem` logic inside your components.
2.  **Chaining:** Because `_storage` returns the signal, you can persist it inline.
3.  **Error Resilience:** It includes a built-in `try/catch` block to prevent your app from crashing if the stored JSON is corrupted.
4.  **Surgical Persistence:** Only the signals you explicitly mark for storage are saved, keeping your `localStorage` clean.



---

## 6. Pro Tip: Combining with Debug

You can chain plugins to create a fully monitored and persistent state:

```javascript
const $score = _storage($(0), 'high_score');

// Now it's saved to disk AND logged to console on every change
_debug($score, "Game Score");
```
