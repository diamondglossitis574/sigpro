# SigPro Router Plugin for Vite

A Vite plugin that automatically generates routes from your file structure in `src/pages/`, similar to Next.js file-based routing but for any JavaScript project.

## Features

- 📁 **File-based routing**: Automatically creates routes from your `src/pages` directory
- 🔗 **Dynamic routes**: Supports parameterized routes using `[param]` syntax
- 🧭 **Path-to-regexp conversion**: Dynamic routes are converted to RegExp with named capture groups
- 📊 **Route map generation**: Console output shows all detected routes at build time
- 🎯 **Virtual module**: Access your routes via `virtual:sigpro-routes`

## Installation

1. Save the plugin code in your project, for example as `plugins/sigpro-router.js`

2. Add it to your Vite configuration:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import sigproRouter from './plugins/sigpro-router';

export default defineConfig({
  plugins: [sigproRouter()]
});
```

## Usage

### 1. Create Pages

Create `.js` files in your `src/pages` directory. Each file becomes a route:

```
src/pages/
├── index.js              -> /
├── about.js              -> /about
├── blog/
│   ├── index.js          -> /blog
│   └── [id].js           -> /blog/:id (dynamic)
└── users/
    └── [userId].js       -> /users/:userId (dynamic)
```

### 2. Access Routes in Your Application

The plugin exposes a virtual module `virtual:sigpro-routes` that exports a `routes` array:

```javascript
// In your router or main application file
import { routes } from 'virtual:sigpro-routes';

// The routes array structure:
// [
//   { path: '/', component: PageComponent, isDynamic: false, paramName: null },
//   { path: /^\/blog\/(?<id>[^/]+)$/, component: PageComponent, isDynamic: true, paramName: 'id' },
//   { path: /^\/users\/(?<userId>[^/]+)$/, component: PageComponent, isDynamic: true, paramName: 'userId' },
// ]

// Example usage with a simple router
function renderRoute(path) {
  for (const route of routes) {
    if (!route.isDynamic && route.path === path) {
      return route.component();
    } else if (route.isDynamic) {
      const match = path.match(route.path);
      if (match) {
        // Access params via match.groups
        const params = match.groups;
        return route.component(params);
      }
    }
  }
  return '<h1>404 Not Found</h1>';
}
```

### 3. Build Time Output

When you run your Vite dev server or build, you'll see a route map in the console:

```
🚀 [SigPro Router] Mapa de rutas generado:
   📄 /                    -> index.js
   📄 /about                -> about.js
   📄 /blog                 -> blog/index.js
   🔗 /blog/[id]            -> blog/[id].js
   🔗 /users/[userId]       -> users/[userId].js
```

## Route Priority

Routes are automatically prioritized:

1. Static routes (non-dynamic) are matched before dynamic routes
2. Routes are sorted by path length (shorter paths first)

## Route Object Properties

Each route in the `routes` array contains:

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string \| RegExp` | Static path string or RegExp for dynamic routes |
| `component` | `Function` | The imported page component/module |
| `isDynamic` | `boolean` | Whether the route has parameters |
| `paramName` | `string \| null` | The parameter name for dynamic routes |

## Dynamic Route Parameters

For dynamic routes like `blog/[id].js`:

- The route path becomes: `new RegExp("^\\/blog\\/(?<id>[^/]+)$")`
- Parameters can be accessed via `match.groups` when matching the route

Example:
```javascript
const match = '/blog/123'.match(/^\/blog\/(?<id>[^/]+)$/);
console.log(match.groups.id); // '123'
```

## Limitations

- Only scans `.js` files (no JSX/TS support by default - modify the plugin if needed)
- Requires a `src/pages` directory in your project root
- Dynamic parameters are matched as single path segments (no catch-all routes)

## Customization

You can modify the plugin to:
- Support other file extensions (.jsx, .ts, .tsx)
- Change the pages directory location
- Add custom route sorting logic
- Implement nested dynamic routes

---

Built for SigPro applications with Vite.
