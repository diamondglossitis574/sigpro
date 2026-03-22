# Rendering Engine: `$.html`

The `$.html` function is the architect of your UI. It creates standard HTML elements and wires them directly to your signals without the need for a Virtual DOM.

## 1. Syntax: `$.html(tag, [props], [content])`

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **tag** | `string` | **Yes** | Any valid HTML5 tag (e.g., `'div'`, `'button'`, `'input'`). |
| **props** | `Object` | No | Attributes, event listeners, and reactive bindings. |
| **content** | `any` | No | Text, Nodes, Arrays, or Reactive Functions. |

### Example:
```javascript
const myButton = $.html('button', { class: 'btn-primary' }, 'Click me');
```

---

## 2. Global Tag Helpers

To avoid repetitive `$.html` calls, SigPro automatically exposes common tags to the global `window` object. This allows for a clean, declarative syntax.

```javascript
// Instead of $.html('div', ...), just use:
div({ id: 'wrapper' }, [
  h1("Welcome"),
  p("This is SigPro.")
]);
```

---

## 3. Handling Properties & Attributes

SigPro distinguishes between static attributes and reactive bindings using the **`$` prefix**.

### Static vs. Reactive Attributes
* **Static:** Applied once during creation.
* **Reactive (`$`):** Automatically updates the DOM when the signal changes.

| Property | Syntax | Result |
| :--- | :--- | :--- |
| **Attribute** | `{ id: 'main' }` | `id="main"` |
| **Event** | `{ onclick: fn }` | Adds an event listener. |
| **Reactive Attr** | `{ $class: $theme }` | Updates `class` whenever `$theme()` changes. |
| **Boolean Attr** | `{ $disabled: $isBusy }` | Toggles the `disabled` attribute automatically. |



---

## 4. Two-Way Data Binding

For form inputs, SigPro provides a powerful shortcut using `$value` or `$checked`. It automatically handles the event listening and the value synchronization.

```javascript
const $text = $("Type here...");

input({ 
  type: 'text', 
  $value: $text // Syncs input -> signal and signal -> input
});

p(["You typed: ", $text]);
```

---

## 5. Reactive Content (Dynamic Children)

The `content` argument is incredibly flexible. If you pass a **function**, SigPro treats it as a reactive "portal" that re-renders only that specific part of the DOM.

### Text & Nodes
```javascript
const $count = $(0);

// Text node updates surgically
div(["Count: ", $count]); 

// Conditional rendering with a function
div(() => {
  return $count() > 10 
    ? h1("High Score!") 
    : p("Keep going...");
});
```

### The "Guillotine" (Performance Tip)
When a reactive function in the content returns a **new Node**, SigPro uses `replaceWith()` to swap the old node for the new one. This ensures that:
1. The update is nearly instantaneous.
2. The old node is correctly garbage-collected.

---

## 6. Summary: Content Types

| Input | Behavior |
| :--- | :--- |
| **String / Number** | Appended as a TextNode. |
| **HTMLElement** | Appended directly to the parent. |
| **Array** | Each item is processed and appended in order. |
| **Function `() => ...`** | Creates a **live reactive zone** that updates automatically. |
