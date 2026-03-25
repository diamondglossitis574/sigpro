# 🔌 Application Mounter: `$.mount( )`

The `$.mount` function is the entry point of your reactive world. It bridges the gap between your SigPro logic and the browser's Real DOM by injecting a component into the document.

## 1. Function Signature

```typescript
$.mount(node: Function | HTMLElement, target?: string | HTMLElement): RuntimeObject
```

| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| **`node`** | `Function` or `Node` | **Required** | The component function or DOM element to render. |
| **`target`** | `string` or `Node` | `document.body` | CSS selector or DOM element where the app will live. |

**Returns:** A `Runtime` object containing the `container` and a `destroy()` method.

---

## 2. Common Usage Scenarios

### A. The "Clean Slate" (SPA Entry)
In a modern Single Page Application, you typically want SigPro to manage the entire view. By default, if no target is provided, it mounts to `document.body`.

```javascript
import { $ } from './sigpro.js';
import App from './App.js';

// Mounts your main App component directly to the body
$.mount(App); 
```

### B. Targeting a Specific Container
If your HTML has a predefined structure, you can tell SigPro exactly where to render by passing a CSS selector or a direct reference.

```html
<div id="sidebar"></div>
<main id="app-root"></main>
```

```javascript
// Mount using a CSS selector
$.mount(MyComponent, '#app-root');

// Mount using a direct DOM reference
const sidebar = document.querySelector('#sidebar');
$.mount(SidebarComponent, sidebar);
```

### C. Creating "Reactive Islands"
SigPro is excellent for "sprinkling" reactivity onto legacy or static pages. You can inject small reactive widgets into any part of an existing HTML layout.

```javascript
// A small reactive widget
const CounterWidget = () => {
  const count = $(0);
  return Button({ onclick: () => count(c => c + 1) }, [
    "Clicks: ", count
  ]);
};

// Mount it into a specific div in your static HTML
$.mount(CounterWidget, '#counter-container');
```

---

## 3. How it Works (Lifecycle)

When `$.mount` is executed, it performs these critical steps:

1.  **Resolution & Wrapping**: If you pass a **Function**, SigPro wraps it in a `$.view()`. This starts tracking all internal signals and effects.
2.  **Target Clearance**: It uses `target.replaceChildren()`. This efficiently wipes any existing HTML or "zombie" nodes inside the target before mounting.
3.  **Injection**: The component's container is appended to the target.
4.  **Memory Management**: It stores the `Runtime` instance associated with that DOM element. If you call `$.mount` again on the same target, SigPro automatically **destroys the previous app** to prevent memory leaks.

---

## 4. Global vs. Local Scope

### The "Framework" Way (Global)
By importing your core in your entry file, SigPro automatically initializes global Tag Constructors (`Div`, `Span`, `H1`, etc.). This allows for a clean, declarative DX across your entire project.

```javascript
// main.js
import './sigpro.js'; 

// Now any file can simply do:
$.mount(() => H1("Global SigPro App"));
```

### The "Library" Way (Local)
If you prefer to avoid global variables, you can use the low-level `$.html` factory to create elements locally.

```javascript
import { $ } from './sigpro.js';

const myNode = $.html('div', { class: 'widget' }, 'Local Instance');
$.mount(myNode, '#widget-target');
```

---

## 5. Summary Cheat Sheet

| Goal | Code Pattern |
| :--- | :--- |
| **Mount to body** | `$.mount(App)` |
| **Mount to ID** | `$.mount(App, '#root')` |
| **Mount to Element** | `$.mount(App, myElement)` |
| **Mount raw Node** | `$.mount(Div("Hello"), '#id')` |
| **Unmount/Destroy** | `const app = $.mount(App); app.destroy();` |
