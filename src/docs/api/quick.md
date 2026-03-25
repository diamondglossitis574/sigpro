# ⚡ Quick API Reference

SigPro is a high-performance micro-framework that updates the **Real DOM** surgically. No Virtual DOM, no unnecessary re-renders.

## 🟢 Core Functions

| Function | Signature | Description |
| :--- | :--- | :--- |
| `$(val, key?)` | `(any, string?) => Signal` | Creates a **Signal**. If `key` is provided, it persists in `localStorage`. |
| `$(fn)` | `(function) => Computed` | Creates a **Computed Signal** that auto-updates when its dependencies change. |
| `$.effect(fn)` | `(function) => stopFn` | Runs a side-effect that tracks signals. Returns a function to manually stop it. |
| `$.html(tag, props, children)` | `(string, object, any) => HTMLElement` | The low-level DOM factory powering all tag constructors. |
| `$.router(routes)` | `(Array) => HTMLElement` | Initializes the hash-based router for SPAs. |
| `$.go(path)` | `(string) => void` | Programmatic navigation (e.g., `$.go('/home')`). |
| `$.mount(comp, target)` | `(any, string\|Node) => Runtime` | Mounts the application into the specified DOM element. |
| `$.ignore(fn)` | `(function) => any` | Executes code without tracking any signals inside it. |

---

## 🏗️ Element Constructors (Tags)

SigPro provides PascalCase wrappers for all standard HTML5 tags (e.g., `Div`, `Span`, `Button`).

### Syntax Pattern
```javascript
Tag({ attributes }, [children])
```

### Attribute & Content Handling

| Pattern | Code Example | Behavior |
| :--- | :--- | :--- |
| **Static** | `class: "text-red"` | Standard HTML attribute string. |
| **Reactive** | `disabled: isLoading` | Updates automatically when `isLoading()` changes. |
| **Two-way** | `$value: username` | Syncs input with signal **both ways** (Binding Operator). |
| **Text** | `P({}, () => count())` | Updates text node whenever `count` changes. |
| **Boolean** | `hidden: isHidden` | Toggles the attribute based on signal truthiness. |

