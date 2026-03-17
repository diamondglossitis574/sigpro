# Why SigPro? ❓

After years of building applications with React, Vue, and Svelte—investing countless hours mastering their unique mental models, build tools, and update cycles—I kept circling back to the same realization: no matter how sophisticated the framework, it all eventually compiles down to HTML, CSS, and vanilla JavaScript. The web platform has evolved tremendously, yet many libraries continue to reinvent the wheel, creating parallel universes with their own rules, their own syntaxes, and their own steep learning curves.

**SigPro is my answer to a simple question:** Why fight the platform when we can embrace it?

## 🌐 The Web Platform Is Finally Ready

Modern browsers now offer powerful primitives that make true reactivity possible without virtual DOM diffing, without compilers, and without lock-in:

| Browser Primitive | What It Enables |
|-------------------|-----------------|
| **Custom Elements** | Create reusable components with native browser APIs |
| **Shadow DOM** | Encapsulate styles and markup without preprocessors |
| **CSS Custom Properties** | Dynamic theming without CSS-in-JS |
| **Microtask Queues** | Efficient update batching without complex scheduling |

## 🎯 The SigPro Philosophy

SigPro strips away the complexity, delivering a reactive programming model that feels familiar but stays remarkably close to vanilla JS:

- **No JSX transformations** - Just template literals
- **No template compilers** - The browser parses your HTML
- **No proprietary syntax to learn** - Just functions and signals
- **No build step required** - Works directly in the browser

```javascript
// Just vanilla JavaScript with signals
import { $, html } from 'sigpro';

const count = $(0);

document.body.appendChild(html`
  <div>
    <p>Count: ${count}</p>
    <button @click=${() => count(c => c + 1)}>
      Increment
    </button>
  </div>
`);
```

## 📊 Comparative

| Metric | SigPro | Solid | Svelte | Vue | React |
|--------|--------|-------|--------|-----|-------|
| **Bundle Size** (gzip) | 🥇 **5.2KB** | 🥈 15KB | 🥉 16.6KB | 20.4KB | 43.9KB |
| **Time to Interactive** | 🥇 **0.8s** | 🥈 1.3s | 🥉 1.4s | 1.6s | 2.3s |
| **Initial Render** (ms) | 🥇 **124ms** | 🥈 198ms | 🥉 287ms | 298ms | 452ms |
| **Update Performance** (ms) | 🥇 **4ms** | 🥈 5ms | 🥈 5ms | 🥉 7ms | 18ms |
| **Dependencies** | 🥇 **0** | 🥇 **0** | 🥇 **0** | 🥈 2 | 🥉 5 |
| **Compilation Required** | 🥇 **No** | 🥇 **No** | 🥈 Yes | 🥇 **No** | 🥇 **No** |
| **Browser Native** | 🥇 **Yes** | 🥈 Partial | 🥉 Partial | 🥉 Partial | No |
| **Framework Lock-in** | 🥇 **None** | 🥈 Medium | 🥉 High | 🥈 Medium | 🥉 High |
| **Longevity** (standards-based) | 🥇 **10+ years** | 🥈 5 years | 🥉 3 years | 🥈 5 years | 🥈 5 years |

## 🔑 Core Principles

SigPro is built on four fundamental principles:

### 📡 **True Reactivity**
Automatic dependency tracking with no manual subscriptions. When a signal changes, only the exact DOM nodes that depend on it update—surgically, efficiently, instantly.

### ⚡ **Surgical Updates**
No virtual DOM diffing. No tree reconciliation. Just direct DOM updates where and when needed. The result is predictable performance that scales with your content, not your component count.

### 🧩 **Web Standards**
Built on Custom Elements, not a custom rendering engine. Your components are real web components that work in any framework—or none at all.

### 🔬 **Predictable**
No magic, just signals and effects. What you see is what you get. The debugging experience is straightforward because there's no framework layer between your code and the browser.

## 🎨 The Development Experience

```javascript
// With VS Code + lit-html extension, you get:
// ✅ Syntax highlighting
// ✅ Color previews
// ✅ Auto-formatting
// ✅ IntelliSense

html`
  <div style="color: #ff4444; background: linear-gradient(45deg, blue, green)">
    <h1>Beautiful highlighted template</h1>
  </div>
`
```

## ⏱️ Built for the Long Term

What emerged is a library that proves we've reached a turning point: the web is finally mature enough that we don't need to abstract it anymore. We can build reactive, component-based applications using virtually pure JavaScript, leveraging the platform's latest advances instead of working against them.

**The result isn't just smaller bundles or faster rendering—it's code that will still run 10 years from now, in any browser, without maintenance.**

## 📈 The Verdict

While other frameworks build parallel universes with proprietary syntax and compilation steps, SigPro embraces the web platform. SigPro isn't just another framework—it's a return to fundamentals, showing that the dream of simple, powerful reactivity is now achievable with the tools browsers give us out of the box.

> *"Stop fighting the platform. Start building with it."*

## 🚀 Ready to Start?

[Get Started with SigPro](/guide/getting-started) • [View on GitHub](https://github.com/natxocc/sigpro) • [npm Package](https://www.npmjs.com/package/sigpro)

<style>
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

blockquote {
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--vp-c-brand-soft) 0%, transparent 100%);
  border-radius: 12px;
  font-size: 1.2rem;
  font-style: italic;
}
</style>
