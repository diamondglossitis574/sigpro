# SigPro 🚀

A minimalist reactive library for building web interfaces with signals, effects, and native web components. No compilation, no virtual DOM, just pure JavaScript and intelligent reactivity.

[![npm version](https://img.shields.io/npm/v/sigpro.svg)](https://www.npmjs.com/package/sigpro)
[![bundle size](https://img.shields.io/bundlephobia/minzip/sigpro)](https://bundlephobia.com/package/sigpro)
[![license](https://img.shields.io/npm/l/sigpro)](https://github.com/yourusername/sigpro/blob/main/LICENSE)

## ❓ Why?

After years of building applications with React, Vue, and Svelte—investing countless hours mastering their unique mental models, build tools, and update cycles—I kept circling back to the same realization: no matter how sophisticated the framework, it all eventually compiles down to HTML, CSS, and vanilla JavaScript. The web platform has evolved tremendously, yet many libraries continue to reinvent the wheel, creating parallel universes with their own rules, their own syntaxes, and their own steep learning curves.

**SigPro is my answer to a simple question:** Why fight the platform when we can embrace it?

Modern browsers now offer powerful primitives—Custom Elements, Shadow DOM, CSS custom properties, and microtask queues—that make true reactivity possible without virtual DOM diffing, without compilers, and without lock-in. SigPro strips away the complexity, delivering a reactive programming model that feels familiar but stays remarkably close to vanilla JS. No JSX transformations, no template compilers, no proprietary syntax to learn—just functions, signals, and template literals that work exactly as you'd expect.

What emerged is a library that proves we've reached a turning point: the web is finally mature enough that we don't need to abstract it anymore. We can build reactive, component-based applications using virtually pure JavaScript, leveraging the platform's latest advances instead of working against them. SigPro isn't just another framework—it's a return to fundamentals, showing that the dream of simple, powerful reactivity is now achievable with the tools browsers give us out of the box.

## 📦 Installation
Copy sigpro.js where you want to use it.

## 🎯 Philosophy

SigPro (Signal Professional) embraces the web platform. Built on top of Custom Elements and reactive proxies, it offers a development experience similar to modern frameworks but with a minimal footprint and zero dependencies.

**Core Principles:**
- 📡 **True Reactivity** - Automatic dependency tracking, no manual subscriptions
- ⚡ **Surgical Updates** - Only the exact nodes that depend on changed values are updated
- 🧩 **Web Standards** - Built on Custom Elements, no custom rendering engine
- 🎨 **Intuitive API** - Learn once, use everywhere
- 🔬 **Predictable** - No magic, just signals and effects

## 📚 API Reference

---

### `$(initialValue)` - Signals

Creates a reactive value that notifies dependents when changed.

#### Basic Signal (Getter/Setter)

```typescript
import { $ } from 'sigpro';

// Create a signal
const count = $(0);

// Read value (outside reactive context)
console.log(count()); // 0

// Write value
count(5);
count(prev => prev + 1); // Use function for previous value

// Read with dependency tracking (inside effect)
$$(() => {
  console.log(count()); // Will be registered as dependency
});
```

#### Computed Signal

```typescript
import { $, $$ } from 'sigpro';

const firstName = $('John');
const lastName = $('Doe');

// Computed signal - automatically updates when dependencies change
const fullName = $(() => `${firstName()} ${lastName()}`);

console.log(fullName()); // "John Doe"

firstName('Jane');
console.log(fullName()); // "Jane Doe"

// Computed signals cache until dependencies change
const expensiveComputation = $(() => {
  console.log('Computing...');
  return firstName().length + lastName().length;
});

console.log(expensiveComputation()); // "Computing..." 7
console.log(expensiveComputation()); // 7 (cached, no log)
```

#### Signal with Custom Equality

```typescript
import { $ } from 'sigpro';

const user = $({ id: 1, name: 'John' });

// Signals use Object.is comparison
user({ id: 1, name: 'John' }); // Won't trigger updates (same values, new object)
user({ id: 1, name: 'Jane' }); // Will trigger updates
```

**Parameters:**
- `initialValue`: Initial value or getter function for computed signal

**Returns:** Function that acts as getter/setter with the following signature:
```typescript
type Signal<T> = {
  (): T;  // Getter
  (value: T | ((prev: T) => T)): void;  // Setter
}
```

---

### `$$(effect)` - Effects

Executes a function and automatically re-runs it when its dependencies change.

#### Basic Effect

```typescript
import { $, $$ } from 'sigpro';

const count = $(0);
const name = $('World');

// Effect runs immediately and on dependency changes
$$(() => {
  console.log(`Count is: ${count()}`); // Only depends on count
});
// Log: "Count is: 0"

count(1);
// Log: "Count is: 1"

name('Universe'); // No log (name is not a dependency)
```

#### Effect with Cleanup

```typescript
import { $, $$ } from 'sigpro';

const userId = $(1);

$$(() => {
  const id = userId();
  let isSubscribed = true;
  
  // Simulate API subscription
  const subscription = api.subscribe(id, (data) => {
    if (isSubscribed) {
      console.log('New data:', data);
    }
  });
  
  // Return cleanup function
  return () => {
    isSubscribed = false;
    subscription.unsubscribe();
  };
});

userId(2); // Previous subscription cleaned up, new one created
```

#### Nested Effects

```typescript
import { $, $$ } from 'sigpro';

const show = $(true);
const count = $(0);

$$(() => {
  if (!show()) return;
  
  // This effect is nested inside the conditional
  // It will only be active when show() is true
  $$(() => {
    console.log('Count changed:', count());
  });
});

show(false); // Inner effect is automatically cleaned up
count(1);    // No log (inner effect not active)
show(true);  // Inner effect recreated, logs "Count changed: 1"
```

#### Manual Effect Control

```typescript
import { $, $$ } from 'sigpro';

const count = $(0);

// Stop effect manually
const stop = $$(() => {
  console.log('Effect running:', count());
});

count(1); // Log: "Effect running: 1"
stop();
count(2); // No log
```

**Parameters:**
- `effect`: Function to execute. Can return a cleanup function

**Returns:** Function to stop the effect

---

### `html` - Template Literal Tag

Creates reactive DOM fragments using template literals with intelligent binding.

#### Basic Usage

```typescript
import { $, html } from 'sigpro';

const count = $(0);
const name = $('World');

const fragment = html`
  <div class="greeting">
    <h1>Hello ${name}</h1>
    <p>Count: ${count}</p>
    <button @click=${() => count(c => c + 1)}>
      Increment
    </button>
  </div>
`;

document.body.appendChild(fragment);
```

#### Directive Reference

##### `@event` - Event Listeners

```typescript
import { html } from 'sigpro';

const handleClick = (event) => console.log('Clicked!', event);
const handleInput = (value) => console.log('Input:', value);

html`
  <!-- Basic event listener -->
  <button @click=${handleClick}>Click me</button>
  
  <!-- Inline handler with event object -->
  <input @input=${(e) => console.log(e.target.value)} />
  
  <!-- Custom events -->
  <my-component @custom-event=${handleCustomEvent}></my-component>
`
```

##### `:property` - Two-way Binding

Automatically syncs between signal and DOM element.

```typescript
import { $, html } from 'sigpro';

const text = $('');
const checked = $(false);
const selected = $('option1');

html`
  <!-- Text input two-way binding -->
  <input :value=${text} />
  <p>You typed: ${text}</p>
  
  <!-- Checkbox two-way binding -->
  <input type="checkbox" :checked=${checked} />
  <p>Checkbox is: ${() => checked() ? 'checked' : 'unchecked'}</p>
  
  <!-- Select two-way binding -->
  <select :value=${selected}>
    <option value="option1">Option 1</option>
    <option value="option2">Option 2</option>
  </select>
  
  <!-- Works with different input types -->
  <input type="radio" name="radio" :checked=${radio1} value="1" />
  <input type="radio" name="radio" :checked=${radio2} value="2" />
  
  <!-- The binding is bidirectional -->
  <button @click=${() => text('New value')}>Set from code</button>
  <!-- Typing in input will update the signal automatically -->
`
```

##### `?attribute` - Boolean Attributes

```typescript
import { $, html } from 'sigpro';

const isDisabled = $(true);
const isChecked = $(false);
const hasError = $(false);

html`
  <button ?disabled=${isDisabled}>
    ${() => isDisabled() ? 'Disabled' : 'Enabled'}
  </button>
  
  <input type="checkbox" ?checked=${isChecked} />
  
  <div ?hidden=${() => !hasError()} class="error">
    An error occurred
  </div>
  
  <!-- Boolean attributes are properly toggled -->
  <select ?required=${isRequired}>
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
`
```

##### `.property` - Property Binding

Directly binds to DOM properties, not attributes.

```typescript
import { $, html } from 'sigpro';

const scrollTop = $(0);
const user = $({ name: 'John', age: 30 });
const items = $([1, 2, 3]);

html`
  <!-- Bind to element properties -->
  <div .scrollTop=${scrollTop} class="scrollable">
    Content...
  </div>
  
  <!-- Useful for complex objects -->
  <my-component .userData=${user}></my-component>
  
  <!-- Bind to arrays -->
  <list-component .items=${items}></list-component>
  
  <!-- Bind to DOM properties directly -->
  <input .value=${user().name} /> <!-- One-way binding -->
  
  <!-- Property binding doesn't set attributes -->
  <div .customProperty=${{ complex: 'object' }}></div>
`
```

##### Regular Attributes

```typescript
import { $, html } from 'sigpro';

const className = $('big red');
const href = $('#section');
const style = $('color: blue');

// Static attributes
html`<div class="static"></div>`

// Dynamic attributes (non-directive)
html`<div class=${className}></div>`

// Mix of static and dynamic
html`<a href="${href}" class="link ${className}">Link</a>`

// Reactive attributes update when signal changes
$$(() => {
  // The attribute updates automatically
  console.log('Class changed:', className());
});
```

#### Conditional Rendering

```typescript
import { $, html } from 'sigpro';

const show = $(true);
const user = $({ name: 'John', role: 'admin' });

// Using ternary
html`
  ${() => show() ? html`
    <div>Content is visible</div>
  ` : html`
    <div>Content is hidden</div>
  `}
`

// Using logical AND
html`
  ${() => user().role === 'admin' && html`
    <button>Admin Panel</button>
  `}
`

// Complex conditions
html`
  ${() => {
    if (!show()) return null;
    if (user().role === 'admin') {
      return html`<div>Admin view</div>`;
    }
    return html`<div>User view</div>`;
  }}
`
```

#### List Rendering

```typescript
import { $, html } from 'sigpro';

const items = $([1, 2, 3, 4, 5]);
const todos = $([
  { text: 'Learn SigPro', done: true },
  { text: 'Build an app', done: false }
]);

// Basic list
html`
  <ul>
    ${() => items().map(item => html`
      <li>Item ${item}</li>
    `)}
  </ul>
`

// List with keys (for efficient updates)
html`
  <ul>
    ${() => todos().map((todo, index) => html`
      <li key=${index}>
        <input type="checkbox" ?checked=${todo.done} />
        <span style=${() => todo.done ? 'text-decoration: line-through' : ''}>
          ${todo.text}
        </span>
      </li>
    `)}
  </ul>
`

// Nested lists
const matrix = $([[1, 2], [3, 4], [5, 6]]);

html`
  <table>
    ${() => matrix().map(row => html`
      <tr>
        ${() => row.map(cell => html`
          <td>${cell}</td>
        `)}
      </tr>
    `)}
  </table>
`
```

#### Dynamic Tag Names

```typescript
import { $, html } from 'sigpro';

const tagName = $('h1');
const level = $(1);

html`
  <!-- Dynamic tag name using property -->
  <div .tagName=${tagName}>
    This will be wrapped in ${tagName} tags
  </div>
  
  <!-- Using computed tag name -->
  ${() => {
    const Tag = `h${level()}`;
    return html`
      <${Tag}>Level ${level()} Heading</${Tag}>
    `;
  }}
`
```

#### Template Composition

```typescript
import { $, html } from 'sigpro';

const Header = () => html`<header>Header</header>`;
const Footer = () => html`<footer>Footer</footer>`;

const Layout = ({ children }) => html`
  ${Header()}
  <main>
    ${children}
  </main>
  ${Footer()}
`

const Page = () => html`
  ${Layout({
    children: html`
      <h1>Page Content</h1>
      <p>Some content here</p>
    `
  })}
`
```

---

### `$component(tag, setup, observedAttributes)` - Web Components

Creates Custom Elements with automatic reactive properties.

#### Basic Component

```typescript
import { $, $component, html } from 'sigpro';

$component('my-counter', (props, context) => {
  // props contains signals for each observed attribute
  // context provides component utilities
  
  const increment = () => {
    props.value(v => v + 1);
  };
  
  return html`
    <div class="counter">
      <p>Count: ${props.value}</p>
      <button @click=${increment}>
        Increment
      </button>
      <slot></slot>
    </div>
  `;
}, ['value']); // Observed attributes
```

Usage:
```html
<my-counter value="5">
  <span>Additional content</span>
</my-counter>

<script>
  const counter = document.querySelector('my-counter');
  console.log(counter.value); // 5
  counter.value = 10; // Reactive update
</script>
```

#### Component with Complex Props

```typescript
import { $, $component, html } from 'sigpro';

$component('user-profile', (props, context) => {
  // Transform string attributes to appropriate types
  const user = $(() => ({
    id: parseInt(props.id()),
    name: props.name(),
    age: parseInt(props.age()),
    active: props.active() === 'true'
  }));
  
  return html`
    <div class="profile">
      <h2>${user().name}</h2>
      <p>ID: ${user().id}</p>
      <p>Age: ${user().age}</p>
      <p>Status: ${() => user().active ? 'Active' : 'Inactive'}</p>
      
      <button @click=${() => props.age(a => parseInt(a) + 1)}>
        Birthday!
      </button>
    </div>
  `;
}, ['id', 'name', 'age', 'active']);
```

#### Component Lifecycle & Context

```typescript
import { $, $component, html } from 'sigpro';

$component('lifecycle-demo', (props, {
  select,        // Query selector scoped to component
  selectAll,     // Query selector all scoped to component
  slot,          // Access slots
  emit,          // Dispatch custom events
  host,          // Reference to the host element
  onMount,       // Register mount callback
  onUnmount,     // Register unmount callback
  onAttribute,   // Listen to attribute changes
  getAttribute,  // Get raw attribute value
  setAttribute,  // Set raw attribute value
}) => {
  
  // Access slots
  const defaultSlot = slot(); // Unnamed slot
  const headerSlot = slot('header'); // Named slot
  
  // Query internal elements
  const button = select('button');
  const allSpans = selectAll('span');
  
  // Lifecycle hooks
  onMount(() => {
    console.log('Component mounted');
    // Access DOM after mount
    button?.classList.add('mounted');
  });
  
  onUnmount(() => {
    console.log('Component unmounting');
    // Cleanup resources
  });
  
  // Listen to specific attribute changes
  onAttribute('value', (newValue, oldValue) => {
    console.log(`Value changed from ${oldValue} to ${newValue}`);
  });
  
  // Emit custom events
  const handleClick = () => {
    emit('button-click', { timestamp: Date.now() });
    emit('value-change', props.value(), { bubbles: true });
  };
  
  // Access host directly
  host.style.display = 'block';
  
  return html`
    <div>
      ${headerSlot}
      <button @click=${handleClick}>
        Click me
      </button>
      ${defaultSlot}
    </div>
  `;
}, ['value']);
```

#### Component with Methods

```typescript
import { $, $component, html } from 'sigpro';

$component('timer-widget', (props, { host }) => {
  const seconds = $(0);
  let intervalId;
  
  // Expose methods to the host element
  Object.assign(host, {
    start() {
      if (intervalId) return;
      intervalId = setInterval(() => {
        seconds(s => s + 1);
      }, 1000);
    },
    
    stop() {
      clearInterval(intervalId);
      intervalId = null;
    },
    
    reset() {
      seconds(0);
    },
    
    get currentTime() {
      return seconds();
    }
  });
  
  return html`
    <div>
      <p>${seconds} seconds</p>
      <button @click=${() => host.start()}>Start</button>
      <button @click=${() => host.stop()}>Stop</button>
      <button @click=${() => host.reset()}>Reset</button>
    </div>
  `;
}, []);
```

Usage:
```html
<timer-widget id="timer"></timer-widget>
<script>
  const timer = document.getElementById('timer');
  timer.start();
  timer.stop();
  console.log(timer.currentTime);
</script>
```

#### Component Inheritance

```typescript
import { $, $component, html } from 'sigpro';

// Base component
$component('base-button', (props, { slot }) => {
  return html`
    <button class="base-button" ?disabled=${props.disabled}>
      ${slot()}
    </button>
  `;
}, ['disabled']);

// Extended component
$component('primary-button', (props, context) => {
  // Reuse base component
  return html`
    <base-button ?disabled=${props.disabled} class="primary">
      ${context.slot()}
    </base-button>
  `;
}, ['disabled']);
```

---

### `$router(routes)` - Router

Hash-based router for SPAs with reactive integration.

#### Basic Routing

```typescript
import { $router, html } from 'sigpro';

const router = $router([
  {
    path: '/',
    component: () => html`
      <h1>Home Page</h1>
      <a href="#/about">About</a>
    `
  },
  {
    path: '/about',
    component: () => html`
      <h1>About Page</h1>
      <a href="#/">Home</a>
    `
  }
]);

document.body.appendChild(router);
```

#### Route Parameters

```typescript
import { $router, html } from 'sigpro';

const router = $router([
  {
    path: '/user/:id',
    component: (params) => html`
      <h1>User Profile</h1>
      <p>User ID: ${params.id}</p>
      <a href="#/user/${params.id}/edit">Edit</a>
    `
  },
  {
    path: '/user/:id/posts/:postId',
    component: (params) => html`
      <h1>Post ${params.postId} by User ${params.id}</h1>
    `
  },
  {
    path: /^\/product\/(?<category>\w+)\/(?<id>\d+)$/,
    component: (params) => html`
      <h1>Product ${params.id} in ${params.category}</h1>
    `
  }
]);
```

#### Nested Routes

```typescript
import { $router, html, $ } from 'sigpro';

const router = $router([
  {
    path: '/',
    component: () => html`
      <h1>Home</h1>
      <nav>
        <a href="#/dashboard">Dashboard</a>
      </nav>
    `
  },
  {
    path: '/dashboard',
    component: () => {
      // Nested router
      const subRouter = $router([
        {
          path: '/',
          component: () => html`<h2>Dashboard Home</h2>`
        },
        {
          path: '/settings',
          component: () => html`<h2>Dashboard Settings</h2>`
        },
        {
          path: '/profile/:id',
          component: (params) => html`<h2>Profile ${params.id}</h2>`
        }
      ]);
      
      return html`
        <div>
          <h1>Dashboard</h1>
          <nav>
            <a href="#/dashboard/">Home</a>
            <a href="#/dashboard/settings">Settings</a>
          </nav>
          ${subRouter}
        </div>
      `;
    }
  }
]);
```

#### Route Guards

```typescript
import { $router, html, $ } from 'sigpro';

const isAuthenticated = $(false);

const requireAuth = (component) => (params) => {
  if (!isAuthenticated()) {
    $router.go('/login');
    return null;
  }
  return component(params);
};

const router = $router([
  {
    path: '/',
    component: () => html`<h1>Public Home</h1>`
  },
  {
    path: '/dashboard',
    component: requireAuth((params) => html`
      <h1>Protected Dashboard</h1>
    `)
  },
  {
    path: '/login',
    component: () => html`
      <h1>Login</h1>
      <button @click=${() => isAuthenticated(true)}>Login</button>
    `
  }
]);
```

#### Navigation

```typescript
import { $router } from 'sigpro';

// Navigate to path
$router.go('/user/42');

// Navigate with replace
$router.go('/dashboard', { replace: true });

// Go back
$router.back();

// Go forward
$router.forward();

// Get current path
const currentPath = $router.getCurrentPath();

// Listen to navigation
$router.listen((path, oldPath) => {
  console.log(`Navigated from ${oldPath} to ${path}`);
});
```

#### Route Transitions

```typescript
import { $router, html, $$ } from 'sigpro';

const router = $router([
  {
    path: '/',
    component: () => html`<div class="page home">Home</div>`
  },
  {
    path: '/about',
    component: () => html`<div class="page about">About</div>`
  }
]);

// Add transitions
$$(() => {
  const currentPath = router.getCurrentPath();
  const pages = document.querySelectorAll('.page');
  
  pages.forEach(page => {
    page.style.opacity = '0';
    page.style.transition = 'opacity 0.3s';
    
    setTimeout(() => {
      page.style.opacity = '1';
    }, 50);
  });
});
```

---

## 🎮 Complete Examples

### Real-time Todo Application

```typescript
import { $, $$, html, $component } from 'sigpro';

// Styles
const styles = html`
  <style>
    .todo-app {
      max-width: 500px;
      margin: 2rem auto;
      font-family: system-ui, sans-serif;
    }
    
    .todo-input {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }
    
    .todo-input input {
      flex: 1;
      padding: 0.5rem;
      border: 2px solid #e0e0e0;
      border-radius: 4px;
    }
    
    .todo-input button {
      padding: 0.5rem 1rem;
      background: #0070f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .todo-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .todo-item.completed span {
      text-decoration: line-through;
      color: #999;
    }
    
    .todo-item button {
      margin-left: auto;
      padding: 0.25rem 0.5rem;
      background: #ff4444;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .filters {
      display: flex;
      gap: 0.5rem;
      margin: 1rem 0;
    }
    
    .filters button {
      padding: 0.25rem 0.5rem;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .filters button.active {
      background: #0070f3;
      color: white;
      border-color: #0070f3;
    }
    
    .stats {
      margin-top: 1rem;
      padding: 0.5rem;
      background: #f5f5f5;
      border-radius: 4px;
      text-align: center;
    }
  </style>
`;

$component('todo-app', () => {
  // State
  const todos = $(() => {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  
  const newTodo = $('');
  const filter = $('all'); // 'all', 'active', 'completed'
  const editingId = $(null);
  const editText = $('');
  
  // Save to localStorage on changes
  $$(() => {
    localStorage.setItem('todos', JSON.stringify(todos()));
  });
  
  // Filtered todos
  const filteredTodos = $(() => {
    const currentFilter = filter();
    const allTodos = todos();
    
    switch (currentFilter) {
      case 'active':
        return allTodos.filter(t => !t.completed);
      case 'completed':
        return allTodos.filter(t => t.completed);
      default:
        return allTodos;
    }
  });
  
  // Stats
  const stats = $(() => {
    const all = todos();
    return {
      total: all.length,
      completed: all.filter(t => t.completed).length,
      active: all.filter(t => !t.completed).length
    };
  });
  
  // Actions
  const addTodo = () => {
    const text = newTodo().trim();
    if (!text) return;
    
    todos([
      ...todos(),
      {
        id: Date.now(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]);
    newTodo('');
  };
  
  const toggleTodo = (id) => {
    todos(todos().map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ));
  };
  
  const deleteTodo = (id) => {
    todos(todos().filter(todo => todo.id !== id));
    if (editingId() === id) {
      editingId(null);
    }
  };
  
  const startEdit = (todo) => {
    editingId(todo.id);
    editText(todo.text);
  };
  
  const saveEdit = (id) => {
    const text = editText().trim();
    if (!text) {
      deleteTodo(id);
    } else {
      todos(todos().map(todo =>
        todo.id === id ? { ...todo, text } : todo
      ));
    }
    editingId(null);
  };
  
  const clearCompleted = () => {
    todos(todos().filter(t => !t.completed));
  };
  
  return html`
    ${styles}
    <div class="todo-app">
      <h1>📝 Todo App</h1>
      
      <!-- Add Todo -->
      <div class="todo-input">
        <input
          type="text"
          :value=${newTodo}
          placeholder="What needs to be done?"
          @keydown=${(e) => e.key === 'Enter' && addTodo()}
        />
        <button @click=${addTodo}>Add</button>
      </div>
      
      <!-- Filters -->
      <div class="filters">
        <button
          class=${() => filter() === 'all' ? 'active' : ''}
          @click=${() => filter('all')}
        >
          All
        </button>
        <button
          class=${() => filter() === 'active' ? 'active' : ''}
          @click=${() => filter('active')}
        >
          Active
        </button>
        <button
          class=${() => filter() === 'completed' ? 'active' : ''}
          @click=${() => filter('completed')}
        >
          Completed
        </button>
      </div>
      
      <!-- Todo List -->
      <div class="todo-list">
        ${() => filteredTodos().map(todo => html`
          <div class="todo-item ${todo.completed ? 'completed' : ''}" key=${todo.id}>
            ${editingId() === todo.id ? html`
              <input
                type="text"
                :value=${editText}
                @keydown=${(e) => {
                  if (e.key === 'Enter') saveEdit(todo.id);
                  if (e.key === 'Escape') editingId(null);
                }}
                @blur=${() => saveEdit(todo.id)}
                autofocus
              />
            ` : html`
              <input
                type="checkbox"
                ?checked=${todo.completed}
                @change=${() => toggleTodo(todo.id)}
              />
              <span @dblclick=${() => startEdit(todo)}>
                ${todo.text}
              </span>
              <button @click=${() => deleteTodo(todo.id)}>✕</button>
            `}
          </div>
        `)}
      </div>
      
      <!-- Stats -->
      <div class="stats">
        ${() => {
          const s = stats();
          return html`
            <span>Total: ${s.total}</span> |
            <span>Active: ${s.active}</span> |
            <span>Completed: ${s.completed}</span>
            ${s.completed > 0 ? html`
              <button @click=${clearCompleted}>Clear completed</button>
            ` : ''}
          `;
        }}
      </div>
    </div>
  `;
}, []);
```

### Data Dashboard with Real-time Updates

```typescript
import { $, $$, html, $component } from 'sigpro';

// Simulated WebSocket connection
class DataStream {
  constructor() {
    this.listeners = new Set();
    this.interval = setInterval(() => {
      const data = {
        timestamp: Date.now(),
        value: Math.random() * 100,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
      };
      this.listeners.forEach(fn => fn(data));
    }, 1000);
  }
  
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  destroy() {
    clearInterval(this.interval);
  }
}

$component('data-dashboard', () => {
  const stream = new DataStream();
  const dataPoints = $([]);
  const selectedCategory = $('all');
  const timeWindow = $(60); // seconds
  
  // Subscribe to data stream
  $$(() => {
    const unsubscribe = stream.subscribe((newData) => {
      dataPoints(prev => {
        const updated = [...prev, newData];
        const maxAge = timeWindow() * 1000;
        const cutoff = Date.now() - maxAge;
        return updated.filter(d => d.timestamp > cutoff);
      });
    });
    
    return unsubscribe;
  });
  
  // Filtered data
  const filteredData = $(() => {
    const data = dataPoints();
    const category = selectedCategory();
    
    if (category === 'all') return data;
    return data.filter(d => d.category === category);
  });
  
  // Statistics
  const statistics = $(() => {
    const data = filteredData();
    if (data.length === 0) return null;
    
    const values = data.map(d => d.value);
    return {
      count: data.length,
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      last: values[values.length - 1]
    };
  });
  
  // Cleanup on unmount
  onUnmount(() => {
    stream.destroy();
  });
  
  return html`
    <div class="dashboard">
      <h2>📊 Real-time Dashboard</h2>
      
      <!-- Controls -->
      <div class="controls">
        <select :value=${selectedCategory}>
          <option value="all">All Categories</option>
          <option value="A">Category A</option>
          <option value="B">Category B</option>
          <option value="C">Category C</option>
        </select>
        
        <input
          type="range"
          min="10"
          max="300"
          step="10"
          :value=${timeWindow}
        />
        <span>Time window: ${timeWindow}s</span>
      </div>
      
      <!-- Statistics -->
      ${() => {
        const stats = statistics();
        if (!stats) return html`<p>Waiting for data...</p>`;
        
        return html`
          <div class="stats">
            <div>Points: ${stats.count}</div>
            <div>Average: ${stats.avg.toFixed(2)}</div>
            <div>Min: ${stats.min.toFixed(2)}</div>
            <div>Max: ${stats.max.toFixed(2)}</div>
            <div>Last: ${stats.last.toFixed(2)}</div>
          </div>
        `;
      }}
      
      <!-- Chart (simplified) -->
      <div class="chart">
        ${() => filteredData().map(point => html`
          <div
            class="bar"
            style="
              height: ${point.value}px;
              background: ${point.category === 'A' ? '#ff4444' :
                           point.category === 'B' ? '#44ff44' : '#4444ff'};
            "
            title="${new Date(point.timestamp).toLocaleTimeString()}: ${point.value.toFixed(2)}"
          ></div>
        `)}
      </div>
    </div>
  `;
}, []);
```

## 🔧 Advanced Patterns

### Custom Hooks

```typescript
import { $, $$ } from 'sigpro';

// useLocalStorage hook
function useLocalStorage(key, initialValue) {
  const stored = localStorage.getItem(key);
  const signal = $(stored ? JSON.parse(stored) : initialValue);
  
  $$(() => {
    localStorage.setItem(key, JSON.stringify(signal()));
  });
  
  return signal;
}

// useDebounce hook
function useDebounce(signal, delay) {
  const debounced = $(signal());
  let timeout;
  
  $$(() => {
    const value = signal();
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      debounced(value);
    }, delay);
  });
  
  return debounced;
}

// useFetch hook
function useFetch(url) {
  const data = $(null);
  const error = $(null);
  const loading = $(true);
  
  const fetchData = async () => {
    loading(true);
    error(null);
    try {
      const response = await fetch(url());
      const json = await response.json();
      data(json);
    } catch (e) {
      error(e);
    } finally {

