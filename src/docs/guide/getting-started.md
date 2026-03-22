# Getting Started

**SigPro** is a lightweight, atomic reactive engine designed to build modern web interfaces with zero overhead. It focuses on high performance through fine-grained reactivity.

## 1. Installation

You can install SigPro via your favorite package manager:

::: code-group
```bash [npm]
npm install sigpro
````

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

## 2\. Basic Usage

The core of SigPro is the `$` function, which creates reactive state (Signals) and computed effects.

Create a `main.js` file and try this:

```javascript
import { $ } from 'SigPro';

// 1. Create a reactive signal
const $name = $("World");

// 2. Define a reactive component
const App = () => div({ class: 'container' }, [
  h1(["Hello, ", $name, "!"]),
  
  input({ 
    type: 'text', 
    $value: $name, // Two-way binding
    placeholder: 'Enter your name...' 
  }),
  
  button({ 
    onclick: () => $name("SigPro") 
  }, "Set to SigPro")
]);

// 3. Mount the application
$.mount(App, '#app');
```

## 3\. How it Works

SigPro doesn't use a Virtual DOM. Instead, it creates real DOM nodes and binds them directly to your data:

1.  **Signals**: `$(value)` creates a getter/setter function.
2.  **Reactivity**: When you pass a signal or a function to a DOM element, SigPro automatically creates a subscription.
3.  **Fine-Grained Updates**: Only the specific text node or attribute linked to the signal updates when the value changes.

## 4\. Global Tags

By default, SigPro exports common HTML tags to the global scope (`window`) when initialized. This allows you to write clean, declarative UI without importing every single tag:

```javascript
// Instead of $.html('div', ...), just use:
div([
  h1("Clean Syntax"),
  p("No more boilerplate.")
]);
```

