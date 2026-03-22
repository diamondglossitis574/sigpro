# Global Tag Helpers

In **SigPro**, you don't need to write `$.html('div', ...)` every time. To keep your code clean and readable, the engine automatically generates global helper functions for all standard HTML tags.

## 1. How it Works

When SigPro initializes, it runs a proxy loop that creates a function for every common HTML tag and attaches it to the `window` object. 

* **Traditional:** `$.html('button', { onclick: ... }, 'Click')`
* **SigPro Style:** `button({ onclick: ... }, 'Click')`

This approach gives you a "DSL" (Domain Specific Language) that feels like HTML but is actually **pure JavaScript**.

---

## 2. The Global Registry

The following tags are available globally by default:

| Category | Available Functions |
| :--- | :--- |
| **Layout** | `div`, `span`, `section`, `main`, `nav`, `header`, `footer`, `article`, `aside` |
| **Typography** | `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `li`, `a`, `label`, `strong`, `em` |
| **Forms** | `form`, `input`, `button`, `select`, `option`, `textarea` |
| **Table** | `table`, `thead`, `tbody`, `tr`, `th`, `td` |
| **Media** | `img`, `video`, `audio`, `canvas`, `svg` |

---

## 3. Usage Patterns

The tag functions are highly flexible and accept arguments in different orders to suit your coding style.

### A. Attributes + Content
The most common pattern.
```javascript
div({ class: 'card' }, [
  h1("Title"),
  p("Description")
]);
```

### B. Content Only
If you don't need attributes, you can skip the object entirely.
```javascript
div([
  h1("Just Content"),
  p("No attributes object needed here.")
]);
```

### C. Simple Text
For elements that only contain a string.
```javascript
button("Submit"); // Equivalent to <button>Submit</button>
```

---

## 4. Reactive Tags

Since these helpers are just wrappers around `$.html`, they support full reactivity out of the box.

```javascript
const $loading = $(true);

div([
  $loading() ? span("Loading...") : h1("Data Ready!"),
  button({ 
    $disabled: $loading, // Reactive attribute
    onclick: () => $loading(false) 
  }, "Stop Loading")
]);
```

---

## 5. Under the Hood

If you are curious about how this happens without a compiler, here is the logic inside the SigPro core:

```javascript
const tags = ['div', 'span', 'p', 'button', ...];

tags.forEach(tag => {
  window[tag] = (props, content) => $.html(tag, props, content);
});
```

Because these are attached to `window`, they are available in any file in your project as soon as SigPro is loaded, making your components look like this:

```javascript
// No imports required for tags!
export default () => 
  section({ id: 'hero' }, [
    h1("Fast. Atomic. Simple."),
    p("Built with SigPro.")
  ]);
```

---

## 6. Full Comparison: SigPro vs. Standard HTML

To better understand the translation, here is a complete example of a **User Card** component. Notice how **SigPro** attributes with the `$` prefix map to reactive behavior, while standard attributes remain static.

::: code-group
```javascript [SigPro (JS)]
const $online = $(true);

export const UserCard = () => (
  div({ class: 'user-card' }, [
    img({ src: 'avatar.png', alt: 'User' }),
    
    div({ class: 'info' }, [
      h2("John Doe"),
      p({ 
        $class: () => $online() ? 'status-on' : 'status-off' 
      }, [
        "Status: ", 
        () => $online() ? "Online" : "Offline"
      ])
    ]),
    
    button({ 
      onclick: () => $online(!$online()) 
    }, "Toggle Status")
  ])
);
```

```html [Equivalent HTML Structure]
<div class="user-card">
  <img src="avatar.png" alt="User">
  
  <div class="info">
    <h2>John Doe</h2>
    <p class="status-on">
      Status: Online
    </p>
  </div>
  
  <button>Toggle Status</button>
</div>
```
:::

### What is happening here?

1.  **Structure:** The hierarchy is identical. `div([...])` in JS translates directly to nested tags in HTML.
2.  **Attributes:** `class` is set once. `$class` is "live"; SigPro listens to the `$online` signal and updates the class name without re-rendering the whole card.
3.  **Content:** The array `[...]` in SigPro is the equivalent of the children inside an HTML tag.
4.  **Reactivity:** The function `() => $online() ? ...` creates a **TextNode** in the HTML that changes its text content surgically whenever the signal toggles.

---

## 💡 Best Practices

1. **Destructuring:** If you prefer not to rely on global variables, you can destructure them from `window` or `$` (though in SigPro, using them globally is the intended "clean" way).
2. **Custom Tags:** If you need a tag that isn't in the default list (like a Web Component), you can still use the base engine: `$.html('my-custom-element', { ... })`.
