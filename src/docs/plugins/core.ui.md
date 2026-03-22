# Official UI Plugin: `UI`

The **SigPro UI** plugin is a high-level component library built on top of the reactive core. It leverages **Tailwind CSS v4** for utility styling and **daisyUI v5** for semantic components.

## 1. Prerequisites & Installation

To use these components, you must install the styling engine. SigPro UI provides the logic, but Tailwind and daisyUI provide the visuals.

::: code-group
```bash [NPM]
npm install -D tailwindcss @tailwindcss/vite daisyui@next
```

```bash [PNPM]
pnpm add -D tailwindcss @tailwindcss/vite daisyui@next
```

```bash [Yarn]
yarn add -D tailwindcss @tailwindcss/vite daisyui@next
```

```bash [Bun]
bun add -d tailwindcss @tailwindcss/vite daisyui@next
```
:::

Would you like to continue with the **Router.md** documentation now?

### CSS Configuration (`app.css`)
In Tailwind v4, configuration is handled directly in your CSS. Create a `src/app.css` file:

```css
/* src/app.css */
@import "tailwindcss";

/* Import daisyUI v5 as a Tailwind v4 plugin */
@plugin "daisyui";

/* Optional: Configure themes */
@custom-variant dark (&:where(.dark, [data-theme="dark"], [data-theme="dark"] *)));
```

---

## 2. Initialization

You must import your CSS and register the `UI` plugin in your entry point. This populates the global scope with reactive component helpers (prefixed with `_`).

```javascript
// main.js
import './app.css';
import { $ } from 'sigpro';
import { UI } from 'sigpro/plugins';

$.plugin(UI).then(() => {
  // Global components like _button and _input are now ready
  import('./App.js').then(app => $.mount(app.default));
});
```

---

## 3. Core Component Tags (`_tags`)

SigPro UI components are more than just HTML; they are **Reactive Functional Components** that manage complex states (loading, errors, accessibility) automatically.

### A. Action Components (`_button`)
The `_button` automatically handles spinners and disabled states based on signals.

| Property | Type | Description |
| :--- | :--- | :--- |
| **`$loading`** | `signal` | If true, shows a spinner and disables the button. |
| **`$disabled`**| `signal` | Manually disables the button (logic-bound). |
| **`icon`** | `node/str`| Prepends an icon to the text. |
| **`badge`** | `string` | Appends a small badge to the button. |

```javascript
_button({ 
  $loading: $isSaving, 
  icon: '💾', 
  class: 'btn-primary' 
}, "Save Data")
```

### B. High-Density Forms (`_input`, `_select`, `_checkbox`)
These components wrap the raw input in a `fieldset` with integrated labels and tooltips.

* **`label`**: Field title displayed above the input.
* **`tip`**: Displays a `?` badge that shows a tooltip on hover.
* **`$error`**: A signal that, when populated, turns the input red and displays the message.
* **`$value`**: **Two-way binding**. Updates the signal on input and the input on signal change.

```javascript
_input({
  label: "Username",
  tip: "Choose a unique name",
  $value: $name,
  $error: $nameError
})
```

---

## 4. Complex UI Patterns

### Reactive Modals (`_modal`)
The `_modal` is surgically mounted. If the `$open` signal is `false`, the component is completely removed from the DOM, optimizing performance.

```javascript
const $showModal = $(false);

_modal({ $open: $showModal, title: "Alert" }, [
  p("Are you sure you want to proceed?"),
  _button({ onclick: () => doAction() }, "Confirm")
])
```

### Navigation & Layout (`_tabs`, `_drawer`, `_navbar`)
Designed to work seamlessly with the **Router**.

| Component | Key Logic |
| :--- | :--- |
| **`_tabs`** | Accepts an `active` property (signal or function) to highlight the current tab. |
| **`_drawer`** | A responsive sidebar that toggles via an ID or an `$open` signal. |
| **`_navbar`** | Standard top bar with shadow and glass effect support. |
| **`_menu`** | Vertical navigation list with active state support. |

---

## 5. Summary Table: UI Globals

Once `$.plugin(UI)` is active, these tags are available project-wide:

| Tag | Category | Use Case |
| :--- | :--- | :--- |
| `_fieldset` | Layout | Grouping related inputs with a `legend`. |
| `_accordion`| Content | Collapsible sections (FAQs). |
| `_badge`     | Feedback | Status indicators (Success, Warning). |
| `_tooltip`   | Feedback | Descriptive text on hover. |
| `_range`     | Input | Reactive slider for numerical values. |

---

### What's next?
With the UI ready and styled via **Tailwind v4**, we can move to the **Router.md**. We will explain how to link `_tabs` and `_menu` to different URL paths for a full SPA experience.

**Would you like to start with the Router configuration?**