# Why SigPro?

After years of building applications with React, Vue, and Svelte—investing countless hours mastering unique mental models, proprietary syntaxes, and complex build tools—we reached a realization: the web platform has evolved, but frameworks have become layers of abstraction that often move us further away from the browser.

**SigPro** is the answer to a simple question: **Why fight the platform when we can embrace it?**

## The Modern Web is Ready

SigPro bypasses the overhead of the Virtual DOM and heavy compilers by using modern browser primitives. It treats the DOM as a first-class citizen, not as a side effect of a state change.

| Browser Primitive | What It Enables |
| :--- | :--- |
| **Closures & Proxies** | Automatic dependency tracking without heavy overhead. |
| **ES Modules** | Native modularity and lazy loading without complex bundlers. |
| **Direct DOM APIs** | Surgical updates that are faster than any reconciliation algorithm. |
| **Microtask Queues** | Batching updates efficiently to ensure 60fps performance. |

---

## The SigPro Philosophy

SigPro strips away the complexity, delivering a reactive programming model that feels like a framework but stays remarkably close to Vanilla JS:

* **No JSX transformations** – Pure JavaScript functions.
* **No Virtual DOM** – Direct, fine-grained DOM manipulation.
* **No proprietary syntax** – If you know JS, you know SigPro.
* **Zero Build Step Required** – It can run directly in the browser via ESM.

```javascript
// Pure, Atomic, Reactive.
const $count = $(0);

const Counter = () => div([
  p(["Count: ", $count]),
  button({ onclick: () => $count(c => c + 1) }, "Increment")
]);
```

---

## Performance Comparison

SigPro isn't just lighter; it's architecturally faster because it skips the "diffing" phase entirely.

| Metric | SigPro | SolidJS | Svelte | Vue | React |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Bundle Size (gzip)** | 🥇 **< 2KB** | 🥈 7KB | 🥉 16KB | 20KB | 45KB |
| **Architecture** | **Atomic** | **Atomic** | **Compiled** | **V-DOM** | **V-DOM** |
| **Initial Render** | 🥇 **Fastest** | 🥈 Fast | 🥉 Fast | Average | Slow |
| **Update Perf** | 🥇 **Surgical** | 🥇 Surgical | 🥈 Fast | 🥉 Average | Slow |
| **Dependencies** | 🥇 **0** | 🥇 0 | 🥇 0 | 🥈 2 | 🥉 5+ |
| **Build Step** | 🥇 **Optional** | 🥈 Required | 🥈 Required | 🥇 Optional | 🥈 Required |



---

## 🔑 Core Principles

SigPro is built on four fundamental pillars:

### 📡 Atomic Reactivity
Automatic dependency tracking with no manual subscriptions. When a signal changes, only the **exact** text nodes or attributes that depend on it update—instantly and surgically.

### ⚡ Surgical DOM Updates
No Virtual DOM diffing. No tree reconciliation. We don't guess what changed; we know exactly where the update needs to happen. Performance scales with your data, not the size of your component tree.

### 🧩 Plugin-First Architecture
The core is a tiny, powerful engine. Need Routing? Fetching? Global UI? Just plug it in. This keeps your production bundles "pay-only-for-what-you-use."

### 🔬 Predictable & Transparent
There is no "magic" hidden in a black-box compiler. What you write is what the browser executes. Debugging is straightforward because there is no framework layer between your code and the DevTools.

---

> "SigPro returns the joy of web development by making the browser the hero again."


