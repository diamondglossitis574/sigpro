# SigPro ⚡
**The Ultra-Lightweight, Reactive Plugin-Based Framework.**

SigPro 2 is a modern, minimalist JavaScript framework designed for developers who want the power of reactivity without the overhead of heavy runtimes. It weighs less than **2KB**, uses a signal-based architecture, and is fully extensible through a modular plugin system.


[![npm version](https://img.shields.io/npm/v/sigpro.svg)](https://www.npmjs.com/package/sigpro)
[![bundle size](https://img.shields.io/bundlephobia/minzip/sigpro)](https://bundlephobia.com/package/sigpro)
[![license](https://img.shields.io/npm/l/sigpro)](https://github.com/natxocc/sigpro/blob/main/LICENSE)

---

## 🚀 Key Features

* **Nano-Sized:** Optimized for speed and minimal bundle impact.
* **Signal-Based Reactivity:** Surgical DOM updates—only what changes is re-rendered.
* **Plugin Ecosystem:** Modular by design. Only load what you need (Router, Fetch, Storage, etc.).
* **File-Based Routing:** Automated route generation via Vite.
* **Zero Boilerplate:** No complex build steps or proprietary syntax. Just JavaScript.

---

## 📦 Installation

Install the core engine and the essential plugins.

::: code-group
```bash [NPM]
npm install sigpro
```

```bash [Bun]
bun add sigpro
```
:::

---

## 🛠️ Quick Start

### 1. Configure Vite
Add the automatic router to your `vite.config.js`.

```javascript
import { defineConfig } from 'vite';
import { sigproRouter } from 'sigpro/vite';

export default defineConfig({
  plugins: [sigproRouter()]
});
```

### 2. Initialize the App
Register plugins and mount your application shell.

```javascript
// src/main.js
import { $ } from 'sigpro';
import { Router, Fetch, UI } from 'sigpro/plugins';

$.plugin([Router, Fetch, UI]).then(() => {
  import('./App.js').then(app => $.mount(app.default, '#app'));
});
```

---

## 🧩 Official Plugins

SigPro is powered by a "Pay-only-for-what-you-use" architecture.

### 🚦 Router (`_router`)
Automated file-based routing. Just create a file in `src/pages/` and it becomes a route.
```javascript
import { routes } from 'virtual:sigpro-routes';
const App = () => main(_router(routes));
```

### 📡 Fetch (`_fetch`)
Reactive data fetching with built-in loading and error states.
```javascript
const { $data, $loading } = _fetch('https://api.example.com/data');
```

### 💾 Storage (`_storage`)
Automatic synchronization between Signals and `localStorage`.
```javascript
const $theme = _storage($('light'), 'app_theme');
```

### 🐞 Debug (`_debug`)
Beautifully formatted console logs for tracking state changes in real-time.
```javascript
_debug($mySignal, "User Profile");
```

---

## 📂 Project Structure

A typical SigPro project follows this clean convention:

```text
my-app/
├── src/
│   ├── pages/         # Automatic Routes
│   │   ├── index.js   # -> #/
│   │   └── about.js   # -> #/about
│   ├── plugins/       # Custom Plugins
│   ├── App.js         # Main Layout
│   └── main.js        # Entry Point
├── vite.config.js
└── package.json
```

---

## 🎨 Example Component

SigPro uses standard JavaScript functions and a clean, declarative syntax.

```javascript
export default () => {
  const $count = $(0); // Create a Signal

  return div({ class: 'p-8 text-center' }, [
    h1("Hello SigPro!"),
    p(`Current count is: ${$count()}`),
    
    _button({ 
      onclick: () => $count(c => c + 1),
      class: 'btn-primary'
    }, "Increment")
  ]);
};
```

---

## 📄 License

MIT © 2026 SigPro Team.