# Quick API Reference ⚡

A comprehensive reference for all SigPro APIs. Everything you need to build reactive web applications with signals and web components.

## 📋 API Functions Reference

| Function | Description | Example |
|----------|-------------|---------|
| **`$(initialValue)`** | Creates a reactive signal (getter/setter) | `const count = $(0)` |
| **`$(computedFn)`** | Creates a computed signal | `const full = $(() => first() + last())` |
| **`$.effect(fn)`** | Runs effect when dependencies change | `$.effect(() => console.log(count()))` |
| **`$.page(setupFn)`** | Creates a page with automatic cleanup | `$.page(() => html`<div>Page</div>`)` |
| **`$.component(tagName, setupFn, attrs, useShadow)`** | Creates reactive Web Component | `$.component('my-menu', setup, ['items'])` |
| **`$.router(routes)`** | Creates a hash-based router | `$.router([{path:'/', component:Home}])` |
| **`$.router.go(path)`** | Navigates to a route | `$.router.go('/user/42')` |
| **`$.fetch(url, data, loadingSignal)`** | Fetch wrapper with loading state | `const data = await $.fetch('/api', data, loading)` |
| **`$.storage(key, initialValue, storageType)`** | Persistent signal (local/sessionStorage) | `const theme = $.storage('theme', 'light')` |
| **`` html`...` ``** | Template literal for reactive HTML | `` html`<div>${count}</div>` `` |

### Signal Methods

| Method | Description | Example |
|--------|-------------|---------|
| **`signal()`** | Gets current value | `count()` |
| **`signal(newValue)`** | Sets new value | `count(5)` |
| **`signal(prev => new)`** | Updates using previous value | `count(c => c + 1)` |

### Component Context Properties

| Property | Description | Example |
|----------|-------------|---------|
| **`props`** | Reactive component properties | `props.title()` |
| **`slot(name)`** | Accesses slot content | `slot()` or `slot('footer')` |
| **`emit(event, data)`** | Dispatches custom event | `emit('update', value)` |
| **`onUnmount(cb)`** | Registers cleanup callback | `onUnmount(() => clearInterval(timer))` |

### Page Context Properties

| Property | Description | Example |
|----------|-------------|---------|
| **`params`** | Route parameters | `params.id`, `params.slug` |
| **`onUnmount(cb)`** | Registers cleanup callback | `onUnmount(() => clearInterval(timer))` |

### HTML Directives

| Directive | Description | Example |
|-----------|-------------|---------|
| **`@event`** | Event listener | `` @click=${handler} `` |
| **`:property`** | Two-way binding | `` :value=${signal} `` |
| **`?attribute`** | Boolean attribute | `` ?disabled=${signal} `` |
| **`.property`** | DOM property binding | `` .scrollTop=${value} `` |
| **`class:name`** | Conditional class | `` class:active=${isActive} `` |

<style>
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

th {
  background-color: var(--vp-c-bg-soft);
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

tr:hover {
  background-color: var(--vp-c-bg-soft);
}

code {
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 4px;
  background-color: var(--vp-c-bg-mute);
}
</style>


## 📡 Signals - `$(initialValue)`

Creates a reactive value that notifies dependents when changed.

| Pattern | Example | Description |
|---------|---------|-------------|
| **Basic Signal** | `const count = $(0)` | Create signal with initial value |
| **Getter** | `count()` | Read current value |
| **Setter** | `count(5)` | Set new value directly |
| **Updater** | `count(prev => prev + 1)` | Update based on previous value |
| **Computed** | `const full = $(() => first() + last())` | Auto-updating derived signal |

### Examples

```javascript
// Basic signal
const count = $(0);
console.log(count()); // 0
count(5);
count(c => c + 1); // 6

// Computed signal
const firstName = $('John');
const lastName = $('Doe');
const fullName = $(() => `${firstName()} ${lastName()}`);
console.log(fullName()); // "John Doe"
firstName('Jane'); // fullName auto-updates to "Jane Doe"
```

## 🔄 Effects - `$.effect(fn)`

Executes a function and automatically re-runs when its dependencies change.

| Pattern | Example | Description |
|---------|---------|-------------|
| **Basic Effect** | `$.effect(() => console.log(count()))` | Run effect on dependency changes |
| **Cleanup** | `$.effect(() => { timer = setInterval(...); return () => clearInterval(timer) })` | Return cleanup function |
| **Stop Effect** | `const stop = $.effect(...); stop()` | Manually stop an effect |

### Examples

```javascript
// Auto-running effect
const count = $(0);
$.effect(() => {
  console.log(`Count is: ${count()}`);
}); // Logs immediately and whenever count changes

// Effect with cleanup
const userId = $(1);
$.effect(() => {
  const id = userId();
  const timer = setInterval(() => fetchUser(id), 5000);
  return () => clearInterval(timer); // Cleanup before re-run
});
```

## 📄 Pages - `$.page(setupFunction)`

Creates a page with automatic cleanup of all signals and effects when navigated away.

```javascript
// pages/about.js
import { $, html } from 'sigpro';

export default $.page(() => {
  const count = $(0);
  
  // Auto-cleaned on navigation
  $.effect(() => {
    document.title = `Count: ${count()}`;
  });
  
  return html`
    <div>
      <h1>About Page</h1>
      <p>Count: ${count}</p>
      <button @click=${() => count(c => c + 1)}>+</button>
    </div>
  `;
});
```

### With Parameters

```javascript
export default $.page(({ params, onUnmount }) => {
  const userId = params.id;
  
  // Manual cleanup if needed
  const interval = setInterval(() => refresh(), 10000);
  onUnmount(() => clearInterval(interval));
  
  return html`<div>User: ${userId}</div>`;
});
```

## 🧩 Components - `$.component(tagName, setup, observedAttributes, useShadowDOM)`

Creates Custom Elements with reactive properties.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tagName` | `string` | required | Custom element tag (must include hyphen) |
| `setupFunction` | `Function` | required | Function that renders the component |
| `observedAttributes` | `string[]` | `[]` | Attributes to observe for changes |
| `useShadowDOM` | `boolean` | `false` | `true` = Shadow DOM (encapsulated), `false` = Light DOM |

### Light DOM Example (Default)

```javascript
// button.js - inherits global styles
$.component('my-button', (props, { slot, emit }) => {
  return html`
    <button 
      class="px-4 py-2 bg-blue-500 text-white rounded"
      @click=${() => emit('click')}
    >
      ${slot()}
    </button>
  `;
}, ['variant']); // Observe 'variant' attribute
```

### Shadow DOM Example

```javascript
// calendar.js - encapsulated styles
$.component('my-calendar', (props) => {
  return html`
    <style>
      /* These styles are isolated */
      .calendar {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
    </style>
    <div class="calendar">
      ${renderCalendar(props.date())}
    </div>
  `;
}, ['date'], true); // true = use Shadow DOM
```

## 🌐 Router - `$.router(routes)`

Creates a hash-based router with automatic page cleanup.

### Route Definition

```javascript
const routes = [
  // Simple routes
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  
  // Routes with parameters
  { path: '/user/:id', component: UserPage },
  { path: '/user/:id/posts/:pid', component: PostPage },
  
  // RegExp routes for advanced matching
  { path: /^\/posts\/(?<id>\d+)$/, component: PostPage },
];
```

### Usage

```javascript
import { $, html } from 'sigpro';
import Home from './pages/Home.js';
import User from './pages/User.js';

const router = $.router([
  { path: '/', component: Home },
  { path: '/user/:id', component: User },
]);

// Navigation
$.router.go('/user/42');
$.router.go('about'); // Same as '/about'

// In templates
html`
  <nav>
    <a href="#/">Home</a>
    <a href="#/user/42">Profile</a>
    <button @click=${() => $.router.go('/contact')}>
      Contact
    </button>
  </nav>
`;
```

## 📦 Storage - `$.storage(key, initialValue, [storage])`

Persistent signal that syncs with localStorage or sessionStorage.

```javascript
// localStorage (default)
const theme = $.storage('theme', 'light');
const user = $.storage('user', null);
const settings = $.storage('settings', { notifications: true });

// sessionStorage
const tempData = $.storage('temp', {}, sessionStorage);

// Usage like a normal signal
theme('dark'); // Auto-saves to localStorage
console.log(theme()); // 'dark' (even after page refresh)
```

## 🌐 Fetch - `$.fetch(url, data, [loading])`

Simple fetch wrapper with automatic JSON handling.

```javascript
const loading = $(false);

async function loadUser(id) {
  const user = await $.fetch(`/api/users/${id}`, null, loading);
  if (user) userData(user);
}

// In template
html`
  <div>
    ${() => loading() ? html`<spinner></spinner>` : html`
      <p>${userData()?.name}</p>
    `}
  </div>
`;
```

## 🎨 Template Literals - `` html`...` ``

Creates reactive DOM fragments with directives.

### Directives Reference

| Directive | Example | Description |
|-----------|---------|-------------|
| **Event** | `@click=${handler}` | Add event listener |
| **Two-way binding** | `:value=${signal}` | Bind signal to input value |
| **Boolean attribute** | `?disabled=${signal}` | Toggle boolean attribute |
| **Property** | `.scrollTop=${value}` | Set DOM property directly |
| **Class toggle** | `class:active=${isActive}` | Toggle class conditionally |

### Examples

```javascript
const text = $('');
const isDisabled = $(false);
const activeTab = $('home');

html`
  <!-- Event binding -->
  <button @click=${() => count(c => c + 1)}>+</button>
  
  <!-- Two-way binding -->
  <input :value=${text} />
  <p>You typed: ${text}</p>
  
  <!-- Boolean attributes -->
  <button ?disabled=${isDisabled}>Submit</button>
  
  <!-- Class toggles -->
  <div class:active=${activeTab() === 'home'}>
    Home content
  </div>
  
  <!-- Property binding -->
  <div .scrollTop=${scrollPosition}></div>
`;
```

## 🎯 Complete Component Example

```javascript
import { $, html } from 'sigpro';

// Create a component
$.component('user-profile', (props, { slot, emit }) => {
  // Reactive state
  const user = $(null);
  const loading = $(false);
  
  // Load user data when userId changes
  $.effect(() => {
    const id = props.userId();
    if (id) {
      loading(true);
      $.fetch(`/api/users/${id}`, null, loading)
        .then(data => user(data));
    }
  });
  
  // Computed value
  const fullName = $(() => 
    user() ? `${user().firstName} ${user().lastName}` : ''
  );
  
  // Template
  return html`
    <div class="user-profile">
      ${() => loading() ? html`
        <div class="spinner">Loading...</div>
      ` : user() ? html`
        <h2>${fullName}</h2>
        <p>Email: ${user().email}</p>
        <button @click=${() => emit('select', user())}>
          ${slot('Select')}
        </button>
      ` : html`
        <p>User not found</p>
      `}
    </div>
  `;
}, ['user-id']); // Observe userId attribute
```

<style>
table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
}

th {
  background-color: var(--vp-c-bg-soft);
  padding: 0.75rem;
  text-align: left;
}

td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

tr:hover {
  background-color: var(--vp-c-bg-soft);
}

code {
  font-size: 0.9em;
  padding: 0.2em 0.4em;
  border-radius: 4px;
}
</style>
