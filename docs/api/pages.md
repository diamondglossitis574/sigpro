# Pages API 📄

Pages in SigPro are special components designed for route-based navigation with **automatic cleanup**. When you navigate away from a page, all signals, effects, and event listeners created within that page are automatically cleaned up - no memory leaks, no manual cleanup needed.

## `$.page(setupFunction)`

Creates a page with automatic cleanup of all signals and effects when navigated away.

```javascript
import { $, html } from 'sigpro';

export default $.page(() => {
  // All signals and effects created here
  // will be automatically cleaned up on navigation
  const count = $(0);
  
  $.effect(() => {
    console.log(`Count: ${count()}`);
  });
  
  return html`
    <div>
      <h1>My Page</h1>
      <p>Count: ${count}</p>
      <button @click=${() => count(c => c + 1)}>+</button>
    </div>
  `;
});
```

## 📋 API Reference

| Parameter | Type | Description |
|-----------|------|-------------|
| `setupFunction` | `Function` | Function that returns the page content. Receives context object with `params` and `onUnmount` |

### Context Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `params` | `Object` | Route parameters passed to the page |
| `onUnmount` | `Function` | Register cleanup callbacks (alternative to automatic cleanup) |

## 🎯 Basic Usage

### Simple Page

```javascript
// pages/home.js
import { $, html } from 'sigpro';

export default $.page(() => {
  const title = $('Welcome to SigPro');
  
  return html`
    <div class="home-page">
      <h1>${title}</h1>
      <p>This page will clean itself up when you navigate away.</p>
    </div>
  `;
});
```

### Page with Route Parameters

```javascript
// pages/user.js
import { $, html } from 'sigpro';

export default $.page(({ params }) => {
  // Access route parameters
  const userId = params.id;
  const userData = $(null);
  const loading = $(false);
  
  // Auto-cleaned effect
  $.effect(() => {
    loading(true);
    $.fetch(`/api/users/${userId}`, null, loading)
      .then(data => userData(data));
  });
  
  return html`
    <div>
      ${() => loading() ? html`
        <div class="spinner">Loading...</div>
      ` : html`
        <h1>User Profile: ${userData()?.name}</h1>
        <p>Email: ${userData()?.email}</p>
      `}
    </div>
  `;
});
```

## 🧹 Automatic Cleanup

The magic of `$.page` is automatic cleanup. Everything created inside the page is tracked and cleaned up:

```javascript
export default $.page(() => {
  // ✅ Signals are auto-cleaned
  const count = $(0);
  const user = $(null);
  
  // ✅ Effects are auto-cleaned
  $.effect(() => {
    document.title = `Count: ${count()}`;
  });
  
  // ✅ Event listeners are auto-cleaned
  window.addEventListener('resize', handleResize);
  
  // ✅ Intervals and timeouts are auto-cleaned
  const interval = setInterval(() => {
    refreshData();
  }, 5000);
  
  return html`<div>Page content</div>`;
});
// When navigating away: all signals, effects, listeners, intervals STOP
```

## 📝 Manual Cleanup with `onUnmount`

Sometimes you need custom cleanup logic. Use `onUnmount` for that:

```javascript
export default $.page(({ onUnmount }) => {
  // WebSocket connection
  const socket = new WebSocket('wss://api.example.com');
  
  socket.onmessage = (event) => {
    updateData(JSON.parse(event.data));
  };
  
  // Manual cleanup
  onUnmount(() => {
    socket.close();
    console.log('WebSocket closed');
  });
  
  return html`<div>Real-time updates</div>`;
});
```

## 🔄 Integration with Router

Pages are designed to work seamlessly with `$.router`:

```javascript
import { $, html } from 'sigpro';
import HomePage from './pages/Home.js';
import UserPage from './pages/User.js';
import SettingsPage from './pages/Settings.js';

const routes = [
  { path: '/', component: HomePage },
  { path: '/user/:id', component: UserPage },
  { path: '/settings', component: SettingsPage },
];

// Mount router
document.body.appendChild($.router(routes));
```

## 💡 Practical Examples

### Example 1: Data Fetching Page

```javascript
// pages/posts.js
export default $.page(({ params }) => {
  const posts = $([]);
  const loading = $(true);
  const error = $(null);
  
  $.effect(() => {
    fetch('/api/posts')
      .then(res => res.json())
      .then(data => {
        posts(data);
        loading(false);
      })
      .catch(err => {
        error(err.message);
        loading(false);
      });
  });
  
  return html`
    <div class="posts-page">
      <h1>Blog Posts</h1>
      
      ${() => loading() ? html`
        <div class="loading">Loading posts...</div>
      ` : error() ? html`
        <div class="error">Error: ${error()}</div>
      ` : html`
        <div class="posts-grid">
          ${posts().map(post => html`
            <article class="post-card">
              <h2>${post.title}</h2>
              <p>${post.excerpt}</p>
              <a href="#/post/${post.id}">Read more</a>
            </article>
          `)}
        </div>
      `}
    </div>
  `;
});
```

### Example 2: Real-time Dashboard

```javascript
// pages/dashboard.js
export default $.page(({ onUnmount }) => {
  const metrics = $({
    cpu: 0,
    memory: 0,
    requests: 0
  });
  
  // Auto-refresh data
  const refreshInterval = setInterval(async () => {
    const data = await $.fetch('/api/metrics');
    if (data) metrics(data);
  }, 5000);
  
  // Manual cleanup for interval
  onUnmount(() => clearInterval(refreshInterval));
  
  // Live clock
  const currentTime = $(new Date());
  const clockInterval = setInterval(() => {
    currentTime(new Date());
  }, 1000);
  
  onUnmount(() => clearInterval(clockInterval));
  
  return html`
    <div class="dashboard">
      <h1>System Dashboard</h1>
      
      <div class="time">
        Last updated: ${() => currentTime().toLocaleTimeString()}
      </div>
      
      <div class="metrics-grid">
        <div class="metric-card">
          <h3>CPU Usage</h3>
          <p class="metric-value">${() => metrics().cpu}%</p>
        </div>
        <div class="metric-card">
          <h3>Memory Usage</h3>
          <p class="metric-value">${() => metrics().memory}%</p>
        </div>
        <div class="metric-card">
          <h3>Requests/min</h3>
          <p class="metric-value">${() => metrics().requests}</p>
        </div>
      </div>
    </div>
  `;
});
```

### Example 3: Multi-step Form

```javascript
// pages/checkout.js
export default $.page(({ onUnmount }) => {
  const step = $(1);
  const formData = $({
    email: '',
    address: '',
    payment: ''
  });
  
  // Warn user before leaving
  const handleBeforeUnload = (e) => {
    if (step() < 3) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  onUnmount(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });
  
  const nextStep = () => step(s => Math.min(s + 1, 3));
  const prevStep = () => step(s => Math.max(s - 1, 1));
  
  return html`
    <div class="checkout">
      <h1>Checkout - Step ${step} of 3</h1>
      
      ${() => {
        switch(step()) {
          case 1:
            return html`
              <div class="step">
                <h2>Email</h2>
                <input 
                  type="email" 
                  :value=${() => formData().email}
                  @input=${(e) => formData({...formData(), email: e.target.value})}
                />
              </div>
            `;
          case 2:
            return html`
              <div class="step">
                <h2>Address</h2>
                <textarea 
                  :value=${() => formData().address}
                  @input=${(e) => formData({...formData(), address: e.target.value})}
                ></textarea>
              </div>
            `;
          case 3:
            return html`
              <div class="step">
                <h2>Payment</h2>
                <input 
                  type="text" 
                  placeholder="Card number"
                  :value=${() => formData().payment}
                  @input=${(e) => formData({...formData(), payment: e.target.value})}
                />
              </div>
            `;
        }
      }}
      
      <div class="buttons">
        ${() => step() > 1 ? html`
          <button @click=${prevStep}>Previous</button>
        ` : ''}
        
        ${() => step() < 3 ? html`
          <button @click=${nextStep}>Next</button>
        ` : html`
          <button @click=${submitOrder}>Place Order</button>
        `}
      </div>
    </div>
  `;
});
```

### Example 4: Page with Tabs

```javascript
// pages/profile.js
export default $.page(({ params }) => {
  const activeTab = $('overview');
  const userData = $(null);
  
  // Load user data
  $.effect(() => {
    $.fetch(`/api/users/${params.id}`)
      .then(data => userData(data));
  });
  
  const tabs = {
    overview: () => html`
      <div>
        <h3>Overview</h3>
        <p>Username: ${userData()?.username}</p>
        <p>Member since: ${userData()?.joined}</p>
      </div>
    `,
    posts: () => html`
      <div>
        <h3>Posts</h3>
        ${userData()?.posts.map(post => html`
          <div class="post">${post.title}</div>
        `)}
      </div>
    `,
    settings: () => html`
      <div>
        <h3>Settings</h3>
        <label>
          <input type="checkbox" :checked=${userData()?.emailNotifications} />
          Email notifications
        </label>
      </div>
    `
  };
  
  return html`
    <div class="profile-page">
      <h1>${() => userData()?.name}</h1>
      
      <div class="tabs">
        ${Object.keys(tabs).map(tab => html`
          <button 
            class:active=${() => activeTab() === tab}
            @click=${() => activeTab(tab)}
          >
            ${tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        `)}
      </div>
      
      <div class="tab-content">
        ${() => tabs[activeTab()]()}
      </div>
    </div>
  `;
});
```

## 🎯 Advanced Patterns

### Page with Nested Routes

```javascript
// pages/settings/index.js
export default $.page(({ params }) => {
  const section = params.section || 'general';
  
  const sections = {
    general: () => import('./general.js').then(m => m.default),
    security: () => import('./security.js').then(m => m.default),
    notifications: () => import('./notifications.js').then(m => m.default)
  };
  
  const currentSection = $(null);
  
  $.effect(() => {
    sections[section]().then(comp => currentSection(comp));
  });
  
  return html`
    <div class="settings">
      <nav>
        <a href="#/settings/general">General</a>
        <a href="#/settings/security">Security</a>
        <a href="#/settings/notifications">Notifications</a>
      </nav>
      
      <div class="content">
        ${currentSection}
      </div>
    </div>
  `;
});
```

### Page with Authentication

```javascript
// pages/dashboard.js
export default $.page(({ onUnmount }) => {
  const isAuthenticated = $(false);
  const authCheck = $.effect(() => {
    const token = localStorage.getItem('token');
    isAuthenticated(!!token);
  });
  
  // Redirect if not authenticated
  $.effect(() => {
    if (!isAuthenticated()) {
      $.router.go('/login');
    }
  });
  
  return html`
    <div class="dashboard">
      <h1>Protected Dashboard</h1>
      <!-- Protected content -->
    </div>
  `;
});
```

## 📊 Summary

| Feature | Description |
|---------|-------------|
| **Automatic Cleanup** | All signals, effects, and resources auto-cleaned on navigation |
| **Memory Safe** | No memory leaks, even with complex nested effects |
| **Router Integration** | Designed to work perfectly with `$.router` |
| **Parameters** | Access route parameters via `params` object |
| **Manual Cleanup** | `onUnmount` for custom cleanup needs |
| **Zero Configuration** | Just wrap your page in `$.page()` and it works |

---

> **Pro Tip:** Always wrap route-based views in `$.page()` to ensure proper cleanup. This prevents memory leaks and ensures your app stays performant even after many navigation changes.