## 🚀 Vite Plugin for SigPro Router

Automatically generates routes from your file structure with zero configuration.

### 📁 File Structure

```
src/
  pages/
    index.js              → /
    about.js              → /about
    contact.js            → /contact
    user/
      index.js            → /user
      [id].js             → /user/:id
      [id]/
        posts.js          → /user/:id/posts
        [pid].js          → /user/:id/posts/:pid
    blog/
      [year]/
        [month]/
          [slug].js       → /blog/:year/:month/:slug
    dashboard/
      index.js            → /dashboard
      settings.js         → /dashboard/settings
```

### 📦 Installation

```bash
npm install --save-dev @sigpro/vite-plugin
# or
yarn add -D @sigpro/vite-plugin
# or
bun add -D @sigpro/vite-plugin
```

### ⚙️ Setup in `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import sigproRouter from '@sigpro/vite-plugin';

export default defineConfig({
  plugins: [sigproRouter()]
});
```

### 🎯 Usage in Your App

```javascript
// src/app.js
import { $, html } from 'sigpro';
import { routes } from 'virtual:sigpro-routes';

const App = () => html`
  <div class="app">
    <nav>
      <a href="#/">Home</a>
      <a href="#/about">About</a>
      <a href="#/user/42">User Profile</a>
      <a href="#/user/42/posts">User Posts</a>
      <a href="#/user/42/posts/123">Specific Post</a>
      <a href="#/blog/2024/03/hello-world">Blog Post</a>
    </nav>
    
    <main>
      ${$.router(routes)}
    </main>
  </div>
`;

document.body.appendChild(App());
```

### 📄 Creating Pages

#### Static Pages

```javascript
// src/pages/index.js
export default (params) => $.page(() => {
  return html`
    <div>
      <h1>Home Page</h1>
      <p>Welcome to my app!</p>
    </div>
  `;
});

// src/pages/about.js
export default (params) => $.page(() => {
  return html`
    <div>
      <h1>About Us</h1>
      <p>Learn more about our company.</p>
    </div>
  `;
});
```

#### Dynamic Pages with Parameters

```javascript
// src/pages/user/[id].js
export default (params) => $.page(({ onUnmount }) => {
  // params = { id: '42' }
  const userId = params.id;
  const userData = $(null);
  const loading = $(true);
  
  // Fetch user data
  const fetchUser = async () => {
    loading(true);
    try {
      const res = await fetch(`/api/users/${userId}`);
      const data = await res.json();
      userData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loading(false);
    }
  };
  
  fetchUser();
  
  return html`
    <div>
      ${loading() ? html`
        <div class="loading">Loading user ${userId}...</div>
      ` : html`
        <h1>${userData().name}</h1>
        <p>Email: ${userData().email}</p>
        <p>Role: ${userData().role}</p>
      `}
    </div>
  `;
});

// src/pages/user/[id]/posts/[pid].js
export default (params) => $.page(() => {
  // params = { id: '42', pid: '123' }
  const { id, pid } = params;
  
  return html`
    <div>
      <h1>Post ${pid}</h1>
      <p>From user ${id}</p>
      <a href="#/user/${id}/posts">← Back to posts</a>
    </div>
  `;
});
```

#### Nested Dynamic Routes

```javascript
// src/pages/blog/[year]/[month]/[slug].js
export default (params) => $.page(() => {
  // params = { year: '2024', month: '03', slug: 'hello-world' }
  const { year, month, slug } = params;
  
  return html`
    <article>
      <h1>${slug.replace(/-/g, ' ')}</h1>
      <time>${year}/${month}</time>
      <div class="content">
        <p>Blog post content here...</p>
      </div>
      <a href="#/blog">← Back to blog</a>
    </article>
  `;
});
```

### 🔄 Automatic Cleanup

```javascript
// src/pages/user/[id].js
export default (params) => $.page(({ onUnmount }) => {
  const userId = params.id;
  
  // ✅ Auto-cleaned by SigPro
  $.effect(() => {
    console.log('User effect running for', userId);
  });
  
  // ⚠️ Manual cleanup needed
  const interval = setInterval(() => {
    console.log('Polling user', userId);
  }, 5000);
  
  const handleResize = () => {
    console.log('Window resized');
  };
  window.addEventListener('resize', handleResize);
  
  // ✅ Cleanup with onUnmount
  onUnmount(() => {
    clearInterval(interval);
    window.removeEventListener('resize', handleResize);
    console.log('🧹 Cleaned up user', userId);
  });
  
  return html`<div>User ${userId}</div>`;
});
```

### 🧭 Navigation

```javascript
// Programmatic navigation
import { $ } from 'sigpro';

$.router.go('/user/42');
$.router.go('/user/42/posts/123');
$.router.go('about'); // Auto-adds leading slash

// In templates
html`
  <nav>
    <a href="#/">Home</a>
    <a href="#/user/${userId}">Profile</a>
    <button @click=${() => $.router.go('/contact')}>
      Contact
    </button>
  </nav>
`;
```

### 🎨 Route Parameters in Components

```javascript
// Access params anywhere
const currentUserId = () => {
  const match = window.location.hash.match(/^#\/user\/([^/]+)/);
  return match ? match[1] : null;
};

// Use in components
$.component('user-header', (props) => {
  const userId = currentUserId();
  
  return html`
    <header>
      <h1>User Dashboard: ${userId}</h1>
    </header>
  `;
}, []);
```

### ⚡ Advanced: Custom 404 Page

```javascript
// src/pages/404.js
export default (params) => $.page(() => {
  return html`
    <div class="text-center py-12">
      <h1 class="text-4xl font-bold mb-4">404</h1>
      <p class="text-gray-600 mb-6">Page not found</p>
      <a href="#/" class="text-blue-500 hover:underline">
        Go back home
      </a>
    </div>
  `;
});

// The router automatically shows 404 when no route matches
```

### 📊 Route Order (Automatic)

The plugin automatically orders routes from most specific to least specific:

```javascript
// Generated order:
[
  { path: '/user/:id/posts/:pid' },  // Most specific first
  { path: '/user/:id/posts' },
  { path: '/user/:id' },
  { path: '/user' },
  { path: '/about' },
  { path: '/' },                      // Least specific last
]
```

### 🎯 API Reference

#### Virtual Module
```javascript
import { routes } from 'virtual:sigpro-routes';
```

#### Route Object
```javascript
{
  path: string,      // '/user/:id' - Auto-generated from file structure
  component: Function // Page component that receives params
}
```

### 💡 Pro Tips

1. **Index files** become the parent route
   - `user/index.js` → `/user`
   - `user/[id]/index.js` → `/user/:id`

2. **Square brackets** `[param]` become route parameters `:param`
   - `[id].js` → `/:id`
   - `[slug].js` → `/:slug`

3. **Nested folders** create nested routes
   - `user/[id]/posts/[pid].js` → `/user/:id/posts/:pid`

4. **Cleanup** is automatic for pages, but manual for intervals/listeners

### 🚀 Benefits

- ✅ **Zero config** - Just create files in `src/pages/`
- ✅ **Auto-discovery** - No need to manually define routes
- ✅ **File-based routing** - Intuitive and scalable
- ✅ **Dynamic routes** - `[param]` syntax for parameters
- ✅ **Nested routes** - Mirror your folder structure
- ✅ **Automatic ordering** - Most specific routes first
- ✅ **TypeScript ready** - Works with `.tsx` files
- ✅ **Memory leak free** - Built on `$.page` cleanup
