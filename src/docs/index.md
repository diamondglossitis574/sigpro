---
layout: home

hero:
  name: SigPro
  text: Atomic Unified Reactive Engine
  tagline: Fine-grained reactivity, built-in routing, and modular plugins. All under 2KB.
  image:
    src: /logo.svg
    alt: SigPro Logo
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://git.natxocc.com/sigpro/

features:
  - title: Atomic Reactivity
    details: Powered by Signals. Only updates what changes. No Virtual DOM overhead, no heavy re-renders.
  - title: Zero Dependencies
    details: Written in pure Vanilla JS. Maximum performance with the smallest footprint possible.
  - title: Modular Ecosystem
    details: Official plugins for UI components, dynamic Routing, Fetch, and Storage. Load only what you need.
---

## Why SigPro?

SigPro isn't just another framework; it's a high-performance engine. It strips away the complexity of massive bundles and returns to the essence of the web, enhanced with reactive superpowers.

### The Core in Action

```javascript
import { $ } from 'sigpro2';

// A reactive state Signal
const $count = $(0);

// A Computed signal that updates automatically
const $double = $(() => $count() * 2);

// UI that breathes with your data
const Counter = () => div([
  h1(["Count: ", $count]),
  p(["Double: ", $double]),
  button({ onclick: () => $count(c => c + 1) }, "Increment")
]);

$.mount(Counter);
```

---

### Key Features

#### ⚡️ Fine-Grained Reactivity
Unlike frameworks that diff complex trees (V-DOM), SigPro binds your signals directly to real DOM text nodes and attributes. If the data changes, the node changes. Period.

#### 🔌 Polymorphic Plugin System
Extend core capabilities in a single line. Add global UI helpers, routing, or state persistence seamlessly.
```javascript
import { UI, Router } from 'sigpro/plugins';
$.plugin([UI, Router]);
```

#### 📂 File-Based Routing
With our dedicated Vite plugin, manage your routes simply by creating files in `src/pages/`. It supports native **Lazy Loading** out of the box for lightning-fast initial loads.

---

### Quick Install

::: code-group
```bash [npm]
npm install sigpro
```
```bash [pnpm]
pnpm add sigpro
```
```bash [yarn]
yarn add sigpro
```
```bash [bun]
bun add sigpro
```
:::

---

## Community & Support
SigPro is an open-source project. Whether you want to contribute, report a bug, or just talk about reactivity, join us on our official repository.

```
Built with ❤️ by NatxoCC
```
