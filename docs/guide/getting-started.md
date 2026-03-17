# Getting Started with SigPro 🚀

Welcome to SigPro! This guide will help you get up and running with the library in minutes. SigPro is a minimalist reactive library that embraces the web platform - no compilation, no virtual DOM, just pure JavaScript and intelligent reactivity.

## 📦 Installation

Choose your preferred installation method:

```bash
# Using npm
npm install sigpro

# Using bun
bun add sigpro

# Or simply copy sigpro.js to your project
# (yes, it's that simple!)
```

## 🎯 Core Imports

```javascript
import { $, html } from 'sigpro';
```

That's it! Just two imports to unlock the entire reactive system:
- **`$`** - Creates reactive signals (the heart of reactivity)
- **`html`** - Template literal tag for reactive DOM rendering

## 🧠 Understanding the Basics

### Signals - The Reactive Heart

Signals are reactive values that automatically track dependencies and update when changed:

```javascript
// Create a signal with initial value
const count = $(0);

// Read value (with auto dependency tracking)
console.log(count()); // 0

// Set new value
count(5);

// Update using previous value
count(prev => prev + 1); // 6

// Create computed signals (auto-updating)
const firstName = $('John');
const lastName = $('Doe');
const fullName = $(() => `${firstName()} ${lastName()}`);
console.log(fullName()); // "John Doe"
firstName('Jane'); // fullName() now returns "Jane Doe"
```

### Effects - Automatic Reactions

Effects automatically run and re-run when their signal dependencies change:

```javascript
const count = $(0);

$.effect(() => {
  console.log(`Count is: ${count()}`);
});
// Logs: "Count is: 0"

count(1);
// Logs: "Count is: 1"

// Effects can return cleanup functions
$.effect(() => {
  const id = count();
  const timer = setInterval(() => {
    console.log(`Polling with count: ${id}`);
  }, 1000);
  
  // Cleanup runs before next effect execution
  return () => clearInterval(timer);
});
```

### Rendering with `html`

The `html` tag creates reactive DOM fragments:

```javascript
const count = $(0);
const isActive = $(true);

const fragment = html`
  <div class="counter">
    <h2>Count: ${count}</h2>
    
    <!-- Event binding -->
    <button @click=${() => count(c => c + 1)}>
      Increment
    </button>
    
    <!-- Boolean attributes -->
    <button ?disabled=${() => !isActive()}>
      Submit
    </button>
  </div>
`;

document.body.appendChild(fragment);
```

## 🎨 Your First Reactive App

Let's build a simple todo app to see SigPro in action:

```javascript
import { $, html } from 'sigpro';

// Create a simple todo app
function TodoApp() {
  // Reactive state
  const todos = $(['Learn SigPro', 'Build something awesome']);
  const newTodo = $('');
  
  // Computed value
  const todoCount = $(() => todos().length);
  
  // Add todo function
  const addTodo = () => {
    if (newTodo().trim()) {
      todos([...todos(), newTodo()]);
      newTodo('');
    }
  };
  
  // Remove todo function
  const removeTodo = (index) => {
    todos(todos().filter((_, i) => i !== index));
  };
  
  // Return reactive template
  return html`
    <div style="max-width: 400px; margin: 2rem auto; font-family: system-ui;">
      <h1>📝 Todo App</h1>
      
      <!-- Input form -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        <input 
          type="text" 
          :value=${newTodo}
          placeholder="Add a new todo..."
          style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"
          @keydown.enter=${addTodo}
        />
        <button 
          @click=${addTodo}
          style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          Add
        </button>
      </div>
      
      <!-- Todo count -->
      <p>Total todos: ${todoCount}</p>
      
      <!-- Todo list -->
      <ul style="list-style: none; padding: 0;">
        ${() => todos().map((todo, index) => html`
          <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 4px 0; background: #f5f5f5; border-radius: 4px;">
            <span>${todo}</span>
            <button 
              @click=${() => removeTodo(index)}
              style="padding: 4px 8px; background: #ff4444; color: white; border: none; border-radius: 4px; cursor: pointer;"
            >
              ✕
            </button>
          </li>
        `)}
      </ul>
    </div>
  `;
}

// Mount the app
document.body.appendChild(TodoApp());
```

## 🎯 Key Concepts

### 1. **Signal Patterns**

| Pattern | Example | Use Case |
|---------|---------|----------|
| Basic signal | `const count = $(0)` | Simple values |
| Computed | `$( () => first() + last() )` | Derived values |
| Signal update | `count(5)` | Direct set |
| Functional update | `count(prev => prev + 1)` | Based on previous |

### 2. **Effect Patterns**

```javascript
// Basic effect
$.effect(() => console.log(count()));

// Effect with cleanup
$.effect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
});

// Stopping an effect
const stop = $.effect(() => {});
stop(); // Effect won't run again
```

### 3. **HTML Directives**

| Directive | Example | Description |
|-----------|---------|-------------|
| `@event` | `@click=${handler}` | Event listeners |
| `:property` | `:value=${signal}` | Two-way binding |
| `?attribute` | `?disabled=${signal}` | Boolean attributes |
| `.property` | `.scrollTop=${value}` | DOM properties |

## 💡 Pro Tips for Beginners

### 1. **Start Simple**
```javascript
// Begin with basic signals
const name = $('World');
html`<h1>Hello, ${name}!</h1>`;
```

### 2. **Use Computed Signals for Derived State**
```javascript
// ❌ Don't compute in template
html`<p>Total: ${items().length * price()}</p>`;

// ✅ Compute with signals
const total = $(() => items().length * price());
html`<p>Total: ${total}</p>`;
```

### 3. **Leverage Effects for Side Effects**
```javascript
// Auto-save to localStorage
$.effect(() => {
  localStorage.setItem('draft', JSON.stringify(draft()));
});
```

## 🔧 VS Code Setup

For the best development experience, install these VS Code extensions:

- **lit-html** - Adds syntax highlighting for `html` tagged templates
- **Prettier** - Automatically formats your template literals

```javascript
// With lit-html extension, you get full syntax highlighting!
html`
  <div style="color: #ff4444; background: linear-gradient(45deg, blue, green)">
    <h1>Beautiful highlighted template</h1>
  </div>
`
```

## 📁 Project Structure

Here's a recommended structure for larger apps:

```
my-sigpro-app/
├── index.html
├── main.js
├── components/
│   ├── Button.js
│   ├── TodoList.js
│   └── TodoItem.js
├── pages/
│   ├── HomePage.js
│   └── AboutPage.js
└── utils/
    └── helpers.js
```

Example `main.js`:
```javascript
import { $, html } from 'sigpro';
import HomePage from './pages/HomePage.js';

// Mount your app
document.body.appendChild(HomePage());
```

## 🎓 Summary

You've learned:
- ✅ How to install SigPro
- ✅ Core concepts: signals, effects, and reactive rendering
- ✅ Built a complete todo app
- ✅ Key patterns and best practices
- ✅ How to structure larger applications

**Remember:** SigPro embraces the web platform. You're writing vanilla JavaScript with superpowers—no compilation, no lock-in, just clean, maintainable code that will work for years to come.

> "Stop fighting the platform. Start building with it."

Happy coding! 🎉