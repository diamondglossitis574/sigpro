# Quick API Reference

SigPro is a minimal yet powerful engine. Here is a complete overview of its capabilities.

## 1. Core API Summary

| Function | Description | Example |
| :--- | :--- | :--- |
| **`$(val, key?)`** | Creates a Signal, Computed, or Store (with optional persistence). | `const $n = $(0)` |
| **`$.html()`** | The base engine to create reactive HTMLElements. | `$.html('div', {}, 'Hi')` |
| **`Tags`** | Global helpers (div, span, button, etc.) built on top of `$.html`. | `div("Hello SigPro")` |
| **`$.mount()`** | Mounts a component into a target element (clears target first). | `$.mount(App, '#app')` |
| **`$.router()`** | Hash-based router with dynamic params and lazy loading. | `$.router(routes)` |
| **`$.plugin()`** | Extends SigPro or loads external scripts/plugins. | `$.plugin(MyPlugin)` |

---

## 2. The Power of `$` (Reactivity)

The `$` function adapts to whatever you pass to it:

### **Signals & Persistent State**
Reactive values in RAM or synced with `localStorage`.
```javascript
const $count = $(0);                      // Simple Signal
const $theme = $('dark', 'app-theme');    // Persistent Signal (Disk)

$count(10);             // Update value
console.log($count());  // Get value: 10
```

### **Computed Signals**
Read-only signals that update automatically when their dependencies change.
```javascript
const $double = $(() => $count() * 2);
```

### **Reactive Stores (Objects + Disk)**
Transforms an object into a reactive tree. If a `key` is provided, the **entire structure** persists.
```javascript
// Store in RAM + Disk (Auto-syncs nested properties)
const state = $({ 
  user: { name: 'Natxo' }, 
  settings: { dark: true } 
}, 'my-app-state');

// Accessing properties (they become signals)
state.user.name();         // Get: 'Natxo'
state.user.name('Guest');  // Set & Sync to Disk: 'my-app-state_user_name'
```

---

### **3. UI Creation: Constructor vs. Direct Tags**

SigPro provides the `$.html` engine for defining any element and global "Sugar Tags" for rapid development.

::: code-group

```javascript [Engine Constructor ($.html)]
// 1. DEFINE: Create a custom piece of UI
// This returns a real DOM element ready to be used.
const MyHero = $.html('section', { class: 'hero' }, [
  h1("Internal Title")
]);

// 2. USE: Nest it inside other elements like a standard tag
const Page = () => div([
  MyHero, // We just drop the variable here
  p("This paragraph is outside the Hero section.")
]);

$.mount(Page, '#app');
```

```javascript [Global Helpers (Tags)]
// Use pre-defined global tags to compose layouts instantly.
// No need to define them, just call them.

const Page = () => div({ id: 'main' }, [
  section({ class: 'hero' }, [
    h1("Direct Global Tag"),
    p("Building UI without boilerplate.")
  ]),
  button({ onclick: () => alert('Hi!') }, "Click Me")
]);

$.mount(Page, '#app');
```

:::

---

### **Technical Breakdown**

* **`$.html(tag, props, children)`**: This is the core factory. Use it when you need to create an element dynamically or when working with **Custom Elements / Web Components**.
* **`Global Tags (div, p, etc.)`**: These are shortcut functions that SigPro injects into the `window` object. They internally call `$.html` for you, making your component code much cleaner and easier to read.

---

### **Key Difference**
* **`$.html`**: Acts as a **constructor**. Use it when you want to "bake" a specific structure (like a Section that *always* contains an H1) into a single variable.
* **`Global Tags`**: Act as **scaffolding**. Use them to wrap different contents dynamically as you build your views.

### **Global Tags (Standard Syntax)**
SigPro declares standard tags in the global scope so you don't have to import them.
```javascript
const Card = (title, $val) => div({ class: 'card' }, [
  h2(title),
  p("Reactive content below:"),
  input({ 
    type: 'number', 
    $value: $val, // Automatic Two-way binding
    $style: () => $val() > 10 ? 'color: red' : 'color: green' 
  })
]);
```

---

## 4. Mounting: `$.mount`

The entry point of your application. It links your JavaScript logic to a specific DOM element.

```html
<div id="app"></div>
```

```javascript
// In your main.js
const App = () => main([ 
  h1("Welcome to SigPro"),
  p("Everything here is reactive.")
]);

// Usage: $.mount(component, selectorOrElement)
$.mount(App, '#app'); 
```

---

## 5. Navigation: `$.router`

A robust hash-based router (`#/path`) that handles view switching automatically.

```javascript
const routes = [
  { path: '/', component: Home },
  { path: '/user/:id', component: (params) => h1(`User ID: ${params.id}`) },
  { path: '/admin', component: () => import('./Admin.js') }, // Native Lazy Loading
  { path: '*', component: () => p("404 - Not Found") }
];

// Initialize and mount the router
$.mount($.router(routes), '#app');

// Programmatic navigation
$.router.go('/user/42');
```

---

## 6. Plugins: `$.plugin`

Extend the engine or load external dependencies.

```javascript
// 1. Function-based plugin
$.plugin(($) => {
  $.myHelper = () => console.log("Plugin active!");
});

// 2. Load external scripts
await $.plugin('https://cdn.example.com/library.js');
```
