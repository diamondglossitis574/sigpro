# Signals API 📡

Signals are the heart of SigPro's reactivity system. They are reactive values that automatically track dependencies and notify subscribers when they change. This enables fine-grained updates without virtual DOM diffing.

## Core Concepts

### What is a Signal?

A signal is a function that holds a value and notifies dependents when that value changes. Signals can be:

- **Basic signals** - Hold simple values (numbers, strings, objects)
- **Computed signals** - Derive values from other signals
- **Persistent signals** - Automatically sync with localStorage/sessionStorage

### How Reactivity Works

SigPro uses automatic dependency tracking:

1. When you read a signal inside an effect, the effect becomes a subscriber
2. When the signal's value changes, all subscribers are notified
3. Updates are batched using microtasks for optimal performance
4. Only the exact nodes that depend on changed values are updated

## `$(initialValue)`

Creates a reactive signal. The behavior changes based on the type of `initialValue`:

- If `initialValue` is a **function**, creates a computed signal
- Otherwise, creates a basic signal

```javascript
import { $ } from 'sigpro';

// Basic signal
const count = $(0);

// Computed signal
const firstName = $('John');
const lastName = $('Doe');
const fullName = $(() => `${firstName()} ${lastName()}`);
```

## 📋 API Reference

### Basic Signals

| Pattern | Example | Description |
|---------|---------|-------------|
| Create | `const count = $(0)` | Create signal with initial value |
| Get | `count()` | Read current value |
| Set | `count(5)` | Set new value directly |
| Update | `count(prev => prev + 1)` | Update based on previous value |

### Computed Signals

| Pattern | Example | Description |
|---------|---------|-------------|
| Create | `const total = $(() => price() * quantity())` | Derive value from other signals |
| Get | `total()` | Read computed value (auto-updates) |

### Signal Methods

| Method | Description | Example |
|--------|-------------|---------|
| `signal()` | Gets current value | `count()` |
| `signal(newValue)` | Sets new value | `count(5)` |
| `signal(prev => new)` | Updates using previous value | `count(c => c + 1)` |

## 🎯 Basic Examples

### Counter Signal

```javascript
import { $ } from 'sigpro';

const count = $(0);

console.log(count()); // 0

count(5);
console.log(count()); // 5

count(prev => prev + 1);
console.log(count()); // 6
```

### Object Signal

```javascript
import { $ } from 'sigpro';

const user = $({
  name: 'John',
  age: 30,
  email: 'john@example.com'
});

// Read
console.log(user().name); // 'John'

// Update (immutable pattern)
user({
  ...user(),
  age: 31
});

// Partial update with function
user(prev => ({
  ...prev,
  email: 'john.doe@example.com'
}));
```

### Array Signal

```javascript
import { $ } from 'sigpro';

const todos = $(['Learn SigPro', 'Build an app']);

// Add item
todos([...todos(), 'Deploy to production']);

// Remove item
todos(todos().filter((_, i) => i !== 1));

// Update item
todos(todos().map((todo, i) => 
  i === 0 ? 'Master SigPro' : todo
));
```

## 🔄 Computed Signals

Computed signals automatically update when their dependencies change:

```javascript
import { $ } from 'sigpro';

const price = $(10);
const quantity = $(2);
const tax = $(0.21);

// Computed signals
const subtotal = $(() => price() * quantity());
const taxAmount = $(() => subtotal() * tax());
const total = $(() => subtotal() + taxAmount());

console.log(total()); // 24.2

price(15);
console.log(total()); // 36.3 (automatically updated)

quantity(3);
console.log(total()); // 54.45 (automatically updated)
```

### Computed with Multiple Dependencies

```javascript
import { $ } from 'sigpro';

const firstName = $('John');
const lastName = $('Doe');
const prefix = $('Mr.');

const fullName = $(() => {
  // Computed signals can contain logic
  const name = `${firstName()} ${lastName()}`;
  return prefix() ? `${prefix()} ${name}` : name;
});

console.log(fullName()); // 'Mr. John Doe'

prefix('');
console.log(fullName()); // 'John Doe'
```

### Computed with Conditional Logic

```javascript
import { $ } from 'sigpro';

const user = $({ role: 'admin', permissions: [] });
const isAdmin = $(() => user().role === 'admin');
const hasPermission = $(() => 
  isAdmin() || user().permissions.includes('edit')
);

console.log(hasPermission()); // true

user({ role: 'user', permissions: ['view'] });
console.log(hasPermission()); // false (can't edit)

user({ role: 'user', permissions: ['view', 'edit'] });
console.log(hasPermission()); // true (now has permission)
```

## 🧮 Advanced Signal Patterns

### Derived State Pattern

```javascript
import { $ } from 'sigpro';

// Shopping cart example
const cart = $([
  { id: 1, name: 'Product 1', price: 10, quantity: 2 },
  { id: 2, name: 'Product 2', price: 15, quantity: 1 },
]);

// Derived values
const itemCount = $(() => 
  cart().reduce((sum, item) => sum + item.quantity, 0)
);

const subtotal = $(() => 
  cart().reduce((sum, item) => sum + (item.price * item.quantity), 0)
);

const tax = $(() => subtotal() * 0.21);
const total = $(() => subtotal() + tax());

// Update cart
cart([
  ...cart(),
  { id: 3, name: 'Product 3', price: 20, quantity: 1 }
]);

// All derived values auto-update
console.log(itemCount()); // 4
console.log(total()); // (10*2 + 15*1 + 20*1) * 1.21 = 78.65
```

### Validation Pattern

```javascript
import { $ } from 'sigpro';

const email = $('');
const password = $('');
const confirmPassword = $('');

// Validation signals
const isEmailValid = $(() => {
  const value = email();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
});

const isPasswordValid = $(() => {
  const value = password();
  return value.length >= 8;
});

const doPasswordsMatch = $(() => 
  password() === confirmPassword()
);

const isFormValid = $(() => 
  isEmailValid() && isPasswordValid() && doPasswordsMatch()
);

// Update form
email('user@example.com');
password('secure123');
confirmPassword('secure123');

console.log(isFormValid()); // true

// Validation messages
const emailError = $(() => 
  email() && !isEmailValid() ? 'Invalid email format' : ''
);
```

### Filtering and Search Pattern

```javascript
import { $ } from 'sigpro';

const items = $([
  { id: 1, name: 'Apple', category: 'fruit' },
  { id: 2, name: 'Banana', category: 'fruit' },
  { id: 3, name: 'Carrot', category: 'vegetable' },
  { id: 4, name: 'Date', category: 'fruit' },
]);

const searchTerm = $('');
const categoryFilter = $('all');

// Filtered items (computed)
const filteredItems = $(() => {
  let result = items();
  
  // Apply search filter
  if (searchTerm()) {
    const term = searchTerm().toLowerCase();
    result = result.filter(item => 
      item.name.toLowerCase().includes(term)
    );
  }
  
  // Apply category filter
  if (categoryFilter() !== 'all') {
    result = result.filter(item => 
      item.category === categoryFilter()
    );
  }
  
  return result;
});

// Stats
const fruitCount = $(() => 
  items().filter(item => item.category === 'fruit').length
);

const vegCount = $(() => 
  items().filter(item => item.category === 'vegetable').length
);

// Update filters
searchTerm('a');
console.log(filteredItems().map(i => i.name)); // ['Apple', 'Banana', 'Carrot', 'Date']

categoryFilter('fruit');
console.log(filteredItems().map(i => i.name)); // ['Apple', 'Banana', 'Date']
```

### Pagination Pattern

```javascript
import { $ } from 'sigpro';

const allItems = $([...Array(100).keys()].map(i => `Item ${i + 1}`));
const currentPage = $(1);
const itemsPerPage = $(10);

// Paginated items (computed)
const paginatedItems = $(() => {
  const start = (currentPage() - 1) * itemsPerPage();
  const end = start + itemsPerPage();
  return allItems().slice(start, end);
});

// Pagination metadata
const totalPages = $(() => 
  Math.ceil(allItems().length / itemsPerPage())
);

const hasNextPage = $(() => 
  currentPage() < totalPages()
);

const hasPrevPage = $(() => 
  currentPage() > 1
);

const pageRange = $(() => {
  const current = currentPage();
  const total = totalPages();
  const delta = 2;
  
  let range = [];
  for (let i = Math.max(2, current - delta); 
       i <= Math.min(total - 1, current + delta); 
       i++) {
    range.push(i);
  }
  
  if (current - delta > 2) range = ['...', ...range];
  if (current + delta < total - 1) range = [...range, '...'];
  
  return [1, ...range, total];
});

// Navigation
const nextPage = () => {
  if (hasNextPage()) currentPage(c => c + 1);
};

const prevPage = () => {
  if (hasPrevPage()) currentPage(c => c - 1);
};

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages()) {
    currentPage(page);
  }
};
```

## 🔧 Advanced Signal Features

### Signal Equality Comparison

Signals use `Object.is` for change detection. Only notify subscribers when values are actually different:

```javascript
import { $ } from 'sigpro';

const count = $(0);

// These won't trigger updates:
count(0); // Same value
count(prev => prev); // Returns same value

// These will trigger updates:
count(1); // Different value
count(prev => prev + 0); // Still 0? Actually returns 0? Wait...
// Be careful with functional updates!
```

### Batch Updates

Multiple signal updates are batched into a single microtask:

```javascript
import { $ } from 'sigpro';

const firstName = $('John');
const lastName = $('Doe');
const fullName = $(() => `${firstName()} ${lastName()}`);

$.effect(() => {
  console.log('Full name:', fullName());
});
// Logs: 'Full name: John Doe'

// Multiple updates in same tick - only one effect run!
firstName('Jane');
lastName('Smith');
// Only logs once: 'Full name: Jane Smith'
```

### Infinite Loop Protection

SigPro includes protection against infinite reactive loops:

```javascript
import { $ } from 'sigpro';

const a = $(1);
const b = $(2);

// This would create a loop, but SigPro prevents it
$.effect(() => {
  a(b()); // Reading b
  b(a()); // Reading a - loop detected!
});
// Throws: "SigPro: Infinite reactive loop detected."
```

## 📊 Performance Characteristics

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Signal read | O(1) | Direct value access |
| Signal write | O(n) | n = number of subscribers |
| Computed read | O(1) or O(m) | m = computation complexity |
| Effect run | O(s) | s = number of signal reads |

## 🎯 Best Practices

### 1. Keep Signals Focused

```javascript
// ❌ Avoid large monolithic signals
const state = $({
  user: null,
  posts: [],
  theme: 'light',
  notifications: []
});

// ✅ Split into focused signals
const user = $(null);
const posts = $([]);
const theme = $('light');
const notifications = $([]);
```

### 2. Use Computed for Derived State

```javascript
// ❌ Don't compute in templates/effects
$.effect(() => {
  const total = items().reduce((sum, i) => sum + i.price, 0);
  updateUI(total);
});

// ✅ Compute with signals
const total = $(() => items().reduce((sum, i) => sum + i.price, 0));
$.effect(() => updateUI(total()));
```

### 3. Immutable Updates

```javascript
// ❌ Don't mutate objects/arrays
const user = $({ name: 'John' });
user().name = 'Jane'; // Won't trigger updates!

// ✅ Create new objects/arrays
user({ ...user(), name: 'Jane' });

// ❌ Don't mutate arrays
const todos = $(['a', 'b']);
todos().push('c'); // Won't trigger updates!

// ✅ Create new arrays
todos([...todos(), 'c']);
```

### 4. Functional Updates for Dependencies

```javascript
// ❌ Avoid if new value depends on current
count(count() + 1);

// ✅ Use functional update
count(prev => prev + 1);
```

### 5. Clean Up Effects

```javascript
import { $ } from 'sigpro';

const userId = $(1);

// Effects auto-clean in pages, but you can stop manually
const stop = $.effect(() => {
  fetchUser(userId());
});

// Later, if needed
stop();
```

## 🚀 Real-World Examples

### Form State Management

```javascript
import { $ } from 'sigpro';

// Form state
const formData = $({
  username: '',
  email: '',
  age: '',
  newsletter: false
});

// Touched fields (for validation UI)
const touched = $({
  username: false,
  email: false,
  age: false
});

// Validation rules
const validations = {
  username: (value) => 
    value.length >= 3 ? null : 'Username must be at least 3 characters',
  email: (value) => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Invalid email',
  age: (value) => 
    !value || (value >= 18 && value <= 120) ? null : 'Age must be 18-120'
};

// Validation signals
const errors = $(() => {
  const data = formData();
  const result = {};
  
  Object.keys(validations).forEach(field => {
    const error = validations[field](data[field]);
    if (error) result[field] = error;
  });
  
  return result;
});

const isValid = $(() => Object.keys(errors()).length === 0);

// Field helpers
const fieldProps = (field) => ({
  value: formData()[field],
  error: touched()[field] ? errors()[field] : null,
  onChange: (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    formData({
      ...formData(),
      [field]: value
    });
  },
  onBlur: () => {
    touched({
      ...touched(),
      [field]: true
    });
  }
});

// Form submission
const submitAttempts = $(0);
const isSubmitting = $(false);

const handleSubmit = async () => {
  submitAttempts(s => s + 1);
  
  if (!isValid()) {
    // Mark all fields as touched to show errors
    touched(Object.keys(formData()).reduce((acc, field) => ({
      ...acc,
      [field]: true
    }), {}));
    return;
  }
  
  isSubmitting(true);
  try {
    await saveForm(formData());
    // Reset form on success
    formData({ username: '', email: '', age: '', newsletter: false });
    touched({ username: false, email: false, age: false });
  } finally {
    isSubmitting(false);
  }
};
```

### Todo App with Filters

```javascript
import { $ } from 'sigpro';

// State
const todos = $([
  { id: 1, text: 'Learn SigPro', completed: true },
  { id: 2, text: 'Build an app', completed: false },
  { id: 3, text: 'Write docs', completed: false }
]);

const filter = $('all'); // 'all', 'active', 'completed'
const newTodoText = $('');

// Computed values
const filteredTodos = $(() => {
  const all = todos();
  
  switch(filter()) {
    case 'active':
      return all.filter(t => !t.completed);
    case 'completed':
      return all.filter(t => t.completed);
    default:
      return all;
  }
});

const activeCount = $(() => 
  todos().filter(t => !t.completed).length
);

const completedCount = $(() => 
  todos().filter(t => t.completed).length
);

const hasCompleted = $(() => completedCount() > 0);

// Actions
const addTodo = () => {
  const text = newTodoText().trim();
  if (text) {
    todos([
      ...todos(),
      {
        id: Date.now(),
        text,
        completed: false
      }
    ]);
    newTodoText('');
  }
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
};

const clearCompleted = () => {
  todos(todos().filter(todo => !todo.completed));
};

const toggleAll = () => {
  const allCompleted = activeCount() === 0;
  todos(todos().map(todo => ({
    ...todo,
    completed: !allCompleted
  })));
};
```

### Shopping Cart

```javascript
import { $ } from 'sigpro';

// Products catalog
const products = $([
  { id: 1, name: 'Laptop', price: 999, stock: 5 },
  { id: 2, name: 'Mouse', price: 29, stock: 20 },
  { id: 3, name: 'Keyboard', price: 79, stock: 10 },
  { id: 4, name: 'Monitor', price: 299, stock: 3 }
]);

// Cart state
const cart = $({});
const selectedProduct = $(null);
const quantity = $(1);

// Computed cart values
const cartItems = $(() => {
  const items = [];
  Object.entries(cart()).forEach(([productId, qty]) => {
    const product = products().find(p => p.id === parseInt(productId));
    if (product) {
      items.push({
        ...product,
        quantity: qty,
        subtotal: product.price * qty
      });
    }
  });
  return items;
});

const itemCount = $(() => 
  cartItems().reduce((sum, item) => sum + item.quantity, 0)
);

const subtotal = $(() => 
  cartItems().reduce((sum, item) => sum + item.subtotal, 0)
);

const tax = $(() => subtotal() * 0.10);
const shipping = $(() => subtotal() > 100 ? 0 : 10);
const total = $(() => subtotal() + tax() + shipping());

const isCartEmpty = $(() => itemCount() === 0);

// Cart actions
const addToCart = (product, qty = 1) => {
  const currentQty = cart()[product.id] || 0;
  const newQty = currentQty + qty;
  
  if (newQty <= product.stock) {
    cart({
      ...cart(),
      [product.id]: newQty
    });
    return true;
  }
  return false;
};

const updateQuantity = (productId, newQty) => {
  const product = products().find(p => p.id === productId);
  if (newQty <= product.stock) {
    if (newQty <= 0) {
      removeFromCart(productId);
    } else {
      cart({
        ...cart(),
        [productId]: newQty
      });
    }
  }
};

const removeFromCart = (productId) => {
  const newCart = { ...cart() };
  delete newCart[productId];
  cart(newCart);
};

const clearCart = () => cart({});

// Stock management
const productStock = (productId) => {
  const product = products().find(p => p.id === productId);
  if (!product) return 0;
  const inCart = cart()[productId] || 0;
  return product.stock - inCart;
};

const isInStock = (productId, qty = 1) => {
  return productStock(productId) >= qty;
};
```

## 📈 Debugging Signals

### Logging Signal Changes

```javascript
import { $ } from 'sigpro';

// Wrap a signal to log changes
const withLogging = (signal, name) => {
  return (...args) => {
    if (args.length) {
      const oldValue = signal();
      const result = signal(...args);
      console.log(`${name}:`, oldValue, '->', signal());
      return result;
    }
    return signal();
  };
};

// Usage
const count = withLogging($(0), 'count');
count(5); // Logs: "count: 0 -> 5"
```

### Signal Inspector

```javascript
import { $ } from 'sigpro';

// Create an inspectable signal
const createInspector = () => {
  const signals = new Map();
  
  const createSignal = (initialValue, name) => {
    const signal = $(initialValue);
    signals.set(signal, { name, subscribers: new Set() });
    
    // Wrap to track subscribers
    const wrapped = (...args) => {
      if (!args.length && activeEffect) {
        const info = signals.get(wrapped);
        info.subscribers.add(activeEffect);
      }
      return signal(...args);
    };
    
    return wrapped;
  };
  
  const getInfo = () => {
    const info = {};
    signals.forEach((data, signal) => {
      info[data.name] = {
        subscribers: data.subscribers.size,
        value: signal()
      };
    });
    return info;
  };
  
  return { createSignal, getInfo };
};

// Usage
const inspector = createInspector();
const count = inspector.createSignal(0, 'count');
const doubled = inspector.createSignal(() => count() * 2, 'doubled');

console.log(inspector.getInfo());
// { count: { subscribers: 0, value: 0 }, doubled: { subscribers: 0, value: 0 } }
```

## 📊 Summary

| Feature | Description |
|---------|-------------|
| **Basic Signals** | Hold values and notify on change |
| **Computed Signals** | Auto-updating derived values |
| **Automatic Tracking** | Dependencies tracked automatically |
| **Batch Updates** | Multiple updates batched in microtask |
| **Infinite Loop Protection** | Prevents reactive cycles |
| **Zero Dependencies** | Pure vanilla JavaScript |

---

> **Pro Tip:** Signals are the foundation of reactivity in SigPro. Master them, and you've mastered 80% of the library!
