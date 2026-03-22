# Routing Engine: `$.router`

The `$.router` is SigPro's high-performance, hash-based navigation system. It connects the browser's URL directly to your reactive signals, enabling seamless page transitions without full reloads.

## 1. Core Features

* **Hash-based:** Works everywhere without special server configuration (using `#/path`).
* **Lazy Loading:** Pages are only downloaded when the user visits the route, keeping the initial bundle under 2KB.
* **Reactive:** The view updates automatically and surgically when the hash changes.
* **Dynamic Routes:** Built-in support for parameters like `/user/:id`.

---

## 2. Syntax: `$.router(routes)`

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **routes** | `Array<Object>` | **Yes** | An array of route definitions `{ path, component }`. |

---

## 3. Setting Up Routes

In your `App.js` (or a dedicated routes file), define your navigation map and inject it into your layout.

```javascript
const routes = [
  { path: '/', component: () => h1("Home Page") },
  { 
    path: '/admin', 
    // Lazy Loading: This file is only fetched when needed
    component: () => import('./pages/Admin.js') 
  },
  { path: '/user/:id', component: (params) => h2(`User ID: ${params.id}`) },
  { path: '*', component: () => div("404 - Page Not Found") }
];

export default () => div([
  header([
    h1("SigPro App"),
    nav([
      button({ onclick: () => $.router.go('/') }, "Home"),
      button({ onclick: () => $.router.go('/admin') }, "Admin")
    ])
  ]),
  // The router returns a reactive div that swaps content
  main($.router(routes)) 
]);
```

---

## 4. Navigation (`$.router.go`)

To move between pages programmatically (e.g., inside an `onclick` event or after a successful fetch), use the `$.router.go` helper.

```javascript
button({ 
  onclick: () => $.router.go('/admin') 
}, "Go to Admin")
```

---

## 5. How it Works (Under the Hood)

The router tracks the `window.location.hash` and uses a reactive signal to trigger a re-render of the specific area where `$.router(routes)` is placed.

1.  **Match:** It filters your route array to find the best fit, handling dynamic segments (`:id`) and fallbacks (`*`).
2.  **Resolve:** * If it's a standard function, it executes it immediately.
    * If it's a **Promise** (via `import()`), it renders a temporary `Loading...` state and swaps the content once the module arrives.
3.  **Inject:** It replaces the previous DOM node with the new page content surgically using `replaceWith()`.

---

## 6. Integration with UI Components

Since the router is reactive, you can easily create "active" states in your navigation menus by checking the current hash.

```javascript
// Example of a reactive navigation link
const NavLink = (path, label) => {
  const $active = $(() => window.location.hash === `#${path}`);
  
  return button({ 
    $class: () => $active() ? 'nav-active' : 'nav-link',
    onclick: () => $.router.go(path) 
  }, label);
};

nav([
  NavLink('/', 'Home'),
  NavLink('/settings', 'Settings')
]);
```

---

## 7. Summary: Route Component Types

| Component Type | Behavior |
| :--- | :--- |
| **HTMLElement** | Rendered immediately. |
| **Function `(params) => ...`** | Executed with URL parameters and rendered. |
| **Promise / `import()`** | Triggers **Lazy Loading** with a loading state. |
| **String / Number** | Rendered as simple text inside a span. |
