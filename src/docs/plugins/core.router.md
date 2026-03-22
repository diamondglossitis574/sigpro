# Navigation Plugin: `Router`

The SigPro Router handles URL changes via hashes (`#`) and maps them to components. It supports dynamic parameters (like `:id`) and asynchronous loading for heavy pages.

## 1. Core Features

* **Hash-based:** Works everywhere without special server configuration.
* **Lazy Loading:** Pages are only downloaded when the user visits the route.
* **Reactive:** The view updates automatically when the hash changes.
* **Dynamic Routes:** Supports paths like `/user/:id`.

---

## 2. Installation

The Router is usually included in the official plugins package.

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

---

## 3. Setting Up Routes

In your `App.js` (or a dedicated routes file), define your navigation map.

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
  _navbar({ title: "My App" }),
  _router(routes) // The router is now a global tag
]);
```

---

## 4. Navigation (`_router.go`)

To move between pages programmatically (e.g., inside an `onclick` event), use the global `_router.go` helper.

```javascript
_button({ 
  onclick: () => _router.go('/admin') 
}, "Go to Admin")
```

---

## 5. How it Works (Under the Hood)

The router tracks the `window.location.hash` and uses a reactive signal to trigger a re-render of the specific area where `_router(routes)` is placed.

1.  **Match:** It filters your route array to find the best fit.
2.  **Resolve:** * If it's a standard function, it executes it immediately.
    * If it's a **Promise** (via `import()`), it shows a loading state and swaps the content once the module arrives.
3.  **Inject:** It replaces the previous DOM node with the new page content surgically.



---

## 6. Integration with UI Components

Since you are using the **UI Plugin**, you can easily create active states in your navigation menus by checking the current hash.

```javascript
// Example of a reactive sidebar menu
_menu({
  items: [
    { 
      label: 'Dashboard', 
      active: () => window.location.hash === '#/', 
      onclick: () => _router.go('/') 
    },
    { 
      label: 'Settings', 
      active: () => window.location.hash === '#/settings', 
      onclick: () => _router.go('/settings') 
    }
  ]
})
```



