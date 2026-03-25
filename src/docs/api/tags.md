# 🎨 Global Tag Helpers

In **SigPro**, you don't need to manually type `$.html('div', ...)` for every element. To keep your code declarative and readable, the engine automatically generates **Global Helper Functions** for all standard HTML5 tags upon initialization.

## 1. How it Works

SigPro iterates through a manifest of standard HTML tags and attaches a wrapper function for each one directly to the `window` object. This creates a specialized **DSL** (Domain Specific Language) that looks like a template engine but is **100% standard JavaScript**.

* **Under the hood:** `$.html('button', { onclick: ... }, 'Click')`
* **SigPro Style:** `Button({ onclick: ... }, 'Click')`

---

## 2. The Complete Global Registry

The following functions are injected into the global scope (using **PascalCase** to prevent naming collisions with common JS variables) and are ready to use:

| Category | Available Global Functions |
| :--- | :--- |
| **Structure** | `Div`, `Span`, `P`, `Section`, `Nav`, `Main`, `Header`, `Footer`, `Article`, `Aside` |
| **Typography** | `H1` to `H6`, `Ul`, `Ol`, `Li`, `Dl`, `Dt`, `Dd`, `Strong`, `Em`, `Code`, `Pre`, `Small`, `B`, `U`, `Mark` |
| **Interactive** | `Button`, `A`, `Label`, `Br`, `Hr`, `Details`, `Summary`, `Dialog` |
| **Forms** | `Form`, `Input`, `Select`, `Option`, `Textarea`, `Fieldset`, `Legend` |
| **Tables** | `Table`, `Thead`, `Tbody`, `Tr`, `Th`, `Td`, `Tfoot`, `Caption` |
| **Media** | `Img`, `Canvas`, `Video`, `Audio`, `Svg`, `Iframe`, `Picture`, `Source` |

> **The SigPro Philosophy:** Tags are not "magic strings" handled by a compiler. They are **functional constructors**. Every time you call `Div()`, you execute a pure JS function that returns a real, reactive DOM element.

---

## 3. Usage Patterns (Smart Arguments)

SigPro tag helpers are flexible. They automatically detect if you are passing attributes, children, or both.

### A. Attributes + Children
The standard way to build structured UI.
```javascript
Div({ class: 'container', id: 'main' }, [
  H1("Welcome to SigPro"),
  P("The zero-VDOM framework.")
]);
```

### B. Children Only (The "Skipper")
If you don't need attributes, you can skip the object and pass the content (string, array, or function) directly as the first argument.
```javascript
Section([
  H2("Clean Syntax"),
  Button("I have no props!")
]);
```

### C. Primitive Content
For simple tags, just pass a string or a number.
```javascript
H1("Hello World"); 
Span(42);
```

---

## 4. Reactive Power Examples

These helpers are natively wired into SigPro's reactivity. No manual `useEffect` or `watch` calls are needed.

### Reactive Attributes
Simply pass a Signal (function) to any attribute. SigPro handles the rest.
```javascript
const theme = $("light");

Div({ 
  // Updates 'class' automatically when theme() changes
  class: () => `app-box ${theme()}` 
}, "Themeable Box");
```

### The Binding Operator (`$`)
Use the `$` prefix for **Two-Way Binding** on inputs.
```javascript
const search = $("");

Input({ 
  type: "text", 
  placeholder: "Search...",
  $value: search // UI updates Signal AND Signal updates UI
});
```

### Dynamic Lists
Combine tags with `ui.For` for high-performance list rendering.
```javascript
const items = $(["Apple", "Banana", "Cherry"]);

Ul({ class: "list-disc" }, [
  ui.For(items, (item) => Li(item), (item) => item)
]);
```

---
::: danger
## ⚠️ Important: Naming Conventions

Since SigPro injects these helpers into the global `window` object, follow these rules to avoid bugs:

1.  **Avoid Shadowing**: Don't name your local variables like the tags (e.g., `const Div = ...`). This will "hide" the SigPro helper.
2.  **Custom Components**: Always use **PascalCase**, **UPPERCASE**, or **Underscore** prefixes for your own component functions (e.g., `UserCard`, `INPUT`, or `_Input`) to distinguish them from the built-in Tag Helpers and avoid naming collisions.
:::
---

## 6. Logic to UI Comparison

Here is how a dynamic **User Status** component translates from SigPro logic to the final DOM structure.

```javascript
// SigPro Component
const UserStatus = (name, $online) => (
  Div({ class: 'flex items-center gap-2' }, [
    Span({ 
      // Boolean toggle for 'hidden' attribute
      hidden: () => !$online(), 
      class: 'w-3 h-3 bg-green-500 rounded-full' 
    }),
    P({ 
      // Reactive text content
      class: () => $online() ? "text-bold" : "text-gray-400" 
    }, name)
  ])
);
```

| State (`$online`) | Rendered HTML |
| :--- | :--- |
| **`true`** | `<div class="flex..."><span class="w-3..."></span><p class="text-bold">John</p></div>` |
| **`false`** | `<div class="flex..."><span hidden class="w-3..."></span><p class="text-gray-400">John</p></div>` |


