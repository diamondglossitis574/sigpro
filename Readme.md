
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

Read the Docs https://natxocc.github.io/sigpro/

## 📦 Installation

```bash
npm install sigpro
```

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

