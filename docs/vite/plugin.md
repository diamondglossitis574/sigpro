# Vite Plugin: Automatic File-based Routing 🚦

SigPro provides an optional Vite plugin that automatically generates routes based on your file structure. No configuration needed - just create pages and they're instantly available with the correct paths.

## Why Use This Plugin?

While SigPro's router works perfectly with manually defined routes, this plugin:
- **Eliminates boilerplate** - No need to write route configurations
- **Enforces conventions** - Consistent URL structure across your app
- **Supports dynamic routes** - Use `[param]` syntax for parameters
- **Automatic code-splitting** - Each page becomes a separate chunk
- **Type-safe** (with JSDoc) - Routes follow your file structure

## Installation

The plugin is included with SigPro, but you need to add it to your Vite config:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { sigproRouter } from 'sigpro/vite';

export default defineConfig({
  plugins: [sigproRouter()]
});
```

## How It Works

The plugin scans your `src/pages` directory and automatically generates routes based on the file structure:

```
src/pages/
├── index.js              →  '/'
├── about.js              →  '/about'
├── blog/
│   ├── index.js          →  '/blog'
│   └── [slug].js         →  '/blog/:slug'
└── users/
    ├── [id].js           →  '/users/:id'
    └── [id]/edit.js      →  '/users/:id/edit'
```

## Usage

### 1. Enable the Plugin

Add the plugin to your Vite config as shown above.

### 2. Import the Generated Routes

```javascript
// main.js
import { $, html } from 'sigpro';
import { routes } from 'virtual:sigpro-routes';

// Use the generated routes directly
const router = $.router(routes);
document.body.appendChild(router);
```

### 3. Create Pages

```javascript
// src/pages/index.js
import { $, html } from 'sigpro';

export default () => {
  return html`
    <div>
      <h1>Home Page</h1>
      <a href="#/about">About</a>
    </div>
  `;
};
```

```javascript
// src/pages/users/[id].js
import { $, html } from 'sigpro';

export default (params) => {
  const userId = params.id;
  
  return html`
    <div>
      <h1>User Profile: ${userId}</h1>
      <a href="#/users/${userId}/edit">Edit</a>
    </div>
  `;
};
```

## 📋 File-to-Route Mapping

### Static Routes

| File Path | Generated Route |
|-----------|-----------------|
| `src/pages/index.js` | `/` |
| `src/pages/about.js` | `/about` |
| `src/pages/contact/index.js` | `/contact` |
| `src/pages/blog/post.js` | `/blog/post` |

### Dynamic Routes

| File Path | Generated Route | Example URL |
|-----------|-----------------|-------------|
| `src/pages/users/[id].js` | `/users/:id` | `/users/42` |
| `src/pages/blog/[slug].js` | `/blog/:slug` | `/blog/hello-world` |
| `src/pages/users/[id]/posts/[pid].js` | `/users/:id/posts/:pid` | `/users/42/posts/123` |

### Nested Routes

| File Path | Generated Route | Notes |
|-----------|-----------------|-------|
| `src/pages/settings/index.js` | `/settings` | Index page |
| `src/pages/settings/profile.js` | `/settings/profile` | Sub-page |
| `src/pages/settings/security.js` | `/settings/security` | Sub-page |
| `src/pages/settings/[section].js` | `/settings/:section` | Dynamic section |

## 🎯 Advanced Examples

### Blog with Posts

```javascript
// src/pages/blog/index.js - Lists all posts
export default () => {
  const posts = $([]);
  
  $.effect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => posts(data));
  });
  
  return html`
    <div>
      <h1>Blog</h1>
      ${posts().map(post => html`
        <article>
          <h2><a href="#/blog/${post.slug}">${post.title}</a></h2>
          <p>${post.excerpt}</p>
        </article>
      `)}
    </div>
  `;
};
```

```javascript
// src/pages/blog/[slug].js - Single post
export default (params) => {
  const post = $(null);
  const slug = params.slug;
  
  $.effect(() => {
    fetch(`/api/posts/${slug}`)
      .then(res => res.json())
      .then(data => post(data));
  });
  
  return html`
    <div>
      <a href="#/blog">← Back to blog</a>
      ${() => post() ? html`
        <article>
          <h1>${post().title}</h1>
          <div>${post().content}</div>
        </article>
      ` : html`<div>Loading...</div>`}
    </div>
  `;
};
```

### Dashboard with Nested Sections

```javascript
// src/pages/dashboard/index.js
export default () => {
  return html`
    <div class="dashboard">
      <nav>
        <a href="#/dashboard">Overview</a>
        <a href="#/dashboard/analytics">Analytics</a>
        <a href="#/dashboard/settings">Settings</a>
      </nav>
      <main>
        <h1>Dashboard Overview</h1>
        <!-- Overview content -->
      </main>
    </div>
  `;
};
```

```javascript
// src/pages/dashboard/analytics.js
export default () => {
  return html`
    <div class="dashboard">
      <nav>
        <a href="#/dashboard">Overview</a>
        <a href="#/dashboard/analytics">Analytics</a>
        <a href="#/dashboard/settings">Settings</a>
      </nav>
      <main>
        <h1>Analytics</h1>
        <!-- Analytics content -->
      </main>
    </div>
  `;
};
```

### E-commerce Product Routes

```javascript
// src/pages/products/[category]/[id].js
export default (params) => {
  const { category, id } = params;
  const product = $(null);
  
  $.effect(() => {
    fetch(`/api/products/${category}/${id}`)
      .then(res => res.json())
      .then(data => product(data));
  });
  
  return html`
    <div class="product-page">
      <nav class="breadcrumbs">
        <a href="#/products">Products</a> &gt;
        <a href="#/products/${category}">${category}</a> &gt;
        <span>${id}</span>
      </nav>
      
      ${() => product() ? html`
        <div class="product">
          <h1>${product().name}</h1>
          <p class="price">$${product().price}</p>
          <p>${product().description}</p>
          <button @click=${() => addToCart(product())}>
            Add to Cart
          </button>
        </div>
      ` : html`<div>Loading...</div>`}
    </div>
  `;
};
```

## 🔧 Configuration Options

The plugin accepts an optional configuration object:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import { sigproRouter } from 'sigpro/vite';

export default defineConfig({
  plugins: [
    sigproRouter({
      pagesDir: 'src/pages',      // Default: 'src/pages'
      extensions: ['.js', '.jsx'], // Default: ['.js', '.jsx']
      exclude: ['**/_*', '**/components/**'] // Glob patterns to exclude
    })
  ]
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pagesDir` | `string` | `'src/pages'` | Directory containing your pages |
| `extensions` | `string[]` | `['.js', '.jsx']` | File extensions to include |
| `exclude` | `string[]` | `[]` | Glob patterns to exclude |

## 🎯 Route Priority

The plugin automatically sorts routes to ensure correct matching:

1. **Static routes** take precedence over dynamic ones
2. **More specific routes** (deeper paths) come first
3. **Alphabetical order** for routes at the same level

Example sorting:
```
/users/new           (static, specific)
/users/[id]/edit     (dynamic, deeper)
/users/[id]          (dynamic, shallower)
/users/profile       (static, shallower)
```

## 📦 Output Example

When you import `virtual:sigpro-routes`, you get:

```javascript
// Generated module
import Page_0 from '/src/pages/index.js';
import Page_1 from '/src/pages/about.js';
import Page_2 from '/src/pages/blog/index.js';
import Page_3 from '/src/pages/blog/[slug].js';
import Page_4 from '/src/pages/users/[id].js';
import Page_5 from '/src/pages/users/[id]/edit.js';

export const routes = [
  { path: '/', component: Page_0 },
  { path: '/about', component: Page_1 },
  { path: '/blog', component: Page_2 },
  { path: '/blog/:slug', component: Page_3 },
  { path: '/users/:id', component: Page_4 },
  { path: '/users/:id/edit', component: Page_5 },
];
```

## 🚀 Performance Benefits

- **Automatic code splitting** - Each page becomes a separate chunk
- **Lazy loading ready** - Import pages dynamically
- **Tree shaking** - Only used routes are included

```javascript
// With dynamic imports (automatic with Vite)
const routes = [
  { path: '/', component: () => import('./pages/index.js') },
  { path: '/about', component: () => import('./pages/about.js') },
  // ...
];
```

## 💡 Pro Tips

### 1. Group Related Pages

```
src/pages/
├── dashboard/
│   ├── index.js
│   ├── analytics.js
│   └── settings.js
└── dashboard.js   # ❌ Don't mix with folder
```

### 2. Use Index Files for Clean URLs

```
✅ Good:
pages/blog/index.js      → /blog
pages/blog/post.js       → /blog/post

❌ Avoid:
pages/blog.js            → /blog (conflicts with folder)
```

### 3. Private Components

Prefix with underscore to exclude from routing:

```
src/pages/
├── index.js
├── about.js
└── _components/         # ❌ Not scanned
    └── Header.js
```

### 4. Layout Components

Create a layout wrapper in your main entry:

```javascript
// main.js
import { $, html } from 'sigpro';
import { routes } from 'virtual:sigpro-routes';

// Wrap all routes with layout
const routesWithLayout = routes.map(route => ({
  ...route,
  component: (params) => Layout(route.component(params))
}));

const router = $.router(routesWithLayout);
document.body.appendChild(router);
```

---

> **Note:** This plugin is completely optional. You can always define routes manually if you prefer. The plugin just saves you from writing boilerplate route configurations.

> **Pro Tip:** The plugin works great with hot module replacement (HMR) - add a new page and it's instantly available in your dev server without restarting!
