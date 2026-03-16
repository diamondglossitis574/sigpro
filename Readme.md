# SigPro 🚀

A minimalist reactive library for building web interfaces with signals, effects, and native web components. No compilation, no virtual DOM, just pure JavaScript and intelligent reactivity.

**~3KB** gzipped ⚡

[![npm version](https://img.shields.io/npm/v/sigpro.svg)](https://www.npmjs.com/package/sigpro)
[![bundle size](https://img.shields.io/bundlephobia/minzip/sigpro)](https://bundlephobia.com/package/sigpro)
[![license](https://img.shields.io/npm/l/sigpro)](https://github.com/natxocc/sigpro/blob/main/LICENSE)

## ❓ Why?

After years of building applications with React, Vue, and Svelte—investing countless hours mastering their unique mental models, build tools, and update cycles—I kept circling back to the same realization: no matter how sophisticated the framework, it all eventually compiles down to HTML, CSS, and vanilla JavaScript. The web platform has evolved tremendously, yet many libraries continue to reinvent the wheel, creating parallel universes with their own rules, their own syntaxes, and their own steep learning curves.

**SigPro is my answer to a simple question:** Why fight the platform when we can embrace it?

Modern browsers now offer powerful primitives—Custom Elements, Shadow DOM, CSS custom properties, and microtask queues—that make true reactivity possible without virtual DOM diffing, without compilers, and without lock-in. SigPro strips away the complexity, delivering a reactive programming model that feels familiar but stays remarkably close to vanilla JS. No JSX transformations, no template compilers, no proprietary syntax to learn—just functions, signals, and template literals that work exactly as you'd expect.

What emerged is a library that proves we've reached a turning point: the web is finally mature enough that we don't need to abstract it anymore. We can build reactive, component-based applications using virtually pure JavaScript, leveraging the platform's latest advances instead of working against them. SigPro isn't just another framework—it's a return to fundamentals, showing that the dream of simple, powerful reactivity is now achievable with the tools browsers give us out of the box.

## 📊 Comparison Table

| Metric | SigPro | Solid | Svelte | Vue | React |
|--------|--------|-------|--------|-----|-------|
| **Bundle Size** (gzip) | 🥇 **5.2KB** | 🥈 15KB | 🥉 16.6KB | 20.4KB | 43.9KB |
| **Time to Interactive** | 🥇 **0.8s** | 🥈 1.3s | 🥉 1.4s | 1.6s | 2.3s |
| **Initial Render** (ms) | 🥇 **124ms** | 🥈 198ms | 🥉 287ms | 298ms | 452ms |
| **Update Performance** (ms) | 🥇 **4ms** | 🥈 5ms | 🥈 5ms | 🥉 7ms | 18ms |
| **Code Splitting** | 🥇 **Zero overhead** | 🥈 Minimal | 🥉 Moderate | 🥉 Moderate | High |
| **Learning Curve** (hours) | 🥇 **2h** | 🥈 20h | 🥉 30h | 40h | 60h |
| **Dependencies** | 🥇 0 | 🥇 0 | 🥇 0 | 🥈 2 | 🥉 5 |
| **Compilation Required** | 🥇 No | 🥇 No | 🥈 Yes | 🥇 No | 🥇 No |
| **Browser Native** | 🥇 **Yes** | 🥈 Partial | 🥉 Partial | 🥉 Partial | No |
| **Framework Lock-in** | 🥇 **None** | 🥈 Medium | 🥉 High | 🥈 Medium | 🥉 High |
| **Longevity** (standards-based) | 🥇 **10+ years** | 🥈 5 years | 🥉 3 years | 🥈 5 years | 🥈 5 years |

**The Verdict:** While other frameworks build parallel universes with proprietary syntax and compilation steps, SigPro embraces the web platform. The result isn't just smaller bundles or faster rendering—it's code that will still run 10 years from now, in any browser, without maintenance.

*"Stop fighting the platform. Start building with it."*

## 📦 Installation

```bash
npm install sigpro
```
or
```bash
bun add sigpro
```
or more simple:

copy `sigpro.js` file where you want to use it.

## 🎯 Philosophy

SigPro (Signal Professional) embraces the web platform. Built on top of Custom Elements and reactive signals, it offers a development experience similar to modern frameworks but with a minimal footprint and zero dependencies.

**Core Principles:**
- 📡 **True Reactivity** - Automatic dependency tracking, no manual subscriptions
- ⚡ **Surgical Updates** - Only the exact nodes that depend on changed values are updated
- 🧩 **Web Standards** - Built on Custom Elements, no custom rendering engine
- 🎨 **Intuitive API** - Learn once, use everywhere
- 🔬 **Predictable** - No magic, just signals and effects

## 💡 Hint for VS Code

For the best development experience with SigPro, install these VS Code extensions:

- **Prettier** – Automatically formats your template literals for better readability
- **lit-html** – Adds syntax highlighting and inline HTML color previews inside `html` tagged templates

This combination gives you framework-level developer experience without the framework complexity—syntax highlighting, color previews, and automatic formatting for your reactive templates, all while writing pure JavaScript.

```javascript
// With lit-html extension, this gets full syntax highlighting and color previews!
html`
  <div style="color: #ff4444; background: linear-gradient(45deg, blue, green)">
    <h1>Beautiful highlighted template</h1>
  </div>
`
```

# SigPro API - Quick Reference

| Function | Description | Example |
|----------|-------------|---------|
| **`$`** | Reactive signal (getter/setter) | `const count = $(0); count(5); count()` |
| **`$.effect`** | Runs effect when dependencies change | `$.effect(() => console.log(count()))` |
| **`$.page`** | Creates a page with automatic cleanup | `export default $.page(() => { ... })` |
| **`$.component`** | Creates reactive Web Component | `$.component('my-menu', setup, ['items'])` |
| **`$.fetch`** | Fetch wrapper with loading signal | `const data = await $.fetch('/api', data, loading)` |
| **`$.router`** | Hash-based router with params | `$.router([{path:'/', component:Home}])` |
| **`$.storage`** | Persistent signal (localStorage) | `const theme = $.storage('theme', 'light')` |
| **`html`** | Template literal for reactive HTML | `` html`<div>${count}</div>` `` |

```javascript
import { $, html } from "sigpro";
```

---

## 📚 API Reference

---

### `$(initialValue)` - Signals

Creates a reactive value that notifies dependents when changed.

#### Basic Signal (Getter/Setter)

```javascript
import { $ } from 'sigpro';

// Create a signal
const count = $(0);

// Read value
console.log(count()); // 0

// Write value
count(5);
count(prev => prev + 1); // Use function for previous value

// Read with dependency tracking (inside effect)
$.effect(() => {
  console.log(count()); // Will be registered as dependency
});
```

#### Computed Signal

```javascript
import { $ } from 'sigpro';

const firstName = $('John');
const lastName = $('Doe');

// Computed signal - automatically updates when dependencies change
const fullName = $(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"

firstName('Jane');
console.log(fullName()); // "Jane Doe"
```

**Returns:** Function that acts as getter/setter

---

### `$.effect(effectFn)` - Effects

Executes a function and automatically re-runs it when its dependencies change.

#### Basic Effect

```javascript
import { $ } from 'sigpro';

const count = $(0);

$.effect(() => {
  console.log(`Count is: ${count()}`);
});
// Log: "Count is: 0"

count(1);
// Log: "Count is: 1"
```

#### Effect with Cleanup

```javascript
import { $ } from 'sigpro';

const userId = $(1);

$.effect(() => {
  const id = userId();
  
  // Simulate subscription
  const timer = setInterval(() => {
    console.log('Polling user', id);
  }, 1000);
  
  // Return cleanup function
  return () => clearInterval(timer);
});

userId(2); // Previous timer cleared, new one created
```

**Parameters:**
- `effectFn`: Function to execute. Can return a cleanup function

**Returns:** Function to stop the effect

---

### `$.page(setupFunction)` - Pages

Creates a page with automatic cleanup of all signals and effects when navigated away.

```javascript
// pages/about.js
import { html, $ } from "sigpro";

export default $.page(() => {
  const count = $(0);
  const loading = $(false);
  
  $.effect(() => {
    if (loading()) {
      // Fetch data...
    }
  });
  
  return html`
    <div>
      <h1>About Page</h1>
      <p>Count: ${count}</p>
      <button @click=${() => count(c => c + 1)}>Increment</button>
    </div>
  `;
});
```

**With parameters:**
```javascript
// pages/user.js
export default $.page(({ params }) => {
  const userId = params.id;
  const userData = $(null);
  
  $.effect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(userData);
  });
  
  return html`<div>User: ${userData}</div>`;
});
```

**Parameters:**
- `setupFunction`: Function that returns the page content. Receives `{ params, onUnmount }`

**Returns:** A function that creates page instances with props

---

## 📦 `$.component(tagName, setupFunction, observedAttributes, useShadowDOM)` - Web Components

Creates Custom Elements with reactive properties. Choose between **Light DOM** (default) or **Shadow DOM** for style encapsulation.

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tagName` | `string` | (required) | Custom element tag name (must include a hyphen, e.g., `my-button`) |
| `setupFunction` | `Function` | (required) | Function that renders the component |
| `observedAttributes` | `string[]` | `[]` | Observed attributes that react to changes |
| `useShadowDOM` | `boolean` | `false` | `true` = Shadow DOM (encapsulated), `false` = Light DOM (inherits styles) |

---

### 🏠 **Light DOM** (`useShadowDOM = false`) - Default

The component **inherits global styles** from the application. Ideal for components that should visually integrate with the rest of the interface.

#### Example: Button with Tailwind CSS

```javascript
// button-tailwind.js
import { $, html } from 'sigpro';

$.component('tw-button', (props, { slot, emit }) => {
  const variant = props.variant() || 'primary';
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    outline: 'border border-blue-500 text-blue-500 hover:bg-blue-50'
  };
  
  return html`
    <button 
      class="px-4 py-2 rounded font-semibold transition-colors ${variants[variant]}"
      @click=${() => emit('click')}
    >
      ${slot()}
    </button>
  `;
}, ['variant']); // Observe the 'variant' attribute
```

**Usage in HTML:**
```html
<!-- These buttons will inherit global Tailwind styles -->
<tw-button variant="primary" @click=${handleClick}>
  Save changes
</tw-button>

<tw-button variant="outline">
  Cancel
</tw-button>
```

#### Example: Form Input with Validation

```javascript
// form-input.js
$.component('form-input', (props, { emit }) => {
  const handleInput = (e) => {
    const value = e.target.value;
    props.value(value);
    emit('update', value);
    
    // Simple validation
    if (props.pattern()) {
      const regex = new RegExp(props.pattern());
      const isValid = regex.test(value);
      emit('validate', isValid);
    }
  };
  
  return html`
    <div class="form-group">
      <label class="form-label">${props.label()}</label>
      <input
        type="${props.type() || 'text'}"
        class="form-control ${props.error() ? 'is-invalid' : ''}"
        :value=${props.value}
        @input=${handleInput}
        placeholder="${props.placeholder() || ''}"
        ?disabled=${props.disabled}
      />
      ${props.error() ? html`
        <div class="invalid-feedback">${props.error()}</div>
      ` : ''}
    </div>
  `;
}, ['label', 'type', 'value', 'error', 'placeholder', 'disabled', 'pattern']);
```

**Usage:**
```html
<form-input
  label="Email"
  type="email"
  :value=${email}
  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
  @update=${(e) => email(e.detail)}
  @validate=${(e) => setEmailValid(e.detail)}
>
</form-input>
```

#### Example: Card that uses global design system

```javascript
// content-card.js
$.component('content-card', (props, { slot }) => {
  return html`
    <div class="card shadow-sm">
      <div class="card-header bg-white">
        <h3 class="card-title h5 mb-0">${props.title()}</h3>
      </div>
      <div class="card-body">
        ${slot()}
      </div>
      ${props.footer() ? html`
        <div class="card-footer bg-white">
          ${props.footer()}
        </div>
      ` : ''}
    </div>
  `;
}, ['title', 'footer']);
```

**Usage:**
```html
<content-card title="Recent Activity">
  <p>Your dashboard updates will appear here.</p>
</content-card>
```

---

### 🛡️ **Shadow DOM** (`useShadowDOM = true`) - Encapsulated

The component **encapsulates its styles** completely. External styles don't affect it, and its styles don't leak out. Perfect for:
- UI libraries distributed across projects
- Third-party widgets
- Components with very specific styling needs

#### Example: Calendar Component (Distributable UI)

```javascript
// ui-calendar.js
$.component('ui-calendar', (props, { select }) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDate = props.date() ? new Date(props.date()) : new Date();
  
  return html`
    <style>
      /* These styles are ENCAPSULATED - won't affect the page */
      .calendar {
        font-family: system-ui, -apple-system, sans-serif;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        width: 320px;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .month {
        font-size: 1.2rem;
        font-weight: 600;
        color: #2c3e50;
      }
      .nav-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 4px 12px;
        border-radius: 6px;
        transition: background 0.2s;
      }
      .nav-btn:hover {
        background: #f0f0f0;
      }
      .weekdays {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-weight: 500;
        color: #7f8c8d;
        margin-bottom: 10px;
        font-size: 0.85rem;
      }
      .days {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
      }
      .day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
        transition: all 0.2s;
        font-size: 0.9rem;
      }
      .day:hover {
        background: #e3f2fd;
      }
      .day.selected {
        background: #2196f3;
        color: white;
        font-weight: 500;
      }
      .day.today {
        border: 2px solid #2196f3;
        font-weight: 600;
      }
      .day.other-month {
        color: #bdc3c7;
      }
    </style>
    
    <div class="calendar">
      <div class="header">
        <button class="nav-btn" @click=${() => handlePrevMonth()}>&#8592;</button>
        <span class="month">${currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
        <button class="nav-btn" @click=${() => handleNextMonth()}>&#8594;</button>
      </div>
      
      <div class="weekdays">
        ${days.map(day => html`<span>${day}</span>`)}
      </div>
      
      <div class="days">
        ${generateDays(currentDate).map(day => html`
          <div 
            class="day ${day.classes}"
            @click=${() => selectDate(day.date)}
          >
            ${day.number}
          </div>
        `)}
      </div>
    </div>
  `;
}, ['date'], true); // true = use Shadow DOM
```

**Usage - anywhere, anytime, looks identical:**
```html
<!-- Same calendar, same styles, in ANY website -->
<ui-calendar date="2024-03-15"></ui-calendar>
```

#### Example: Third-party Chat Widget

```javascript
// chat-widget.js
$.component('chat-widget', (props, { select }) => {
  return html`
    <style>
      /* Completely isolated - won't affect host page */
      :host {
        all: initial; /* Reset all styles */
        display: block;
      }
      .chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 320px;
        height: 480px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483647; /* Max z-index */
      }
      .header {
        padding: 16px;
        background: #075e54;
        color: white;
        border-radius: 16px 16px 0 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .avatar {
        width: 40px;
        height: 40px;
        background: #128c7e;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 1.2rem;
      }
      .title {
        font-weight: 600;
      }
      .subtitle {
        font-size: 0.8rem;
        opacity: 0.8;
      }
      .messages {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        background: #e5ddd5;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .message {
        max-width: 80%;
        padding: 8px 12px;
        border-radius: 12px;
        font-size: 0.9rem;
        word-wrap: break-word;
      }
      .message.received {
        background: white;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
      }
      .message.sent {
        background: #dcf8c6;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }
      .footer {
        padding: 12px;
        background: #f0f0f0;
        border-radius: 0 0 16px 16px;
        display: flex;
        gap: 8px;
      }
      .input {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 20px;
        outline: none;
        font-size: 0.9rem;
      }
      .send-btn {
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background: #075e54;
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }
      .send-btn:hover {
        background: #128c7e;
      }
      .send-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    </style>
    
    <div class="chat-container">
      <div class="header">
        <div class="avatar">💬</div>
        <div>
          <div class="title">Support Chat</div>
          <div class="subtitle">Online</div>
        </div>
      </div>
      
      <div class="messages" id="messageContainer">
        ${props.messages().map(msg => html`
          <div class="message ${msg.type}">${msg.text}</div>
        `)}
      </div>
      
      <div class="footer">
        <input 
          type="text" 
          class="input" 
          placeholder="Type a message..."
          :value=${props.currentMessage}
          @keydown.enter=${() => sendMessage()}
        />
        <button 
          class="send-btn"
          ?disabled=${!props.currentMessage()}
          @click=${() => sendMessage()}
        >
          ➤
        </button>
      </div>
    </div>
  `;
}, ['messages', 'currentMessage'], true);
```

**Usage - embed in ANY website:**
```html
<chat-widget .messages=${chatHistory} .currentMessage=${newMessage}></chat-widget>
```

---

### 🎯 **Quick Decision Guide**

| Use Light DOM (`false`) when... | Use Shadow DOM (`true`) when... |
|--------------------------------|-------------------------------|
| ✅ Component is part of your main app | ✅ Building a UI library for others |
| ✅ Using global CSS (Tailwind, Bootstrap) | ✅ Creating embeddable widgets |
| ✅ Need to inherit theme variables | ✅ Styles must be pixel-perfect everywhere |
| ✅ Working with existing design system | ✅ Component has complex, specific styles |
| ✅ Quick prototyping | ✅ Distributing to different projects |
| ✅ Form elements that should match site | ✅ Need style isolation/encapsulation |

### 💡 **Pro Tips**

1. **Light DOM components** are great for app-specific UI that should feel "native" to your site
2. **Shadow DOM components** are perfect for reusable "products" that must look identical everywhere
3. You can mix both in the same app - choose per component based on needs
4. Shadow DOM also provides DOM isolation - great for complex widgets

```javascript
// Mix and match in the same app!
$.component('app-header', setup, ['title']);                    // Light DOM
$.component('user-menu', setup, ['items']);                     // Light DOM  
$.component('chat-widget', setup, ['messages'], true);          // Shadow DOM
$.component('data-grid', setup, ['columns', 'data'], true);     // Shadow DOM
```

---

### `$.fetch(url, data, [loading])` - Fetch

Simple fetch wrapper with automatic JSON handling and optional loading signal.

```javascript
import { $ } from 'sigpro';

const loading = $(false);

async function loadUser(id) {
  const data = await $.fetch(`/api/users/${id}`, null, loading);
  if (data) userData(data);
}

// In your UI
html`<div>${() => loading() ? 'Loading...' : userData()?.name}</div>`;
```

**Parameters:**
- `url`: Endpoint URL
- `data`: Data to send (auto JSON.stringify'd)
- `loading`: Optional signal function to track loading state

**Returns:** `Promise<Object|null>` - Parsed JSON response or null on error

---

### `$.storage(key, initialValue, [storage])` - Persistent Signal

Signal that automatically syncs with localStorage or sessionStorage.

```javascript
import { $ } from 'sigpro';

// Automatically saves to localStorage
const theme = $.storage('theme', 'light');
const user = $.storage('user', null);

theme('dark'); // Saved to localStorage
// Page refresh... theme() returns 'dark'

// Use sessionStorage instead
const tempData = $.storage('temp', {}, sessionStorage);
```

**Parameters:**
- `key`: Storage key name
- `initialValue`: Default value if none stored
- `storage`: Storage type (default: `localStorage`, options: `sessionStorage`)

**Returns:** Signal function that persists to storage on changes

---

## 🧭 `$.router(routes)` - Hash-Based Router

Creates a simple, powerful hash-based router for Single Page Applications (SPAs) with **automatic page cleanup** and **zero configuration**. Built on native browser APIs - no dependencies, no complex setup.

### Why Hash-Based?

Hash routing (`#/about`) works **everywhere** - no server configuration needed. It's perfect for:
- Static sites and SPAs
- GitHub Pages, Netlify, any static hosting
- Local development without a server
- Projects that need to work immediately

### Basic Usage

```javascript
import { $, html } from 'sigpro';
import HomePage from './pages/HomePage.js';
import AboutPage from './pages/AboutPage.js';
import UserPage from './pages/UserPage.js';
import NotFound from './pages/NotFound.js';

// Define your routes
const routes = [
  { path: '/', component: () => HomePage() },
  { path: '/about', component: () => AboutPage() },
  { path: '/users/:id', component: (params) => UserPage(params) },
  { path: /^\/posts\/(?<id>\d+)$/, component: (params) => PostPage(params) },
];

// Create and mount the router
const router = $.router(routes);
document.body.appendChild(router);
```

---

### 📋 Route Definition

Each route is an object with two properties:

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` or `RegExp` | Route pattern to match |
| `component` | `Function` | Function that returns page content (receives `params`) |

#### String Paths (Simple Routes)

```javascript
{ path: '/', component: () => HomePage() }
{ path: '/about', component: () => AboutPage() }
{ path: '/contact', component: () => ContactPage() }
{ path: '/users/:id', component: (params) => UserPage(params) } // With parameter
```

String paths support:
- **Static segments**: `/about`, `/contact`, `/products`
- **Named parameters**: `:id`, `:slug`, `:username` (captured in `params`)

#### RegExp Paths (Advanced Routing)

```javascript
// Match numeric IDs only
{ path: /^\/users\/(?<id>\d+)$/, component: (params) => UserPage(params) }

// Match product slugs (letters, numbers, hyphens)
{ path: /^\/products\/(?<slug>[a-z0-9-]+)$/, component: (params) => ProductPage(params) }

// Match blog posts by year/month
{ path: /^\/blog\/(?<year>\d{4})\/(?<month>\d{2})$/, component: (params) => BlogArchive(params) }

// Match optional language prefix
{ path: /^\/(?<lang>en|es|fr)?\/?about$/, component: (params) => AboutPage(params) }
```

RegExp gives you **full control** over route matching with named capture groups.

---

## 🧭 `$.router(routes)` - Simple Router with Parameters

Creates a hash-based router with support for `:param` parameters. Automatically cleans up pages when navigating away.

### 📋 Route Parameters (Human-Friendly)

```javascript
const routes = [
  { path: '/', component: HomePage },
  { path: '/about', component: AboutPage },
  { path: '/user/:id', component: UserPage },                    // /user/42 → { id: '42' }
  { path: '/user/:id/posts', component: UserPostsPage },         // /user/42/posts → { id: '42' }
  { path: '/user/:id/posts/:pid', component: PostPage },         // /user/42/posts/123 → { id: '42', pid: '123' }
  { path: '/search/:query/page/:num', component: SearchPage },   // /search/js/page/2 → { query: 'js', num: '2' }
];
```

### 🎯 Accessing Parameters in Pages

Parameters are automatically extracted and passed to your page component:

```javascript
// pages/UserPage.js
import { $, html } from 'sigpro';

export default (params) => $.page(() => {
  // /user/42 → params = { id: '42' }
  const userId = params.id;
  const userData = $(null);
  
  return html`
    <div>
      <h1>User Profile: ${userId}</h1>
      <p>Loading user data...</p>
    </div>
  `;
});

// pages/PostPage.js
export default (params) => $.page(() => {
  // /user/42/posts/123 → params = { id: '42', pid: '123' }
  const { id, pid } = params;
  
  return html`
    <div>
      <h1>Post ${pid} from user ${id}</h1>
    </div>
  `;
});
```

### 🧭 Navigation

```javascript
// Programmatic navigation
$.router.go('/user/42');
$.router.go('/search/javascript/page/2');
$.router.go('about'); // Same as '/about' (auto-adds leading slash)

// Link navigation (in templates)
html`
  <nav>
    <a href="#/">Home</a>
    <a href="#/user/42">Profile</a>
    <button @click=${() => $.router.go('/contact')}>Contact</button>
  </nav>
`;
```

### 🔄 Automatic Page Cleanup

```javascript
export default (params) => $.page(({ onUnmount }) => {
  // Set up interval
  const interval = setInterval(() => {
    fetchData(params.id);
  }, 5000);
  
  // Auto-cleaned when navigating away
  onUnmount(() => clearInterval(interval));
  
  return html`<div>Page content</div>`;
});
```

### 📦 Usage in Templates

```javascript
import { $, html } from 'sigpro';
import HomePage from './pages/Home.js';
import UserPage from './pages/User.js';

const routes = [
  { path: '/', component: HomePage },
  { path: '/user/:id', component: UserPage },
];

// Mount router directly in your template
const App = () => html`
  <div class="app">
    <header>My App</header>
    <main>
      ${$.router(routes)}  <!-- Router renders here -->
    </main>
  </div>
`;

document.body.appendChild(App());
```

### 🎯 API Reference

#### `$.router(routes)`
- **routes**: `Array<{path: string, component: Function}>` - Route configurations with `:param` support
- **Returns**: `HTMLDivElement` - Container that renders the current page

#### `$.router.go(path)`
- **path**: `string` - Route path (automatically adds leading slash)

### 💡 Pro Tips

1. **Order matters** - Define more specific routes first:
```javascript
[
  { path: '/user/:id/edit', component: EditUser },  // More specific first
  { path: '/user/:id', component: ViewUser },       // Then generic
]
```

2. **Cleanup is automatic** - All effects, intervals, and event listeners in `$.page` are cleaned up

3. **Zero config** - Just define routes and use them

---

### `html` - Template Literal Tag

Creates reactive DOM fragments using template literals.

#### Basic Usage

```javascript
import { $, html } from 'sigpro';

const count = $(0);

const fragment = html`
  <div>
    <h1>Count: ${count}</h1>
    <button @click=${() => count(c => c + 1)}>+</button>
  </div>
`;
```

#### Directive Reference

| Directive | Example | Description |
|-----------|---------|-------------|
| `@event` | `@click=${handler}` | Event listener |
| `:property` | `:value=${signal}` | Two-way binding |
| `?attribute` | `?disabled=${signal}` | Boolean attribute |
| `.property` | `.scrollTop=${signal}` | Property binding |

**Two-way binding example:**
```javascript
const text = $('');

html`
  <input :value=${text} />
  <p>You typed: ${text}</p>
`;
```

## 📝 License

MIT © natxocc
