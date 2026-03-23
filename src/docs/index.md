---
layout: home

hero:
  name: SigPro
  text: Atomic Unified Reactive Engine
  tagline: High-precision atomic reactivity. No Virtual DOM. No compiler. No dependencies.
  image:
    src: /logo.svg
    alt: SigPro Logo
  actions:
    - theme: brand
      text: Get Started
      link: /install
    - theme: alt
      text: View on GitHub
      link: https://github.com/natxocc/sigpro

features:
  - title: ⚛️ Atomic Reactivity
    details: Powered by fine-grained Signals. Forget about whole-component re-renders; SigPro updates only the specific text node or attribute that changed.
  - title: 🚀 Zero Virtual DOM
    details: By eliminating the V-DOM diffing layer, SigPro performs surgical, direct manipulations on the real DOM, removing memory and CPU overhead.
  - title: 🛠️ No Compiler Required
    details: Pure Vanilla JS. No Babel, no JSX, no complex build steps. Standard JavaScript that runs natively in the browser with maximum performance.
  - title: 📦 Ultra-Lightweight
    details: The core engine—including reactivity, DOM creation, persistence, and routing—is under 2KB. Perfect for performance-critical applications.
---

## Redefining Modern Reactivity

SigPro is not just another framework; it is a **high-performance engine**. While other libraries add layers of abstraction that slow down execution, SigPro returns to the essence of the web, leveraging the power of modern browser engines.

### Why SigPro?

#### ⚡️ Surgical DOM Efficiency
Unlike React or Vue, SigPro doesn't compare element trees. When a signal changes, SigPro knows exactly which DOM node depends on it and updates it instantly. It is **reactive precision** at its finest.

#### 🔌 Modular Plugin System
The core is sacred. Any extra functionality—Routing, UI Helpers, or State Persistence—is integrated through a polymorphic plugin system. Load only what your application truly needs.

#### 💾 Native Persistence
SigPro features first-class support for `localStorage`. Synchronizing your application state with persistent storage is as simple as providing a key when initializing your Signal.

#### 🚦 Built-in Hash Routing
A robust routing system that supports **Native Lazy Loading** out of the box. Load your components only when the user navigates to them, keeping initial load times near zero.

---

### The "No-Build" Philosophy
In an ecosystem obsessed with compilers, SigPro bets on **standardization**. Write code today that will still run 10 years from now, without depending on build tools that will eventually become obsolete.

> "The best way to optimize code is to not have to process it at all."

---

## Community & Vision
SigPro is an open-source project focused on simplicity and extreme speed. Designed for developers who love the web platform and hate unnecessary "bloatware".

```text
Built with ❤️ by NatxoCC for the Modern Web.