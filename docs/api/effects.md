# Effects API 🔄

Effects are the bridge between reactive signals and side effects in your application. They automatically track signal dependencies and re-run whenever those signals change, enabling everything from DOM updates to data fetching and localStorage synchronization.

## Core Concepts

### What is an Effect?

An effect is a function that:
- **Runs immediately** when created
- **Tracks all signals** read during its execution
- **Re-runs automatically** when any tracked signal changes
- **Can return a cleanup function** that runs before the next execution or when the effect is stopped

### How Effects Work

1. When an effect runs, it sets itself as the `activeEffect`
2. Any signal read during execution adds the effect to its subscribers
3. When a signal changes, it queues all its subscribers
4. Effects are batched and run in the next microtask
5. If an effect returns a function, it's stored as a cleanup handler

## `$.effect(effectFn)`

Creates a reactive effect that automatically tracks dependencies and re-runs when they change.

```javascript
import { $ } from 'sigpro';

const count = $(0);

$.effect(() => {
  console.log(`Count is: ${count()}`);
});
// Logs: "Count is: 0"

count(1);
// Logs: "Count is: 1"
```

## 📋 API Reference

| Pattern | Example | Description |
|---------|---------|-------------|
| Basic Effect | `$.effect(() => console.log(count()))` | Run on dependency changes |
| With Cleanup | `$.effect(() => { timer = setInterval(...); return () => clearInterval(timer) })` | Return cleanup function |
| Stop Effect | `const stop = $.effect(...); stop()` | Manually stop an effect |

### Effect Object (Internal)

| Property/Method | Description |
|-----------------|-------------|
| `dependencies` | Set of signal subscriber sets this effect belongs to |
| `cleanupHandlers` | Set of cleanup functions to run before next execution |
| `run()` | Executes the effect and tracks dependencies |
| `stop()` | Stops the effect and runs all cleanup handlers |

## 🎯 Basic Examples

### Console Logging

```javascript
import { $ } from 'sigpro';

const name = $('World');
const count = $(0);

$.effect(() => {
  console.log(`Hello ${name()}! Count is ${count()}`);
});
// Logs: "Hello World! Count is 0"

name('John');
// Logs: "Hello John! Count is 0"

count(5);
// Logs: "Hello John! Count is 5"
```

### DOM Updates

```javascript
import { $ } from 'sigpro';

const count = $(0);
const element = document.getElementById('counter');

$.effect(() => {
  element.textContent = `Count: ${count()}`;
});

// Updates DOM automatically when count changes
count(10); // Element text becomes "Count: 10"
```

### Document Title

```javascript
import { $ } from 'sigpro';

const page = $('home');
const unreadCount = $(0);

$.effect(() => {
  const base = page() === 'home' ? 'Home' : 'Dashboard';
  const unread = unreadCount() > 0 ? ` (${unreadCount()})` : '';
  document.title = `${base}${unread} - My App`;
});

page('dashboard'); // Title: "Dashboard - My App"
unreadCount(3);    // Title: "Dashboard (3) - My App"
```

## 🧹 Effects with Cleanup

Cleanup functions are essential for managing resources like intervals, event listeners, and subscriptions.

### Basic Cleanup

```javascript
import { $ } from 'sigpro';

const userId = $(1);

$.effect(() => {
  const id = userId();
  console.log(`Setting up timer for user ${id}`);
  
  const timer = setInterval(() => {
    console.log(`Polling user ${id}...`);
  }, 1000);
  
  // Cleanup runs before next effect execution
  return () => {
    console.log(`Cleaning up timer for user ${id}`);
    clearInterval(timer);
  };
});
// Sets up timer for user 1

userId(2);
// Cleans up timer for user 1
// Sets up timer for user 2
```

### Event Listener Cleanup

```javascript
import { $ } from 'sigpro';

const isListening = $(false);

$.effect(() => {
  if (!isListening()) return;
  
  const handleClick = (e) => {
    console.log('Window clicked:', e.clientX, e.clientY);
  };
  
  window.addEventListener('click', handleClick);
  console.log('Click listener added');
  
  return () => {
    window.removeEventListener('click', handleClick);
    console.log('Click listener removed');
  };
});

isListening(true);  // Adds listener
isListening(false); // Removes listener
isListening(true);  // Adds listener again
```

### WebSocket Connection

```javascript
import { $ } from 'sigpro';

const room = $('general');
const messages = $([]);

$.effect(() => {
  const currentRoom = room();
  console.log(`Connecting to room: ${currentRoom}`);
  
  const ws = new WebSocket(`wss://chat.example.com/${currentRoom}`);
  
  ws.onmessage = (event) => {
    messages([...messages(), JSON.parse(event.data)]);
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  // Cleanup: close connection when room changes
  return () => {
    console.log(`Disconnecting from room: ${currentRoom}`);
    ws.close();
  };
});

room('random'); // Closes 'general' connection, opens 'random'
```

## ⏱️ Effect Timing and Batching

### Microtask Batching

Effects are batched using `queueMicrotask` for optimal performance:

```javascript
import { $ } from 'sigpro';

const a = $(1);
const b = $(2);
const c = $(3);

$.effect(() => {
  console.log('Effect ran with:', a(), b(), c());
});
// Logs immediately: "Effect ran with: 1 2 3"

// Multiple updates in same tick - only one effect run!
a(10);
b(20);
c(30);
// Only logs once: "Effect ran with: 10 20 30"
```

### Async Effects

Effects can be asynchronous, but be careful with dependency tracking:

```javascript
import { $ } from 'sigpro';

const userId = $(1);
const userData = $(null);

$.effect(() => {
  const id = userId();
  console.log(`Fetching user ${id}...`);
  
  // Only id() is tracked (synchronous part)
  fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(data => {
      // This runs later - no dependency tracking here!
      userData(data);
    });
});

userId(2); // Triggers effect again, cancels previous fetch
```

### Effect with AbortController

For proper async cleanup with fetch:

```javascript
import { $ } from 'sigpro';

const userId = $(1);
const userData = $(null);
const loading = $(false);

$.effect(() => {
  const id = userId();
  const controller = new AbortController();
  
  loading(true);
  
  fetch(`/api/users/${id}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      userData(data);
      loading(false);
    })
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error('Fetch error:', err);
        loading(false);
      }
    });
  
  // Cleanup: abort fetch if userId changes before completion
  return () => {
    controller.abort();
  };
});
```

## 🎨 Advanced Effect Patterns

### Debounced Effects

```javascript
import { $ } from 'sigpro';

const searchTerm = $('');
const results = $([]);
let debounceTimeout;

$.effect(() => {
  const term = searchTerm();
  
  // Clear previous timeout
  clearTimeout(debounceTimeout);
  
  // Don't search if term is too short
  if (term.length < 3) {
    results([]);
    return;
  }
  
  // Debounce search
  debounceTimeout = setTimeout(async () => {
    console.log('Searching for:', term);
    const data = await fetch(`/api/search?q=${term}`).then(r => r.json());
    results(data);
  }, 300);
  
  // Cleanup on effect re-run
  return () => clearTimeout(debounceTimeout);
});
```

### Throttled Effects

```javascript
import { $ } from 'sigpro';

const scrollPosition = $(0);
let lastRun = 0;
let rafId = null;

$.effect(() => {
  const pos = scrollPosition();
  
  // Throttle with requestAnimationFrame
  if (rafId) cancelAnimationFrame(rafId);
  
  rafId = requestAnimationFrame(() => {
    console.log('Scroll position:', pos);
    updateScrollUI(pos);
    lastRun = Date.now();
    rafId = null;
  });
  
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };
});

// Even with many updates, effect runs at most once per frame
for (let i = 0; i < 100; i++) {
  scrollPosition(i);
}
```

### Conditional Effects

```javascript
import { $ } from 'sigpro';

const isEnabled = $(false);
const value = $(0);
const threshold = $(10);

$.effect(() => {
  // Effect only runs when isEnabled is true
  if (!isEnabled()) return;
  
  console.log(`Monitoring value: ${value()}, threshold: ${threshold()}`);
  
  if (value() > threshold()) {
    alert(`Value ${value()} exceeded threshold ${threshold()}!`);
  }
});

isEnabled(true);  // Effect starts monitoring
value(15);        // Triggers alert
isEnabled(false); // Effect stops (still runs, but condition prevents logic)
```

### Effect with Multiple Cleanups

```javascript
import { $ } from 'sigpro';

const config = $({ theme: 'light', notifications: true });

$.effect(() => {
  const { theme, notifications } = config();
  const cleanups = [];
  
  // Setup theme
  document.body.className = `theme-${theme}`;
  cleanups.push(() => {
    document.body.classList.remove(`theme-${theme}`);
  });
  
  // Setup notifications
  if (notifications) {
    const handler = (e) => console.log('Notification:', e.detail);
    window.addEventListener('notification', handler);
    cleanups.push(() => {
      window.removeEventListener('notification', handler);
    });
  }
  
  // Return combined cleanup
  return () => {
    cleanups.forEach(cleanup => cleanup());
  };
});
```

## 🎯 Effects in Components

### Component Lifecycle

```javascript
import { $, html } from 'sigpro';

$.component('timer-display', () => {
  const seconds = $(0);
  
  // Effect for timer - automatically cleaned up when component unmounts
  $.effect(() => {
    const interval = setInterval(() => {
      seconds(s => s + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  });
  
  return html`
    <div>
      <h2>Timer: ${seconds}s</h2>
    </div>
  `;
});
```

### Effects with Props

```javascript
import { $, html } from 'sigpro';

$.component('data-viewer', (props) => {
  const data = $(null);
  const error = $(null);
  
  // Effect reacts to prop changes
  $.effect(() => {
    const url = props.url();
    if (!url) return;
    
    const controller = new AbortController();
    
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(data)
      .catch(err => {
        if (err.name !== 'AbortError') {
          error(err.message);
        }
      });
    
    return () => controller.abort();
  });
  
  return html`
    <div>
      ${() => {
        if (error()) return html`<div class="error">${error()}</div>`;
        if (!data()) return html`<div>Loading...</div>`;
        return html`<pre>${JSON.stringify(data(), null, 2)}</pre>`;
      }}
    </div>
  `;
}, ['url']);
```

## 🔧 Effect Management

### Stopping Effects

```javascript
import { $ } from 'sigpro';

const count = $(0);

// Start effect
const stopEffect = $.effect(() => {
  console.log('Count:', count());
});

count(1); // Logs: "Count: 1"
count(2); // Logs: "Count: 2"

// Stop the effect
stopEffect();

count(3); // No logging - effect is stopped
```

### Conditional Effect Stopping

```javascript
import { $ } from 'sigpro';

const isActive = $(true);
const count = $(0);

let currentEffect = null;

$.effect(() => {
  if (isActive()) {
    // Start or restart the monitoring effect
    if (currentEffect) currentEffect();
    
    currentEffect = $.effect(() => {
      console.log('Monitoring count:', count());
    });
  } else {
    // Stop monitoring
    if (currentEffect) {
      currentEffect();
      currentEffect = null;
    }
  }
});
```

### Nested Effects

```javascript
import { $ } from 'sigpro';

const user = $({ id: 1, name: 'John' });
const settings = $({ theme: 'dark' });

$.effect(() => {
  console.log('User changed:', user().name);
  
  // Nested effect - tracks settings independently
  $.effect(() => {
    console.log('Settings changed:', settings().theme);
  });
  
  // When user changes, the nested effect is recreated
});
```

## 🚀 Real-World Examples

### Auto-saving Form

```javascript
import { $ } from 'sigpro';

const formData = $({
  title: '',
  content: '',
  tags: []
});

const lastSaved = $(null);
const saveStatus = $('idle'); // 'idle', 'saving', 'saved', 'error'
let saveTimeout;

$.effect(() => {
  const data = formData();
  
  // Clear previous timeout
  clearTimeout(saveTimeout);
  
  // Don't save empty form
  if (!data.title && !data.content) {
    saveStatus('idle');
    return;
  }
  
  saveStatus('saving');
  
  // Debounce save
  saveTimeout = setTimeout(async () => {
    try {
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      saveStatus('saved');
      lastSaved(new Date());
    } catch (error) {
      saveStatus('error');
      console.error('Auto-save failed:', error);
    }
  }, 1000);
  
  return () => clearTimeout(saveTimeout);
});

// UI feedback
const statusMessage = $(() => {
  const status = saveStatus();
  const saved = lastSaved();
  
  if (status === 'saving') return 'Saving...';
  if (status === 'error') return 'Save failed';
  if (status === 'saved' && saved) {
    return `Last saved: ${saved().toLocaleTimeString()}`;
  }
  return '';
});
```

### Real-time Search with Debounce

```javascript
import { $ } from 'sigpro';

const searchInput = $('');
const searchResults = $([]);
const searchStatus = $('idle'); // 'idle', 'searching', 'results', 'no-results', 'error'
let searchTimeout;
let abortController = null;

$.effect(() => {
  const query = searchInput().trim();
  
  // Clear previous timeout
  clearTimeout(searchTimeout);
  
  // Cancel previous request
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  
  // Don't search for short queries
  if (query.length < 2) {
    searchResults([]);
    searchStatus('idle');
    return;
  }
  
  searchStatus('searching');
  
  // Debounce search
  searchTimeout = setTimeout(async () => {
    abortController = new AbortController();
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal: abortController.signal
      });
      
      const data = await response.json();
      
      if (!abortController.signal.aborted) {
        searchResults(data);
        searchStatus(data.length ? 'results' : 'no-results');
        abortController = null;
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search failed:', error);
        searchStatus('error');
      }
    }
  }, 300);
  
  return () => {
    clearTimeout(searchTimeout);
    if (abortController) {
      abortController.abort();
      abortController = null;
    }
  };
});
```

### Analytics Tracking

```javascript
import { $ } from 'sigpro';

// Analytics configuration
const analyticsEnabled = $(true);
const currentPage = $('/');
const userProperties = $({});

// Track page views
$.effect(() => {
  if (!analyticsEnabled()) return;
  
  const page = currentPage();
  const properties = userProperties();
  
  console.log('Track page view:', page, properties);
  
  // Send to analytics
  gtag('config', 'GA-MEASUREMENT-ID', {
    page_path: page,
    ...properties
  });
});

// Track user interactions
const trackEvent = (eventName, properties = {}) => {
  $.effect(() => {
    if (!analyticsEnabled()) return;
    
    console.log('Track event:', eventName, properties);
    gtag('event', eventName, properties);
  });
};

// Usage
currentPage('/dashboard');
userProperties({ userId: 123, plan: 'premium' });
trackEvent('button_click', { buttonId: 'signup' });
```

### Keyboard Shortcuts

```javascript
import { $ } from 'sigpro';

const shortcuts = $({
  'ctrl+s': { handler: null, description: 'Save' },
  'ctrl+z': { handler: null, description: 'Undo' },
  'ctrl+shift+z': { handler: null, description: 'Redo' },
  'escape': { handler: null, description: 'Close modal' }
});

const pressedKeys = new Set();

$.effect(() => {
  const handleKeyDown = (e) => {
    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey ? 'ctrl+' : '';
    const shift = e.shiftKey ? 'shift+' : '';
    const alt = e.altKey ? 'alt+' : '';
    const meta = e.metaKey ? 'meta+' : '';
    
    const combo = `${ctrl}${shift}${alt}${meta}${key}`.replace(/\+$/, '');
    
    const shortcut = shortcuts()[combo];
    if (shortcut?.handler) {
      e.preventDefault();
      shortcut.handler();
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  
  return () => window.removeEventListener('keydown', handleKeyDown);
});

// Register shortcuts
shortcuts({
  ...shortcuts(),
  'ctrl+s': {
    handler: () => saveDocument(),
    description: 'Save document'
  },
  'ctrl+z': {
    handler: () => undo(),
    description: 'Undo'
  }
});
```

### Infinite Scroll

```javascript
import { $ } from 'sigpro';

const posts = $([]);
const page = $(1);
const hasMore = $(true);
const loading = $(false);
let observer = null;

// Load more posts
const loadMore = async () => {
  if (loading() || !hasMore()) return;
  
  loading(true);
  try {
    const response = await fetch(`/api/posts?page=${page()}`);
    const newPosts = await response.json();
    
    if (newPosts.length === 0) {
      hasMore(false);
    } else {
      posts([...posts(), ...newPosts]);
      page(p => p + 1);
    }
  } finally {
    loading(false);
  }
};

// Setup intersection observer for infinite scroll
$.effect(() => {
  const sentinel = document.getElementById('sentinel');
  if (!sentinel) return;
  
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loading() && hasMore()) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );
  
  observer.observe(sentinel);
  
  return () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  };
});

// Initial load
loadMore();
```

## 📊 Performance Considerations

| Pattern | Performance Impact | Best Practice |
|---------|-------------------|---------------|
| Multiple signal reads | O(n) per effect | Group related signals |
| Deep object access | Minimal | Use computed signals |
| Large arrays | O(n) for iteration | Memoize with computed |
| Frequent updates | Batched | Let batching work |
| Heavy computations | Blocking | Use Web Workers |

## 🎯 Best Practices

### 1. Keep Effects Focused

```javascript
// ❌ Avoid doing too much in one effect
$.effect(() => {
  updateUI(count());           // UI update
  saveToStorage(count());      // Storage
  sendAnalytics(count());      // Analytics
  validate(count());           // Validation
});

// ✅ Split into focused effects
$.effect(() => updateUI(count()));
$.effect(() => saveToStorage(count()));
$.effect(() => sendAnalytics(count()));
$.effect(() => validate(count()));
```

### 2. Always Clean Up

```javascript
// ❌ Missing cleanup
$.effect(() => {
  const timer = setInterval(() => {}, 1000);
  // Memory leak!
});

// ✅ Proper cleanup
$.effect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
});
```

### 3. Avoid Writing to Signals in Effects

```javascript
import { $ } from 'sigpro';

const a = $(1);
const b = $(2);

// ❌ Avoid - can cause loops
$.effect(() => {
  a(b()); // Writing to a while reading b
});

// ✅ Use computed signals instead
const sum = $(() => a() + b());
```

### 4. Use Conditional Logic Carefully

```javascript
// ❌ Condition affects dependency tracking
$.effect(() => {
  if (condition()) {
    console.log(a()); // Only tracks a when condition is true
  }
});

// ✅ Track all dependencies explicitly
$.effect(() => {
  const cond = condition(); // Track condition
  if (cond) {
    console.log(a()); // Track a
  }
});
```

### 5. Memoize Expensive Computations

```javascript
import { $ } from 'sigpro';

const items = $([]);

// ❌ Expensive computation runs on every effect
$.effect(() => {
  const total = items().reduce((sum, i) => sum + i.price, 0);
  updateTotal(total);
});

// ✅ Memoize with computed signal
const total = $(() => items().reduce((sum, i) => sum + i.price, 0));
$.effect(() => updateTotal(total()));
```

## 🔍 Debugging Effects

### Logging Effect Runs

```javascript
import { $ } from 'sigpro';

const withLogging = (effectFn, name) => {
  return $.effect(() => {
    console.log(`[${name}] Running...`);
    const start = performance.now();
    
    const result = effectFn();
    
    const duration = performance.now() - start;
    console.log(`[${name}] Completed in ${duration.toFixed(2)}ms`);
    
    return result;
  });
};

// Usage
withLogging(() => {
  console.log('Count:', count());
}, 'count-effect');
```

### Effect Inspector

```javascript
import { $ } from 'sigpro';

const createEffectInspector = () => {
  const effects = new Map();
  let id = 0;
  
  const trackedEffect = (fn, name = `effect-${++id}`) => {
    const info = {
      name,
      runs: 0,
      lastRun: null,
      duration: 0,
      dependencies: new Set()
    };
    
    const wrapped = () => {
      info.runs++;
      info.lastRun = new Date();
      const start = performance.now();
      
      const result = fn();
      
      info.duration = performance.now() - start;
      return result;
    };
    
    const stop = $.effect(wrapped);
    effects.set(stop, info);
    
    return stop;
  };
  
  const getReport = () => {
    const report = {};
    effects.forEach((info, stop) => {
      report[info.name] = {
        runs: info.runs,
        lastRun: info.lastRun,
        avgDuration: info.duration / info.runs
      };
    });
    return report;
  };
  
  return { trackedEffect, getReport };
};

// Usage
const inspector = createEffectInspector();
inspector.trackedEffect(() => {
  console.log('Count:', count());
}, 'counter-effect');
```

## 📊 Summary

| Feature | Description |
|---------|-------------|
| **Automatic Tracking** | Dependencies tracked automatically |
| **Cleanup Functions** | Return function to clean up resources |
| **Batch Updates** | Multiple changes batched in microtask |
| **Manual Stop** | Can stop effects with returned function |
| **Nested Effects** | Effects can contain other effects |
| **Auto-cleanup** | Effects in pages/components auto-cleaned |

---

> **Pro Tip:** Effects are the perfect place for side effects like DOM updates, data fetching, and subscriptions. Keep them focused and always clean up resources!
