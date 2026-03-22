
# SigPro ⚡
**The Ultra-Lightweight, Atomic Reactive Engine.**

SigPro is a modern, minimalist JavaScript engine designed for developers who want surgical reactivity without the overhead. It weighs less than **2KB**, uses a high-performance signal-based architecture, and features a built-in router and native state persistence.



---

## 🚀 Why SigPro?

Unlike traditional frameworks that use a **Virtual DOM** (React) or complex **Compilers** (Svelte), SigPro uses **Atomic Reactivity**. 

* **Surgical Updates:** When a Signal changes, SigPro knows exactly which text node or attribute needs to update. It doesn't "diff" trees; it directly touches the DOM.
* **Zero Dependencies:** No extra libraries, no heavy runtimes. Just pure, optimized JavaScript.
* **Synchronous by Design:** Eliminates the "async-bottleneck". Your app environment is ready the moment you import it.

---

## 📦 Installation

```bash
npm install sigpro
```

---

## 🛠️ Quick Start

### 1. Automatic File-Based Routing (Vite)
SigPro leverages Vite to turn your folder structure into your app's navigation.

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { sigproRouter } from 'sigpro/vite';

export default defineConfig({
  plugins: [sigproRouter()]
});
```

### 2. The Entry Point
Forget about complex bootstrap sequences. In SigPro, you just mount and go.

```javascript
// src/main.js
import { $ } from 'sigpro';
import App from './App.js';

$.mount(App, '#app'); // Your reactive journey starts here.
```

---

## 💎 Core Pillars

### 🚦 Built-in Router (`$.router`)
The router is now part of the core. It supports dynamic parameters and **Automatic Code Splitting**. Each page in your `src/pages` folder is only loaded when visited.

```javascript
import { routes } from 'virtual:sigpro-routes';

export default () => div({ class: 'app-container' }, [
  header([
    h1("SigPro App"),
    nav([
      button({ onclick: () => $.router.go('/') }, "Home"),
      button({ onclick: () => $.router.go('/user/42') }, "Profile")
    ])
  ]),
  // $.router acts as a reactive "portal" for your pages
  main($.router(routes)) 
]);
```

### 💾 Native State Persistence
Stop writing boilerplate for `localStorage`. SigPro handles it at the engine level. If you provide a second argument to a Signal, it becomes persistent.

```javascript
// This value survives page refreshes automatically
const $theme = $('light', 'app-settings-theme'); 

$theme('dark'); // Saved to localStorage instantly and reactively.
```



---

## 🎨 Component Anatomy

A SigPro component is just a function. No `this`, no complex hooks, just clean logic.

```javascript
export default () => {
  // 1. State
  const $count = $(0); 

  // 2. Derived Logic (Computed)
  const $isEven = $(() => $count() % 2 === 0);

  // 3. UI Template (Declarative)
  return div({ class: 'counter-card' }, [
    h2("Counter Example"),
    p(() => `Current value: ${$count()} (${$isEven() ? 'Even' : 'Odd'})`),
    
    button({ 
      onclick: () => $count(c => c + 1),
      class: 'btn-add'
    }, "Add +1")
  ]);
};
```

---

## 📂 Project Structure

```text
my-app/
├── src/
│   ├── pages/         # Files here become routes (e.g., about.js -> #/about)
│   ├── components/    # Your reusable UI atoms
│   ├── App.js         # The "Shell" (Navbar, Sidebar, Footer)
│   └── main.js        # The Glue (Imports $ and mounts App)
├── vite.config.js
└── package.json
```

---

## ⚡ Performance Summary

| Feature | SigPro | Other Frameworks |
| :--- | :--- | :--- |
| **Bundle Size** | **~2KB** | 30KB - 100KB+ |
| **Reactivity** | Atomic Signals | Virtual DOM Diffing |
| **Routing** | Built-in / File-based | External Plugin Required |
| **Persistence** | Native | Manual / Plugin Required |

---

## 📄 License

MIT © 2026 SigPro Team. Designed with ❤️ for speed.

