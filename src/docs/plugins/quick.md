# Extending SigPro: `$.plugin`

The plugin system is the engine's modular backbone. It allows you to inject new functionality directly into the `$` object, register custom global tags, or load external libraries seamlessly.

## 1. How Plugins Work

A plugin in **SigPro** is a function that receives the core instance. When you call `$.plugin(MyPlugin)`, the engine hands over the `$` object so the plugin can attach new methods or extend the reactive system.

### Functional Plugin Example
```javascript
// A plugin that adds a simple watcher to any signal
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

## 2. Initialization Patterns (SigPro)

Thanks to the **Synchronous Tag Engine**, you no longer need complex `import()` nesting. Global tags like `div()`, `span()`, and `button()` are ready the moment you import the Core.

### The "Natural" Start (Recommended)
This is the standard way to build apps. It's clean, readable, and supports standard ESM imports.

```javascript
// main.js
import { $ } from 'sigpro';
import { Fetch } from 'sigpro/plugins';
import App from './App.js'; // Static import works perfectly!

// 1. Register plugins
$.plugin(Fetch);

// 2. Mount your app directly
$.mount(App, '#app');
```

---

## 3. Resource Plugins (External Scripts)

You can pass a **URL** or an **Array of URLs**. SigPro will inject them as `<script>` tags and return a **Promise** that resolves when the scripts are fully loaded. This is perfect for integrating heavy third-party libraries only when needed.

```javascript
// Loading external libraries as plugins
$.plugin([
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.example.com/custom-ui-lib.js'
]).then(() => {
  console.log("External resources are ready to use!");
  $.mount(DashboardApp);
});
```

---

## 4. Polymorphic Loading Reference

The `$.plugin` method is smart; it adapts its behavior based on the input type:

| Input Type | Action | Behavior |
| :--- | :--- | :--- |
| **Function** | Executes `fn($)` | **Synchronous**: Immediate availability. |
| **String (URL)** | Injects `<script src="...">` | **Asynchronous**: Returns a Promise. |
| **Array** | Processes each item in the list | Returns a Promise if any item is a URL. |

---

## 💡 Pro Tip: When to use `.then()`?

In **SigPro**, you only need `.then()` in two specific cases:
1. **External Assets:** When loading a plugin via a URL (CDN).
2. **Strict Dependency:** If your `App.js` requires a variable that is strictly defined inside an asynchronous external script (like `window.Chart`).

For everything else (UI components, Router, Local State), just call `$.plugin()` and continue with your code. It's that simple.

---

### Summary Cheat Sheet

| Goal | Code |
| :--- | :--- |
| **Local Plugin** | `$.plugin(myPlugin)` |
| **Multiple Plugins** | `$.plugin([UI, Router])` |
| **External Library** | `$.plugin('https://...').then(...)` |
| **Hybrid Load** | `$.plugin([UI, 'https://...']).then(...)` |
