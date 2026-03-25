# 🧩 UI Components `(WIP)`

> **Status: Work In Progress.** > These are high-level, complex visual components designed to speed up development. They often replace native HTML elements with "superpowered" versions that handle their own internal logic, reactivity, and accessibility.

## 1. What are UI Components?

Unlike **Tag Helpers** (which are just functional mirrors of HTML tags), SigPro UI Components are smart abstractions. 

* **Stateful**: They manage complex internal states (like date ranges, search filtering, or API lifecycles).
* **Reactive**: Attributes prefixed with `$` are automatically tracked.
* **Self-Cleaning**: They automatically use `_cleanups` to destroy observers or event listeners when removed from the DOM.
* **Themed**: Fully compatible with Tailwind CSS and DaisyUI themes.

---

## 2. The UI Registry (Available Now)

| Category | Components |
| :--- | :--- |
| **Logic & Flow** | `If`, `For`, `Json` |
| **Forms & Inputs** | `Button`, `Input`, `Select`, `Autocomplete`, `Datepicker`, `Colorpicker`, `CheckBox`, `Radio`, `Range`, `Rating`, `Swap` |
| **Feedback** | `Alert`, `Toast`, `Modal`, `Loading`, `Badge`, `Tooltip`, `Indicator` |
| **Navigation** | `Navbar`, `Menu`, `Drawer`, `Tabs`, `Accordion`, `Dropdown` |
| **Data & Layout** | `Request`, `Response`, `Grid` (AG-Grid), `List`, `Stack`, `Timeline`, `Stat`, `Fieldset`, `Fab` |

---

## 3. Examples with "Superpowers"

### A. The Declarative API Flow (`Request` & `Response`)
Instead of manually managing `loading` and `error` flags, use these two together to handle data fetching elegantly.

```javascript
// 1. Define the request (it tracks dependencies automatically)
const userProfile = Request(
  () => `https://api.example.com/user/${userId()}`
);

// 2. Render the UI based on the request state
Div({ class: "p-4" }, [
  Response(userProfile, (data) => 
    Div([
      H1(data.name),
      P(data.email)
    ])
  )
]);
```

### B. Smart Inputs & Autocomplete
Native inputs are boring. SigPro UI inputs handle labels, icons, password toggles, and validation states out of the box.

```javascript
const searchQuery = $("");

Autocomplete({
  label: "Find a Country",
  placeholder: "Start typing...",
  options: ["Spain", "France", "Germany", "Italy", "Portugal"],
  $value: searchQuery,
  onSelect: (val) => console.log("Selected:", val)
});
```

### C. The Reactive Datepicker
Handles single dates or ranges with a clean, reactive interface.

```javascript
const myDate = $(""); // or { start: "", end: "" } for range

Datepicker({
  label: "Select Expiry Date",
  $value: myDate,
  range: false // Set to true for range selection
});
```

### D. Imperative Toasts & Modals
Sometimes you just need to trigger a message without cluttering your template.

```javascript
// Show a notification from anywhere in your logic
Toast("Settings saved successfully!", "alert-success", 3000);

// Control a modal with a simple signal
const isModalOpen = $(false);

Modal({ 
  $open: isModalOpen, 
  title: "Delete Account",
  buttons: [
    Button({ class: "btn-error", onclick: doDelete }, "Confirm")
  ]
}, "This action cannot be undone.");
```

---

## 4. Internationalization (i18n)

The UI library comes with a built-in locale system. It currently supports `es` and `en`.

```javascript
// Set the global UI language
SetLocale("en");

// Access translated strings in your own components
const t = tt("confirm"); // Returns a signal that tracks the current locale
```

---

## 5. Best Practices

* **Use `$` for Reactivity**: If a property starts with `$`, it expects a Signal (e.g., `$value: mySignal`).
* **Key your Lists**: When using `For`, always provide a `keyFn` to ensure high-performance DOM reconciliation.
* **Cleanups**: If you build custom components that use `setInterval` or `observers`, add them to the element's `_cleanups` Set.

