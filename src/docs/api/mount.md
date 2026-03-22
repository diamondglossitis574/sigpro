# Application Mounter: `$.mount`

The `$.mount` function is the entry point of your reactive world. It takes a **SigPro component** (or a plain DOM node) and injects it into the real document.

## 1. Syntax: `$.mount(node, [target])`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **node** | `HTMLElement` or `Function` | **Required** | The component or element to render. |
| **target** | `string` or `HTMLElement` | `document.body` | Where to mount the app (CSS selector or Element). |

---

## 2. Usage Scenarios

### A. The "Clean Slate" (Main Entry)
In a modern app (like our `main.js` example), you usually want to control the entire page. By default, `$.mount` clears the target's existing HTML before mounting.

```javascript
// src/main.js
import { $ } from 'SigPro';
import App from './App.js';

$.mount(App); // Mounts to <body> by default
```

### B. Targeting a Specific Container
If you have an existing HTML structure and only want **SigPro** to manage a specific part (like a `#root` div), pass a CSS selector or a reference.

```html
<div id="sidebar"></div>
<div id="app-root"></div>
```

```javascript
// Local mount to a specific ID
$.mount(MyComponent, '#app-root');

// Or using a direct DOM reference
const sidebar = document.getElementById('sidebar');
$.mount(SidebarComponent, sidebar);
```

---

## 3. Mounting with Pure HTML
One of SigPro's strengths is that it works perfectly alongside "Old School" HTML. You can create a reactive "island" inside a static page.

```javascript
// A small reactive widget in a static .js file
const CounterWidget = () => {
  const $c = $(0);
  return button({ onclick: () => $c(v => v + 1) }, [
    "Clicks: ", $c
  ]);
};

// Mount it into an existing div in your HTML
$.mount(CounterWidget, '#counter-container');
```

---

## 4. How it Works (The "Wipe" Logic)
When `$.mount` is called, it performs two critical steps:

1. **Clearance:** It sets `target.innerHTML = ''`. This ensures no "zombie" HTML from previous renders or static placeholders interferes with your app.
2. **Injection:** It appends your component. If you passed a **Function**, it executes it first to get the DOM node.



---

## 5. Global vs. Local Scope

### Global (The "Framework" Way)
In a standard Vite/ESM project, you initialize SigPro globally in `main.js`. This makes the `$` and the tag helpers (`div`, `button`, etc.) available everywhere in your project.

```javascript
// main.js - Global Initialization
import 'SigPro'; 

// Now any other file can just use:
$.mount(() => h1("Global App"));
```

### Local (The "Library" Way)
If you are worried about polluting the global `window` object, you can import and use SigPro locally within a specific module.

```javascript
// widget.js - Local usage
import { $ } from 'SigPro';

const myNode = $.html('div', 'Local Widget');
$.mount(myNode, '#widget-target');
```

---

### Summary Cheat Sheet

| Goal | Code |
| :--- | :--- |
| **Mount to body** | `$.mount(App)` |
| **Mount to ID** | `$.mount(App, '#id')` |
| **Mount to Element** | `$.mount(App, myElement)` |
| **Reactive Widget** | `$.mount(() => div("Hi"), '#widget')` |

