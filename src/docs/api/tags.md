# Global Tag Helpers

In **SigPro**, you don't need to write `$.html('div', ...)` every time. To keep your code clean and readable, the engine automatically generates global helper functions for all standard HTML tags upon initialization.

## 1. How it Works

SigPro iterates through an internal manifest of standard HTML tags and attaches a wrapper function for each one directly to the `window` object. This creates a native "DSL" (Domain Specific Language) that looks like a template engine but is **100% standard JavaScript**.

* **Under the hood:** `$.html('button', { onclick: ... }, 'Click')`
* **SigPro Style:** `button({ onclick: ... }, 'Click')`

---

## 2. The Complete Global Registry

The following tags are injected into the global scope and are ready to use as soon as SigPro loads:

| Category | Available Global Functions |
| :--- | :--- |
| **Structure** | `div`, `span`, `p`, `section`, `nav`, `main`, `header`, `footer`, `article`, `aside` |
| **Typography** | `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `ul`, `ol`, `li`, `dl`, `dt`, `dd`, `strong`, `em`, `code`, `pre`, `small`, `i`, `b`, `u`, `mark` |
| **Interactive** | `button`, `a`, `label`, `br`, `hr`, `details`, `summary` |
| **Forms** | `form`, `input`, `select`, `option`, `textarea`, `fieldset`, `legend` |
| **Tables** | `table`, `thead`, `tbody`, `tr`, `th`, `td`, `tfoot`, `caption` |
| **Media & Graphics** | `img`, `canvas`, `video`, `audio`, `svg`, `path`, `iframe` |

> "In SigPro, tags are not 'magic' strings handled by a compiler. They are **functional imitations** of HTML elements. Every time you call `div()`, you are executing a standard JavaScript function that returns a real DOM element. This gives you the speed of a specialized DSL with the transparency of pure JS."

::: danger WARNING: GLOBAL NAMING COLLISIONS
Since **SigPro** injects these helpers directly into the `window` object, they are regular JavaScript functions. This means **they can be overwritten**.

If you declare a variable, constant, or function with the same name as an HTML tag (e.g., `const div = ...` or `function p()`), you will **nullify or shadow** the built-in SigPro helper for that tag in your current scope.

**Best Practice:** To avoid conflicts, always use **PascalCase** for your custom components (e.g., `UserCard`, `AppHeader`) to distinguish them from the **lowercase** global HTML helpers.
:::

---

## 3. Usage Patterns (Argument Flexibility)

The tag functions are "smart". They detect whether you are passing attributes, content, or both.

### A. Attributes + Content
The standard way to build complex nodes.
```javascript
div({ class: 'container', id: 'main-wrapper' }, [
  h1("Welcome"),
  p("This is SigPro.")
]);
```

### B. Content Only (The "Skipper")
If you don't need attributes, you can pass the content (string, array, or function) as the **first and only** argument.
```javascript
section([
  h2("No Attributes Needed"),
  button("Click Me")
]);
```

### C. Primitive Content
For simple tags, you can just pass a string or a number.
```javascript
h1("Hello World"); 
span(42);
```

---

## 4. Reactive Attributes & Content

These helpers fully support SigPro's reactivity. Attributes starting with `$` are automatically tracked.

```javascript
const $count = $(0);

div({ class: 'counter-app' }, [
  h2(["Current Count: ", $count]), // Auto-unwrapping text content
  
  button({ 
    onclick: () => $count(c => c + 1),
    $style: () => $count() > 5 ? "color: red" : "color: green" // Reactive style
  }, "Increment")
]);
```

---

## 5. Technical Implementation

As seen in the SigPro core, the engine registers these tags dynamically. This means **zero imports** are needed for UI creation in your component files.

```javascript
// Internal SigPro loop
tags.forEach(t => window[t] = (p, c) => $.html(t, p, c));
```

Because they are real functions, you get full IDE autocompletion and valid JS syntax highlighting without needing special plugins like JSX.

---

## 6. Comparison: Logic to UI

Here is how a dynamic **Task Item** component translates from SigPro logic to the final DOM structure.

::: code-group
```javascript [SigPro Component]
const Task = (title, $done) => (
  li({ class: 'task-item' }, [
    input({ 
      type: 'checkbox', 
      $checked: $done // Two-way reactive binding
    }),
    span({ 
      $style: () => $done() ? "text-decoration: line-through" : "" 
    }, title)
  ])
);
```

```html [Rendered HTML]
<li class="task-item">
  <input type="checkbox" checked>
  <style="text-decoration: line-through">Buy milk</span>
</li>
```
:::

