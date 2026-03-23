# Application Mounter: `$.mount`

The `$.mount` function is the entry point of your reactive world. It takes a **SigPro component** (or a plain DOM node) and injects it into the real document, bridging the gap between your logic and the browser.

## 1. Syntax: `$.mount(node, [target])`

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **node** | `HTMLElement` or `Function` | **Required** | The component or element to render. |
| **target** | `string` or `HTMLElement` | `document.body` | Where to mount the app (CSS selector or Element). |

---

## 2. Usage Scenarios

### A. The "Clean Slate" (Main Entry)
In a modern app, you usually want to control the entire page. By default, `$.mount` clears the target's existing HTML before mounting your application.

```javascript
// src/main.js
import { $ } from 'sigpro';
import App from './App.js';

// SigPro: No .then() needed, global tags are ready immediately
$.mount(App); 
```

### B. Targeting a Specific Container
If you have an existing HTML structure and want **SigPro** to manage only a specific section (like a `#root` div), pass a CSS selector or a reference.

```html
<div id="sidebar"></div>
<div id="app-root"></div>
```

```javascript
// Mount to a specific ID
$.mount(MyComponent, '#app-root');

// Or using a direct DOM reference
const sidebar = document.getElementById('sidebar');
$.mount(SidebarComponent, sidebar);
```

---

## 3. Creating "Reactive Islands"
One of SigPro's strengths is its ability to work alongside "Old School" static HTML. You can inject a reactive widget into any part of a legacy page.

```javascript
// A small reactive widget
const CounterWidget = () => {
  const $c = $(0);
  return button({ onclick: () => $c(v => v + 1) }, [
    "Clicks: ", $c
  ]);
};

// Mount it into an existing div in your static HTML
$.mount(CounterWidget, '#counter-container');
```

---

## 4. How it Works (Lifecycle)
When `$.mount` is called, it performs three critical steps:

1. **Resolution:** If you passed a **Function**, it executes it once to generate the initial DOM node.
2. **Clearance:** It sets `target.innerHTML = ''`. This prevents "zombie" HTML or static placeholders from interfering with your app.
3. **Injection:** It appends the resulting node to the target.

---

## 5. Global vs. Local Scope

### Global (The "Framework" Way)
In a standard Vite project, you initialize SigPro in your entry file. This makes `$` and the tag helpers (`div`, `button`, etc.) available globally for a clean, declarative developer experience.

```javascript
// src/main.js
import { $ } from 'sigpro'; 

// Any component in any file can now use:
$.mount(() => h1("Global App"));
```

### Local (The "Library" Way)
If you prefer to avoid polluting the `window` object, you can import and use SigPro locally within specific modules.

```javascript
// widget.js
import { $ } from 'sigpro';

const myNode = $.html('div', 'Local Widget');
$.mount(myNode, '#widget-target');
```

---

## 6. Summary Cheat Sheet

| Goal | Code |
| :--- | :--- |
| **Mount to body** | `$.mount(App)` |
| **Mount to ID** | `$.mount(App, '#id')` |
| **Mount to Element** | `$.mount(App, myElement)` |
| **Direct Function** | `$.mount(() => div("Hi"), '#widget')` |
