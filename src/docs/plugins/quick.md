# Extending SigPro: `$.plugin`

The plugin system is the engine's way of growing. It allows you to inject new functionality directly into the `$` object or load external resources.

## 1. How Plugins Work

A plugin in **SigPro** is simply a function that receives the core instance. When you run `$.plugin(MyPlugin)`, the engine hands over the `$` object so the plugin can attach new methods or register global tags (like `div()`, `span()`, etc.).

### Functional Plugin Example
```javascript
// A plugin that adds a simple logger to any signal
const Logger = ($) => {
  $.watch = (target, label = "Log") => {
    $(() => console.log(`[${label}]:`, target()));
  };
};

// Activation
$.plugin(Logger);
const $count = $(0);
$.watch($count, "Counter"); // Now available globally via $
```

---

## 2. Initialization Patterns

Since plugins often set up global variables (like the HTML tags), the order of initialization is critical. Here are the two ways to start your app:

### Option A: The "Safe" Async Start (Recommended)
This is the most robust way. It ensures all global tags (`div`, `button`, etc.) are created **before** your App code is even read by the browser.

```javascript
// main.js
import { $ } from 'sigpro';
import { UI, Router } from 'sigpro/plugins';

// 1. Load plugins first
$.plugin([UI, Router]).then(() => {
  
  // 2. Import your app only after the environment is ready
  import('./App.js').then(appFile => {
    const MyApp = appFile.default;
    $.mount(MyApp, '#app');
  });

});
```

### Option B: Static Start (No Global Tags)
Use this only if you prefer **not** to use global tags and want to use `$.html` directly in your components. This allows for standard static imports.

```javascript
// main.js
import { $ } from 'sigpro';
import { UI } from 'sigpro/plugins';
import MyApp from './App.js'; // Static import works here

$.plugin(UI);
$.mount(MyApp, '#app');
```
> **Warning:** In this mode, if `App.js` uses `div()` instead of `$.html('div')`, it will throw a `ReferenceError`.

---

## 3. Resource Plugins (External Scripts)

You can pass a **URL** or an **Array of URLs**. SigPro will inject them as `<script>` tags and return a Promise that resolves when the scripts are fully loaded and executed.

```javascript
// Loading external libraries as plugins
await $.plugin([
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.example.com/custom-ui-lib.js'
]);

console.log("External resources are ready to use!");
```

---

## 4. Polymorphic Loading Reference

The `$.plugin` method adapts to whatever you throw at it:

| Input Type | Action | Behavior |
| :--- | :--- | :--- |
| **Function** | Executes `fn($)` | Synchronous / Immediate |
| **String (URL)** | Injects `<script src="...">` | Asynchronous (Returns Promise) |
| **Array** | Processes each item in the list | Returns Promise if any item is Async |

---

## 💡 Pro Tip: Why the `.then()`?

Using `$.plugin([...]).then(...)` is like giving your app a "Pre-flight Check". It guarantees that:
1. All reactive methods are attached.
2. Global HTML tags are defined.
3. External libraries (like Chart.js) are loaded.
4. **The result:** Your components are cleaner, smaller, and error-free.

