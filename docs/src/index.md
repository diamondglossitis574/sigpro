---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "SigPro"
  text: "Reactivity for the Web Platform"
  tagline: A minimalist reactive library for building web interfaces with signals, effects, and native web components. No compilation, no virtual DOM, just pure JavaScript and intelligent reactivity.
  image:
    src: /logo.svg
    alt: SigPro
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Why SigPro?
      link: /guide/why

features:
  - title: ⚡ 3KB gzipped
    details: Minimal footprint with maximum impact. No heavy dependencies, just pure reactivity.
  - title: 🎯 Native Web Components
    details: Built on Custom Elements and Shadow DOM. Leverage the platform, don't fight it.
  - title: 🔄 Signal-based Reactivity
    details: Fine-grained updates without virtual DOM diffing. Just intelligent, automatic reactivity.
---

<div class="custom-container">
  <p class="npm-stats">
    <img src="https://badge.fury.io/js/sigpro.svg" alt="npm version">
    <img src="https://img.shields.io/bundlephobia/minzip/sigpro" alt="bundle size">
    <img src="https://img.shields.io/npm/l/sigpro" alt="license">
  </p>
</div>

<div class="verdict-quote">
  <p><strong>"Stop fighting the platform. Start building with it."</strong></p>
</div>

<style>
.npm-stats {
  text-align: center;
  margin: 2rem 0;
}

.npm-stats img {
  margin: 0 0.5rem;
  display: inline-block;
}

.custom-container {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.verdict-quote {
  text-align: center;
  font-size: 1.5rem;
  margin: 3rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, transparent 100%);
  border-radius: 12px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 2rem 0;
}

th {
  background-color: var(--vp-c-bg-soft);
  padding: 0.75rem;
  text-align: left;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

tr:hover {
  background-color: var(--vp-c-bg-soft);
}
</style>