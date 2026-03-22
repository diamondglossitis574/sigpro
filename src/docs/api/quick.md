# Quick API Reference ⚡

This is a high-level summary of the **SigPro** core API. For detailed guides and edge cases, please refer to the specific documentation for each module.

## 1. Core Reactivity: `$( )`

The `$` function is a polymorphic constructor. It creates **Signals** (state) or **Computed Effects** (logic) based on the input type.

| Usage | Input Type | Returns | Description |
| :--- | :--- | :--- | :--- |
| **Signal** | `any` | `Function` | A getter/setter for reactive state. |
| **Computed** | `Function` | `Function` | A read-only signal that auto-updates when its dependencies change. |

**Example:**
```javascript
const $count = $(0);             // Signal
const $double = $(() => $count() * 2); // Computed
```

---

## 2. Rendering Engine: `$.html`

SigPro uses a hyperscript-style engine to create live DOM nodes.

| Argument | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **tag** | `string` | Yes | Standard HTML tag (e.g., 'div', 'button'). |
| **props** | `Object` | No | Attributes (`id`), Events (`onclick`), or Reactive Props (`$value`). |
| **content** | `any` | No | String, Node, Array, or Reactive Function. |

**Example:**
```javascript
$.html('button', { onclick: () => alert('Hi!') }, 'Click Me');
```

---

## 3. Global Helpers (Tag Proxies)

To keep your code clean, SigPro automatically exposes common HTML tags to the global scope.

| Category | Available Tags |
| :--- | :--- |
| **Layout** | `div`, `section`, `main`, `nav`, `header`, `footer`, `span` |
| **Typography** | `h1`, `h2`, `h3`, `p`, `label`, `a`, `li`, `ul`, `ol` |
| **Forms** | `input`, `button`, `form`, `select`, `option` |
| **Media** | `img`, `video`, `audio`, `canvas` |

**Example:**
```javascript
// No imports needed!
div([ 
  h1("Title"), 
  button("Ok") 
]);
```

---

## 4. Mounting & Plugins

Methods to initialize your application and extend the engine.

| Method | Signature | Description |
| :--- | :--- | :--- |
| **`$.mount`** | `(node, target)` | Wipes the target (default: `body`) and renders the component. |
| **`$.plugin`** | `(source)` | Registers a function or loads external `.js` scripts as plugins. |

**Example:**
```javascript
$.plugin([UI, Router]);
$.mount(App, '#root');
```

---

## 5. Reactive Syntax Cheat Sheet

| Feature | Syntax | Description |
| :--- | :--- | :--- |
| **Text Binding** | `p(["Value: ", $sig])` | Updates text content automatically. |
| **Attributes** | `div({ id: $sig })` | Static attribute assignment. |
| **Reactive Attr** | `div({ $class: $sig })` | Attribute updates when `$sig` changes. |
| **Two-way Binding**| `input({ $value: $sig })`| Syncs input value and signal automatically. |
| **Conditional** | `div(() => $sig() > 0 ? "Yes" : "No")` | Re-renders only the content when the condition changes. |

---



## Summary Table

| Feature | SigPro Approach | Benefit |
| :--- | :--- | :--- |
| **Update Logic** | Fine-grained (Surgical) | Blazing fast updates. |
| **DOM** | Native Nodes | Zero abstraction cost. |
| **Syntax** | Pure JavaScript | No build-tool lock-in. |
| **Footprint** | Modular | Load only what you use. |