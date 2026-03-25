# 🖼️ Component Lifecycle: `$.view( )`

The `$.view` function is a specialized wrapper used to manage the lifecycle of a UI component. It tracks all signals, effects, and DOM elements created within it, providing a single point of destruction to prevent memory leaks.

## 🛠 Function Signature

```typescript
$.view(renderFn: Function): RuntimeObject
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`renderFn`** | `Function` | Yes | A function that returns a DOM Node or an array of Nodes. |

**Returns:** A `Runtime` object containing:
* `container`: A `div` (with `display: contents`) holding the rendered content.
* `destroy()`: A function that unmounts the view and cleans up all internal effects/listeners.

---

## 📖 Usage Patterns

### 1. Basic Component Wrapper
When you wrap logic in `$.view`, SigPro creates a "boundary".

```javascript
const myView = $.view(() => {
  const count = $(0);
  
  // This effect is "owned" by this view
  $.effect(() => console.log(count()));

  return Div([
    H1("Internal View"),
    Button({ onclick: () => count(c => c + 1) }, "Add")
  ]);
});

// To show it:
document.body.appendChild(myView.container);

// To kill it (removes from DOM and stops all internal effects):
myView.destroy();
```

### 2. Manual Cleanups with `onCleanup`
The `renderFn` receives a helper object that allows you to register custom cleanup logic (like closing a WebSocket or a third-party library instance).

```javascript
const ChartComponent = () => $.view(({ onCleanup }) => {
  const socket = new WebSocket("ws://...");

  onCleanup(() => {
    socket.close();
    console.log("Cleanup: WebSocket closed");
  });

  return Div({ class: "chart-container" });
});
```

---

## 🏗️ Internal Architecture

When `$.view` is called, it performs the following:
1. **Isolation**: It creates a new `Set` of cleanups.
2. **Execution**: It runs your function and captures any `$.effect` or child `$.view` created during execution.
3. **Container**: It wraps the result in a `display: contents` element (which doesn't affect your CSS layout).
4. **Disposal**: When `destroy()` is called, it recursively calls all cleanup functions and removes the container from the DOM.

---

## 💡 Why use `$.view`?

* **Automatic Cleanup**: You don't have to manually stop every effect when a user navigates away.
* **Router Integration**: The SigPro Router (`$.router`) uses `$.view` internally to swap pages and clean up the previous one automatically.
* **Performance**: It ensures that background processes (like intervals or observers) stop as soon as the element is no longer visible.
