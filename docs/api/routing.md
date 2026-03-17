# Routing API 🌐

SigPro includes a simple yet powerful hash-based router designed for Single Page Applications (SPAs). It works everywhere with zero server configuration and integrates seamlessly with `$.page` for automatic cleanup.

## Why Hash-Based Routing?

Hash routing (`#/about`) works **everywhere** - no server configuration needed. Perfect for:
- Static sites and SPAs
- GitHub Pages, Netlify, any static hosting
- Local development without a server
- Projects that need to work immediately

## `$.router(routes)`

Creates a hash-based router that renders the matching component and handles navigation.

```javascript
import { $, html } from 'sigpro';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';
import UserPage from './pages/User.js';

const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/user/:id', component: UserPage },
];

// Mount the router
document.body.appendChild($.router(routes));
```

## 📋 API Reference

### `$.router(routes)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `routes` | `Array<Route>` | Array of route configurations |

**Returns:** `HTMLDivElement` - Container that renders the current page

### `$.router.go(path)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | `string` | Route path to navigate to (automatically adds leading slash) |

### Route Object

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` or `RegExp` | Route pattern to match |
| `component` | `Function` | Function that returns page content (receives `params`) |

## 🎯 Route Patterns

### String Paths (Simple Routes)

```javascript
const routes = [
  // Static routes
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/contact', component: ContactPage },
  
  // Routes with parameters
  { path: '/user/:id', component: UserPage },
  { path: '/user/:id/posts', component: UserPostsPage },
  { path: '/user/:id/posts/:postId', component: PostPage },
  { path: '/search/:query/page/:num', component: SearchPage },
];
```

### RegExp Paths (Advanced Routing)

```javascript
const routes = [
  // Match numeric IDs only
  { path: /^\/users\/(?<id>\d+)$/, component: UserPage },
  
  // Match product slugs (letters, numbers, hyphens)
  { path: /^\/products\/(?<slug>[a-z0-9-]+)$/, component: ProductPage },
  
  // Match blog posts by year/month
  { path: /^\/blog\/(?<year>\d{4})\/(?<month>\d{2})$/, component: BlogArchive },
  
  // Match optional language prefix
  { path: /^\/(?<lang>en|es|fr)?\/?about$/, component: AboutPage },
  
  // Match UUID format
  { path: /^\/items\/(?<uuid>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/, 
    component: ItemPage },
];
```

## 📦 Basic Examples

### Simple Router Setup

```javascript
// main.js
import { $, html } from 'sigpro';
import Home from './pages/Home.js';
import About from './pages/About.js';
import Contact from './pages/Contact.js';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/contact', component: Contact },
];

const router = $.router(routes);

// Mount to DOM
document.body.appendChild(router);
```

### Page Components with Parameters

```javascript
// pages/User.js
import { $, html } from 'sigpro';

export default (params) => $.page(() => {
  // /user/42 → params = { id: '42' }
  // /user/john/posts/123 → params = { id: 'john', postId: '123' }
  const userId = params.id;
  const userData = $(null);
  
  $.effect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => userData(data));
  });
  
  return html`
    <div class="user-page">
      <h1>User Profile: ${userId}</h1>
      ${() => userData() ? html`
        <p>Name: ${userData().name}</p>
        <p>Email: ${userData().email}</p>
      ` : html`<p>Loading...</p>`}
    </div>
  `;
});
```

### Navigation

```javascript
import { $, html } from 'sigpro';

// In templates
const NavBar = () => html`
  <nav>
    <a href="#/">Home</a>
    <a href="#/about">About</a>
    <a href="#/contact">Contact</a>
    <a href="#/user/42">Profile</a>
    <a href="#/search/js/page/1">Search</a>
    
    <!-- Programmatic navigation -->
    <button @click=${() => $.router.go('/about')}>
      Go to About
    </button>
    
    <button @click=${() => $.router.go('contact')}>
      Go to Contact (auto-adds leading slash)
    </button>
  </nav>
`;
```

## 🚀 Advanced Examples

### Complete Application with Layout

```javascript
// App.js
import { $, html } from 'sigpro';
import HomePage from './pages/Home.js';
import AboutPage from './pages/About.js';
import UserPage from './pages/User.js';
import SettingsPage from './pages/Settings.js';
import NotFound from './pages/NotFound.js';

// Layout component with navigation
const Layout = (content) => html`
  <div class="app">
    <header class="header">
      <h1>My SigPro App</h1>
      <nav class="nav">
        <a href="#/" class:active=${() => isActive('/')}>Home</a>
        <a href="#/about" class:active=${() => isActive('/about')}>About</a>
        <a href="#/user/42" class:active=${() => isActive('/user/42')}>Profile</a>
        <a href="#/settings" class:active=${() => isActive('/settings')}>Settings</a>
      </nav>
    </header>
    
    <main class="main">
      ${content}
    </main>
    
    <footer class="footer">
      <p>© 2024 SigPro App</p>
    </footer>
  </div>
`;

// Helper to check active route
const isActive = (path) => {
  const current = window.location.hash.replace(/^#/, '') || '/';
  return current === path;
};

// Routes with layout
const routes = [
  { path: '/', component: (params) => Layout(HomePage(params)) },
  { path: '/about', component: (params) => Layout(AboutPage(params)) },
  { path: '/user/:id', component: (params) => Layout(UserPage(params)) },
  { path: '/settings', component: (params) => Layout(SettingsPage(params)) },
  { path: '/:path(.*)', component: (params) => Layout(NotFound(params)) }, // Catch-all
];

// Create and mount router
const router = $.router(routes);
document.body.appendChild(router);
```

### Nested Routes

```javascript
// pages/Settings.js (parent route)
import { $, html } from 'sigpro';
import SettingsGeneral from './settings/General.js';
import SettingsSecurity from './settings/Security.js';
import SettingsNotifications from './settings/Notifications.js';

export default (params) => $.page(() => {
  const section = params.section || 'general';
  
  const sections = {
    general: SettingsGeneral,
    security: SettingsSecurity,
    notifications: SettingsNotifications
  };
  
  const CurrentSection = sections[section];
  
  return html`
    <div class="settings">
      <h1>Settings</h1>
      
      <div class="settings-layout">
        <nav class="settings-sidebar">
          <a href="#/settings/general" class:active=${() => section === 'general'}>
            General
          </a>
          <a href="#/settings/security" class:active=${() => section === 'security'}>
            Security
          </a>
          <a href="#/settings/notifications" class:active=${() => section === 'notifications'}>
            Notifications
          </a>
        </nav>
        
        <div class="settings-content">
          ${CurrentSection(params)}
        </div>
      </div>
    </div>
  `;
});

// pages/settings/General.js
export default (params) => $.page(() => {
  return html`
    <div>
      <h2>General Settings</h2>
      <form>...</form>
    </div>
  `;
});

// Main router with nested routes
const routes = [
  { path: '/', component: HomePage },
  { path: '/settings/:section?', component: SettingsPage }, // Optional section param
];
```

### Protected Routes (Authentication)

```javascript
// auth.js
import { $ } from 'sigpro';

const isAuthenticated = $(false);
const user = $(null);

export const checkAuth = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch('/api/verify');
      if (response.ok) {
        const userData = await response.json();
        user(userData);
        isAuthenticated(true);
        return true;
      }
    } catch (e) {
      // Handle error
    }
  }
  isAuthenticated(false);
  user(null);
  return false;
};

export const requireAuth = (component) => (params) => {
  if (isAuthenticated()) {
    return component(params);
  }
  // Redirect to login
  $.router.go('/login');
  return null;
};

export { isAuthenticated, user };
```

```javascript
// pages/Dashboard.js (protected route)
import { $, html } from 'sigpro';
import { requireAuth, user } from '../auth.js';

const Dashboard = (params) => $.page(() => {
  return html`
    <div class="dashboard">
      <h1>Welcome, ${() => user()?.name}!</h1>
      <p>This is your protected dashboard.</p>
    </div>
  `;
});

export default requireAuth(Dashboard);
```

```javascript
// main.js with protected routes
import { $, html } from 'sigpro';
import { checkAuth } from './auth.js';
import HomePage from './pages/Home.js';
import LoginPage from './pages/Login.js';
import DashboardPage from './pages/Dashboard.js';
import AdminPage from './pages/Admin.js';

// Check auth on startup
checkAuth();

const routes = [
  { path: '/', component: HomePage },
  { path: '/login', component: LoginPage },
  { path: '/dashboard', component: DashboardPage }, // Protected
  { path: '/admin', component: AdminPage }, // Protected
];

document.body.appendChild($.router(routes));
```

### Route Transitions

```javascript
// with-transitions.js
import { $, html } from 'sigpro';

export const createRouterWithTransitions = (routes) => {
  const transitioning = $(false);
  const currentView = $(null);
  const nextView = $(null);
  
  const container = document.createElement('div');
  container.style.display = 'contents';
  
  const renderWithTransition = async (newView) => {
    if (currentView() === newView) return;
    
    transitioning(true);
    nextView(newView);
    
    // Fade out
    container.style.transition = 'opacity 0.2s';
    container.style.opacity = '0';
    
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Update content
    container.replaceChildren(newView);
    currentView(newView);
    
    // Fade in
    container.style.opacity = '1';
    
    await new Promise(resolve => setTimeout(resolve, 200));
    transitioning(false);
    container.style.transition = '';
  };
  
  const router = $.router(routes.map(route => ({
    ...route,
    component: (params) => {
      const view = route.component(params);
      renderWithTransition(view);
      return document.createComment('router-placeholder');
    }
  })));
  
  return router;
};
```

### Breadcrumbs Navigation

```javascript
// with-breadcrumbs.js
import { $, html } from 'sigpro';

export const createBreadcrumbs = (routes) => {
  const breadcrumbs = $([]);
  
  const updateBreadcrumbs = (path) => {
    const parts = path.split('/').filter(Boolean);
    const crumbs = [];
    let currentPath = '';
    
    parts.forEach((part, index) => {
      currentPath += `/${part}`;
      
      // Find matching route
      const route = routes.find(r => {
        if (r.path.includes(':')) {
          const pattern = r.path.replace(/:[^/]+/g, part);
          return pattern === currentPath;
        }
        return r.path === currentPath;
      });
      
      crumbs.push({
        path: currentPath,
        label: route?.name || part.charAt(0).toUpperCase() + part.slice(1),
        isLast: index === parts.length - 1
      });
    });
    
    breadcrumbs(crumbs);
  };
  
  // Listen to route changes
  window.addEventListener('hashchange', () => {
    const path = window.location.hash.replace(/^#/, '') || '/';
    updateBreadcrumbs(path);
  });
  
  // Initial update
  updateBreadcrumbs(window.location.hash.replace(/^#/, '') || '/');
  
  return breadcrumbs;
};
```

```javascript
// Usage in layout
import { createBreadcrumbs } from './with-breadcrumbs.js';

const breadcrumbs = createBreadcrumbs(routes);

const Layout = (content) => html`
  <div class="app">
    <nav class="breadcrumbs">
      ${() => breadcrumbs().map(crumb => html`
        ${!crumb.isLast ? html`
          <a href="#${crumb.path}">${crumb.label}</a>
          <span class="separator">/</span>
        ` : html`
          <span class="current">${crumb.label}</span>
        `}
      `)}
    </nav>
    
    <main>
      ${content}
    </main>
  </div>
`;
```

### Query Parameters

```javascript
// with-query-params.js
export const getQueryParams = () => {
  const hash = window.location.hash;
  const queryStart = hash.indexOf('?');
  if (queryStart === -1) return {};
  
  const queryString = hash.slice(queryStart + 1);
  const params = new URLSearchParams(queryString);
  const result = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
};

export const updateQueryParams = (params) => {
  const hash = window.location.hash.split('?')[0];
  const queryString = new URLSearchParams(params).toString();
  window.location.hash = queryString ? `${hash}?${queryString}` : hash;
};
```

```javascript
// Search page with query params
import { $, html } from 'sigpro';
import { getQueryParams, updateQueryParams } from './with-query-params.js';

export default (params) => $.page(() => {
  // Get initial query from URL
  const queryParams = getQueryParams();
  const searchQuery = $(queryParams.q || '');
  const page = $(parseInt(queryParams.page) || 1);
  const results = $([]);
  
  // Update URL when search changes
  $.effect(() => {
    updateQueryParams({
      q: searchQuery() || undefined,
      page: page() > 1 ? page() : undefined
    });
  });
  
  // Fetch results when search or page changes
  $.effect(() => {
    if (searchQuery()) {
      fetch(`/api/search?q=${searchQuery()}&page=${page()}`)
        .then(res => res.json())
        .then(data => results(data));
    }
  });
  
  return html`
    <div class="search-page">
      <h1>Search</h1>
      
      <input
        type="search"
        :value=${searchQuery}
        placeholder="Search..."
        @input=${(e) => {
          searchQuery(e.target.value);
          page(1); // Reset to first page on new search
        }}
      />
      
      <div class="results">
        ${results().map(item => html`
          <div class="result">${item.title}</div>
        `)}
      </div>
      
      ${() => results().length ? html`
        <div class="pagination">
          <button 
            ?disabled=${() => page() <= 1}
            @click=${() => page(p => p - 1)}
          >
            Previous
          </button>
          
          <span>Page ${page}</span>
          
          <button 
            ?disabled=${() => results().length < 10}
            @click=${() => page(p => p + 1)}
          >
            Next
          </button>
        </div>
      ` : ''}
    </div>
  `;
});
```

### Lazy Loading Routes

```javascript
// lazy.js
export const lazy = (loader) => {
  let component = null;
  
  return async (params) => {
    if (!component) {
      const module = await loader();
      component = module.default;
    }
    return component(params);
  };
};
```

```javascript
// main.js with lazy loading
import { $, html } from 'sigpro';
import { lazy } from './lazy.js';
import Layout from './Layout.js';

const routes = [
  { path: '/', component: lazy(() => import('./pages/Home.js')) },
  { path: '/about', component: lazy(() => import('./pages/About.js')) },
  { path: '/dashboard', component: lazy(() => import('./pages/Dashboard.js')) },
  { 
    path: '/admin', 
    component: lazy(() => import('./pages/Admin.js')),
    // Show loading state
    loading: () => html`<div class="loading">Loading admin panel...</div>`
  },
];

// Wrap with layout
const routesWithLayout = routes.map(route => ({
  ...route,
  component: (params) => Layout(route.component(params))
}));

document.body.appendChild($.router(routesWithLayout));
```

### Route Guards / Middleware

```javascript
// middleware.js
export const withGuard = (component, guard) => (params) => {
  const result = guard(params);
  if (result === true) {
    return component(params);
  } else if (typeof result === 'string') {
    $.router.go(result);
    return null;
  }
  return result; // Custom component (e.g., AccessDenied)
};

// Guards
export const roleGuard = (requiredRole) => (params) => {
  const userRole = localStorage.getItem('userRole');
  if (userRole === requiredRole) return true;
  if (!userRole) return '/login';
  return AccessDeniedPage(params);
};

export const authGuard = () => (params) => {
  const token = localStorage.getItem('token');
  return token ? true : '/login';
};

export const pendingChangesGuard = (hasPendingChanges) => (params) => {
  if (hasPendingChanges()) {
    return ConfirmLeavePage(params);
  }
  return true;
};
```

```javascript
// Usage
import { withGuard, authGuard, roleGuard } from './middleware.js';

const routes = [
  { path: '/', component: HomePage },
  { path: '/profile', component: withGuard(ProfilePage, authGuard()) },
  { 
    path: '/admin', 
    component: withGuard(AdminPage, roleGuard('admin')) 
  },
];
```

## 📊 Route Matching Priority

Routes are matched in the order they are defined. More specific routes should come first:

```javascript
const routes = [
  // More specific first
  { path: '/user/:id/edit', component: EditUserPage },
  { path: '/user/:id/posts', component: UserPostsPage },
  { path: '/user/:id', component: UserPage },
  
  // Static routes
  { path: '/about', component: AboutPage },
  { path: '/contact', component: ContactPage },
  
  // Catch-all last
  { path: '/:path(.*)', component: NotFoundPage },
];
```

## 🎯 Complete Example

```javascript
// main.js - Complete application
import { $, html } from 'sigpro';
import { lazy } from './utils/lazy.js';
import { withGuard, authGuard } from './utils/middleware.js';
import Layout from './components/Layout.js';

// Lazy load pages
const HomePage = lazy(() => import('./pages/Home.js'));
const AboutPage = lazy(() => import('./pages/About.js'));
const LoginPage = lazy(() => import('./pages/Login.js'));
const DashboardPage = lazy(() => import('./pages/Dashboard.js'));
const UserPage = lazy(() => import('./pages/User.js'));
const SettingsPage = lazy(() => import('./pages/Settings.js'));
const NotFoundPage = lazy(() => import('./pages/NotFound.js'));

// Route configuration
const routes = [
  { path: '/', component: HomePage, name: 'Home' },
  { path: '/about', component: AboutPage, name: 'About' },
  { path: '/login', component: LoginPage, name: 'Login' },
  { 
    path: '/dashboard', 
    component: withGuard(DashboardPage, authGuard()),
    name: 'Dashboard'
  },
  { 
    path: '/user/:id', 
    component: UserPage,
    name: 'User Profile'
  },
  { 
    path: '/settings/:section?', 
    component: withGuard(SettingsPage, authGuard()),
    name: 'Settings'
  },
  { path: '/:path(.*)', component: NotFoundPage, name: 'Not Found' },
];

// Wrap all routes with layout
const routesWithLayout = routes.map(route => ({
  ...route,
  component: (params) => Layout(route.component(params))
}));

// Create and mount router
const router = $.router(routesWithLayout);
document.body.appendChild(router);

// Navigation helper (available globally)
window.navigate = $.router.go;
```

## 📊 Summary

| Feature | Description |
|---------|-------------|
| **Hash-based** | Works everywhere, no server config |
| **Route Parameters** | `:param` syntax for dynamic segments |
| **RegExp Support** | Advanced pattern matching |
| **Query Parameters** | Support for `?key=value` in URLs |
| **Programmatic Navigation** | `$.router.go(path)` |
| **Auto-cleanup** | Works with `$.page` for memory management |
| **Zero Dependencies** | Pure vanilla JavaScript |
| **Lazy Loading Ready** | Easy code splitting |

---

> **Pro Tip:** Order matters in route definitions - put more specific routes (with parameters) before static ones, and always include a catch-all route (404) at the end.
