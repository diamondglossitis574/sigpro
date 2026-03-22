# Vite Plugin: File-based Routing

The `sigproRouter` plugin for Vite automates route generation by scanning your pages directory. It creates a **virtual module** that you can import directly into your code, eliminating the need to maintain a manual routes array.

## 1. Project Structure

To use the plugin, organize your files within the `src/pages` directory. The folder hierarchy directly determines your application's URL structure.

```text
my-sigpro-app/
├── src/
│   ├── pages/
│   │   ├── index.js          →  #/
│   │   ├── about.js          →  #/about
│   │   ├── users/
│   │   │   └── [id].js       →  #/users/:id
│   │   └── blog/
│   │       ├── index.js      →  #/blog
│   │       └── [slug].js     →  #/blog/:slug
│   ├── App.js                (Optional App Shell)
│   └── main.js               (Entry Point)
├── vite.config.js
└── package.json
```

---

## 2. Setup & Configuration

Add the plugin to your `vite.config.js`.

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { sigproRouter } from 'sigpro/vite';

export default defineConfig({
  plugins: [sigproRouter()]
});
```

---

## 3. Implementation

You can implement the router either directly in your entry point or inside an App component to support persistent layouts (like a navbar that doesn't re-render).

### Option A: Direct in `main.js`
Best for simple apps where the router occupies the entire viewport.

```javascript
// src/main.js
import { $ } from 'sigpro';
import { Router } from 'sigpro/plugins';
import { routes } from 'virtual:sigpro-routes';

$.plugin(Router).then(() => {
  $.mount(_router(routes), '#app');
});
```

### Option B: Inside `App.js` (With Layout)
Recommended for apps with a fixed Sidebar or Navbar.

```javascript
// src/main.js
import { $ } from 'sigpro';
import { Router } from 'sigpro/plugins';

$.plugin(Router).then(() => {
  import('./App.js').then(app => $.mount(app.default, '#app'));
});

// src/App.js
import { routes } from 'virtual:sigpro-routes';

export default () => {
  return div({ class: 'layout' }, [
    header([
      h1("SigPro App"),
      nav([
        a({ href: '#/' }, "Home"),
        a({ href: '#/blog' }, "Blog")
      ])
    ]),
    // The router only swaps the content inside this <main> tag
    main(_router(routes))
  ]);
};
```

---

## 4. Route Mapping Reference

| File Path | Generated Route | Logic |
| :--- | :--- | :--- |
| `index.js` | `/` | Home page |
| `about.js` | `/about` | Static path |
| `[id].js` | `/:id` | Dynamic parameter |
| `blog/index.js` | `/blog` | Folder index |
| `_utils.js` | *Ignored* | Files starting with `_` are skipped |

---

## 5. Installation

::: code-group
```bash [NPM]
npm install sigpro
```

```bash [PNPM]
pnpm add sigpro
```

```bash [Yarn]
yarn add sigpro
```

```bash [Bun]
bun add sigpro
```
:::
