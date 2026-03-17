# Fetch API 🌐

SigPro provides a simple, lightweight wrapper around the native Fetch API that integrates seamlessly with signals for loading state management. It's designed for common use cases with sensible defaults.

## Core Concepts

### What is `$.fetch`?

A ultra-simple fetch wrapper that:
- **Automatically handles JSON** serialization and parsing
- **Integrates with signals** for loading state
- **Returns `null` on error** (no try/catch needed for basic usage)
- **Works great with effects** for reactive data fetching

## `$.fetch(url, data, [loading])`

Makes a POST request with JSON data and optional loading signal.

```javascript
import { $ } from 'sigpro';

const loading = $(false);

async function loadUser() {
  const user = await $.fetch('/api/user', { id: 123 }, loading);
  if (user) {
    console.log('User loaded:', user);
  }
}
```

## 📋 API Reference

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | `string` | Endpoint URL |
| `data` | `Object` | Data to send (automatically JSON.stringify'd) |
| `loading` | `Function` (optional) | Signal function to track loading state |

### Returns

| Return | Description |
|--------|-------------|
| `Promise<Object\|null>` | Parsed JSON response or `null` on error |

## 🎯 Basic Examples

### Simple Data Fetching

```javascript
import { $ } from 'sigpro';

const userData = $(null);

async function fetchUser(id) {
  const data = await $.fetch('/api/user', { id });
  if (data) {
    userData(data);
  }
}

fetchUser(123);
```

### With Loading State

```javascript
import { $, html } from 'sigpro';

const user = $(null);
const loading = $(false);

async function loadUser(id) {
  const data = await $.fetch('/api/user', { id }, loading);
  if (data) user(data);
}

// In your template
html`
  <div>
    ${() => loading() ? html`
      <div class="spinner">Loading...</div>
    ` : user() ? html`
      <div>
        <h2>${user().name}</h2>
        <p>Email: ${user().email}</p>
      </div>
    ` : html`
      <p>No user found</p>
    `}
  </div>
`;
```

### In an Effect

```javascript
import { $ } from 'sigpro';

const userId = $(1);
const user = $(null);
const loading = $(false);

$.effect(() => {
  const id = userId();
  if (id) {
    $.fetch(`/api/users/${id}`, null, loading).then(data => {
      if (data) user(data);
    });
  }
});

userId(2); // Automatically fetches new user
```

## 🚀 Advanced Examples

### User Profile with Loading States

```javascript
import { $, html } from 'sigpro';

const Profile = () => {
  const userId = $(1);
  const user = $(null);
  const loading = $(false);
  const error = $(null);

  const fetchUser = async (id) => {
    error(null);
    const data = await $.fetch('/api/user', { id }, loading);
    if (data) {
      user(data);
    } else {
      error('Failed to load user');
    }
  };

  // Fetch when userId changes
  $.effect(() => {
    fetchUser(userId());
  });

  return html`
    <div class="profile">
      <div class="user-selector">
        <button @click=${() => userId(1)}>User 1</button>
        <button @click=${() => userId(2)}>User 2</button>
        <button @click=${() => userId(3)}>User 3</button>
      </div>

      ${() => {
        if (loading()) {
          return html`<div class="spinner">Loading profile...</div>`;
        }
        
        if (error()) {
          return html`<div class="error">${error()}</div>`;
        }
        
        if (user()) {
          return html`
            <div class="user-info">
              <h2>${user().name}</h2>
              <p>Email: ${user().email}</p>
              <p>Role: ${user().role}</p>
              <p>Joined: ${new Date(user().joined).toLocaleDateString()}</p>
            </div>
          `;
        }
        
        return html`<p>Select a user</p>`;
      }}
    </div>
  `;
};
```

### Todo List with API

```javascript
import { $, html } from 'sigpro';

const TodoApp = () => {
  const todos = $([]);
  const loading = $(false);
  const newTodo = $('');
  const filter = $('all'); // 'all', 'active', 'completed'

  // Load todos
  const loadTodos = async () => {
    const data = await $.fetch('/api/todos', {}, loading);
    if (data) todos(data);
  };

  // Add todo
  const addTodo = async () => {
    if (!newTodo().trim()) return;
    
    const todo = await $.fetch('/api/todos', {
      text: newTodo(),
      completed: false
    });
    
    if (todo) {
      todos([...todos(), todo]);
      newTodo('');
    }
  };

  // Toggle todo
  const toggleTodo = async (id, completed) => {
    const updated = await $.fetch(`/api/todos/${id}`, {
      completed: !completed
    });
    
    if (updated) {
      todos(todos().map(t => 
        t.id === id ? updated : t
      ));
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    const result = await $.fetch(`/api/todos/${id}/delete`, {});
    if (result) {
      todos(todos().filter(t => t.id !== id));
    }
  };

  // Filtered todos
  const filteredTodos = $(() => {
    const currentFilter = filter();
    if (currentFilter === 'all') return todos();
    if (currentFilter === 'active') {
      return todos().filter(t => !t.completed);
    }
    return todos().filter(t => t.completed);
  });

  // Load on mount
  loadTodos();

  return html`
    <div class="todo-app">
      <h1>Todo List</h1>
      
      <div class="add-todo">
        <input
          type="text"
          :value=${newTodo}
          @keydown.enter=${addTodo}
          placeholder="Add a new todo..."
        />
        <button @click=${addTodo}>Add</button>
      </div>
      
      <div class="filters">
        <button 
          class:active=${() => filter() === 'all'}
          @click=${() => filter('all')}
        >
          All
        </button>
        <button 
          class:active=${() => filter() === 'active'}
          @click=${() => filter('active')}
        >
          Active
        </button>
        <button 
          class:active=${() => filter() === 'completed'}
          @click=${() => filter('completed')}
        >
          Completed
        </button>
      </div>
      
      ${() => loading() ? html`
        <div class="spinner">Loading todos...</div>
      ) : html`
        <ul class="todo-list">
          ${filteredTodos().map(todo => html`
            <li class="todo-item">
              <input
                type="checkbox"
                :checked=${todo.completed}
                @change=${() => toggleTodo(todo.id, todo.completed)}
              />
              <span class:completed=${todo.completed}>${todo.text}</span>
              <button @click=${() => deleteTodo(todo.id)}>🗑️</button>
            </li>
          `)}
        </ul>
      `}
    </div>
  `;
};
```

### Infinite Scroll with Pagination

```javascript
import { $, html } from 'sigpro';

const InfiniteScroll = () => {
  const posts = $([]);
  const page = $(1);
  const loading = $(false);
  const hasMore = $(true);
  const error = $(null);

  const loadMore = async () => {
    if (loading() || !hasMore()) return;
    
    const data = await $.fetch('/api/posts', { 
      page: page(),
      limit: 10 
    }, loading);
    
    if (data) {
      if (data.posts.length === 0) {
        hasMore(false);
      } else {
        posts([...posts(), ...data.posts]);
        page(p => p + 1);
      }
    } else {
      error('Failed to load posts');
    }
  };

  // Intersection Observer for infinite scroll
  $.effect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    const sentinel = document.getElementById('sentinel');
    if (sentinel) observer.observe(sentinel);
    
    return () => observer.disconnect();
  });

  // Initial load
  loadMore();

  return html`
    <div class="infinite-scroll">
      <h1>Posts</h1>
      
      <div class="posts">
        ${posts().map(post => html`
          <article class="post">
            <h2>${post.title}</h2>
            <p>${post.body}</p>
            <small>By ${post.author}</small>
          </article>
        `)}
      </div>
      
      <div id="sentinel" class="sentinel">
        ${() => {
          if (loading()) {
            return html`<div class="spinner">Loading more...</div>`;
          }
          if (error()) {
            return html`<div class="error">${error()}</div>`;
          }
          if (!hasMore()) {
            return html`<div class="end">No more posts</div>`;
          }
          return '';
        }}
      </div>
    </div>
  `;
};
```

### Search with Debounce

```javascript
import { $, html } from 'sigpro';

const SearchComponent = () => {
  const query = $('');
  const results = $([]);
  const loading = $(false);
  const error = $(null);
  let searchTimeout;

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      results([]);
      return;
    }
    
    const data = await $.fetch('/api/search', { 
      q: searchQuery 
    }, loading);
    
    if (data) {
      results(data);
    } else {
      error('Search failed');
    }
  };

  // Debounced search
  $.effect(() => {
    const searchQuery = query();
    
    clearTimeout(searchTimeout);
    
    if (searchQuery.length < 2) {
      results([]);
      return;
    }
    
    searchTimeout = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);
    
    return () => clearTimeout(searchTimeout);
  });

  return html`
    <div class="search">
      <div class="search-box">
        <input
          type="search"
          :value=${query}
          placeholder="Search..."
          class="search-input"
        />
        ${() => loading() ? html`
          <span class="spinner-small">⌛</span>
        ) : ''}
      </div>
      
      ${() => {
        if (error()) {
          return html`<div class="error">${error()}</div>`;
        }
        
        if (results().length > 0) {
          return html`
            <ul class="results">
              ${results().map(item => html`
                <li class="result-item">
                  <h3>${item.title}</h3>
                  <p>${item.description}</p>
                </li>
              `)}
            </ul>
          `;
        }
        
        if (query().length >= 2 && !loading()) {
          return html`<p class="no-results">No results found</p>`;
        }
        
        return '';
      }}
    </div>
  `;
};
```

### Form Submission

```javascript
import { $, html } from 'sigpro';

const ContactForm = () => {
  const formData = $({
    name: '',
    email: '',
    message: ''
  });
  
  const submitting = $(false);
  const submitError = $(null);
  const submitSuccess = $(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    submitError(null);
    submitSuccess(false);
    
    const result = await $.fetch('/api/contact', formData(), submitting);
    
    if (result) {
      submitSuccess(true);
      formData({ name: '', email: '', message: '' });
    } else {
      submitError('Failed to send message. Please try again.');
    }
  };

  const updateField = (field, value) => {
    formData({
      ...formData(),
      [field]: value
    });
  };

  return html`
    <form class="contact-form" @submit=${handleSubmit}>
      <h2>Contact Us</h2>
      
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          type="text"
          id="name"
          :value=${() => formData().name}
          @input=${(e) => updateField('name', e.target.value)}
          required
          ?disabled=${submitting}
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          :value=${() => formData().email}
          @input=${(e) => updateField('email', e.target.value)}
          required
          ?disabled=${submitting}
        />
      </div>
      
      <div class="form-group">
        <label for="message">Message:</label>
        <textarea
          id="message"
          :value=${() => formData().message}
          @input=${(e) => updateField('message', e.target.value)}
          required
          rows="5"
          ?disabled=${submitting}
        ></textarea>
      </div>
      
      ${() => {
        if (submitting()) {
          return html`<div class="submitting">Sending...</div>`;
        }
        
        if (submitError()) {
          return html`<div class="error">${submitError()}</div>`;
        }
        
        if (submitSuccess()) {
          return html`<div class="success">Message sent successfully!</div>`;
        }
        
        return '';
      }}
      
      <button 
        type="submit" 
        ?disabled=${submitting}
      >
        Send Message
      </button>
    </form>
  `;
};
```

### Real-time Dashboard with Multiple Endpoints

```javascript
import { $, html } from 'sigpro';

const Dashboard = () => {
  // Multiple data streams
  const metrics = $({});
  const alerts = $([]);
  const logs = $([]);
  
  const loading = $({
    metrics: false,
    alerts: false,
    logs: false
  });

  const refreshInterval = $(5000); // 5 seconds

  const fetchMetrics = async () => {
    const data = await $.fetch('/api/metrics', {}, loading().metrics);
    if (data) metrics(data);
  };

  const fetchAlerts = async () => {
    const data = await $.fetch('/api/alerts', {}, loading().alerts);
    if (data) alerts(data);
  };

  const fetchLogs = async () => {
    const data = await $.fetch('/api/logs', { 
      limit: 50 
    }, loading().logs);
    if (data) logs(data);
  };

  // Auto-refresh all data
  $.effect(() => {
    fetchMetrics();
    fetchAlerts();
    fetchLogs();
    
    const interval = setInterval(() => {
      fetchMetrics();
      fetchAlerts();
    }, refreshInterval());
    
    return () => clearInterval(interval);
  });

  return html`
    <div class="dashboard">
      <header>
        <h1>System Dashboard</h1>
        <div class="refresh-control">
          <label>
            Refresh interval:
            <select :value=${refreshInterval} @change=${(e) => refreshInterval(parseInt(e.target.value))}>
              <option value="2000">2 seconds</option>
              <option value="5000">5 seconds</option>
              <option value="10000">10 seconds</option>
              <option value="30000">30 seconds</option>
            </select>
          </label>
        </div>
      </header>
      
      <div class="dashboard-grid">
        <!-- Metrics Panel -->
        <div class="panel metrics">
          <h2>System Metrics</h2>
          ${() => loading().metrics ? html`
            <div class="spinner">Loading metrics...</div>
          ) : html`
            <div class="metrics-grid">
              <div class="metric">
                <label>CPU</label>
                <span>${metrics().cpu || 0}%</span>
              </div>
              <div class="metric">
                <label>Memory</label>
                <span>${metrics().memory || 0}%</span>
              </div>
              <div class="metric">
                <label>Requests</label>
                <span>${metrics().requests || 0}/s</span>
              </div>
            </div>
          `}
        </div>
        
        <!-- Alerts Panel -->
        <div class="panel alerts">
          <h2>Active Alerts</h2>
          ${() => loading().alerts ? html`
            <div class="spinner">Loading alerts...</div>
          ) : alerts().length > 0 ? html`
            <ul>
              ${alerts().map(alert => html`
                <li class="alert ${alert.severity}">
                  <strong>${alert.type}</strong>
                  <p>${alert.message}</p>
                  <small>${new Date(alert.timestamp).toLocaleTimeString()}</small>
                </li>
              `)}
            </ul>
          ) : html`
            <p class="no-data">No active alerts</p>
          `}
        </div>
        
        <!-- Logs Panel -->
        <div class="panel logs">
          <h2>Recent Logs</h2>
          ${() => loading().logs ? html`
            <div class="spinner">Loading logs...</div>
          ) : html`
            <ul>
              ${logs().map(log => html`
                <li class="log ${log.level}">
                  <span class="timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span class="message">${log.message}</span>
                </li>
              `)}
            </ul>
          `}
        </div>
      </div>
    </div>
  `;
};
```

### File Upload

```javascript
import { $, html } from 'sigpro';

const FileUploader = () => {
  const files = $([]);
  const uploading = $(false);
  const uploadProgress = $({});
  const uploadResults = $([]);

  const handleFileSelect = (e) => {
    files([...e.target.files]);
  };

  const uploadFiles = async () => {
    if (files().length === 0) return;
    
    uploading(true);
    uploadResults([]);
    
    for (const file of files()) {
      const formData = new FormData();
      formData.append('file', file);
      
      // Track progress for this file
      uploadProgress({
        ...uploadProgress(),
        [file.name]: 0
      });
      
      try {
        // Custom fetch for FormData
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        uploadResults([
          ...uploadResults(),
          { file: file.name, success: true, result }
        ]);
      } catch (error) {
        uploadResults([
          ...uploadResults(),
          { file: file.name, success: false, error: error.message }
        ]);
      }
      
      uploadProgress({
        ...uploadProgress(),
        [file.name]: 100
      });
    }
    
    uploading(false);
  };

  return html`
    <div class="file-uploader">
      <h2>Upload Files</h2>
      
      <input
        type="file"
        multiple
        @change=${handleFileSelect}
        ?disabled=${uploading}
      />
      
      ${() => files().length > 0 ? html`
        <div class="file-list">
          <h3>Selected Files:</h3>
          <ul>
            ${files().map(file => html`
              <li>
                ${file.name} (${(file.size / 1024).toFixed(2)} KB)
                ${() => uploadProgress()[file.name] ? html`
                  <progress value="${uploadProgress()[file.name]}" max="100"></progress>
                ) : ''}
              </li>
            `)}
          </ul>
          
          <button 
            @click=${uploadFiles}
            ?disabled=${uploading}
          >
            ${() => uploading() ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      ` : ''}
      
      ${() => uploadResults().length > 0 ? html`
        <div class="upload-results">
          <h3>Upload Results:</h3>
          <ul>
            ${uploadResults().map(result => html`
              <li class="${result.success ? 'success' : 'error'}">
                ${result.file}: 
                ${result.success ? 'Uploaded successfully' : `Failed: ${result.error}`}
              </li>
            `)}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
};
```

### Retry Logic

```javascript
import { $ } from 'sigpro';

// Enhanced fetch with retry
const fetchWithRetry = async (url, data, loading, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (loading) loading(true);
      
      const result = await $.fetch(url, data);
      if (result !== null) {
        return result;
      }
      
      // If we get null but no error, wait and retry
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000) // Exponential backoff
        );
      }
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    } finally {
      if (attempt === maxRetries && loading) {
        loading(false);
      }
    }
  }
  
  console.error('All retry attempts failed:', lastError);
  return null;
};

// Usage
const loading = $(false);
const data = await fetchWithRetry('/api/unreliable-endpoint', {}, loading, 5);
```

## 🎯 Best Practices

### 1. Always Handle Null Responses

```javascript
// ❌ Don't assume success
const data = await $.fetch('/api/data');
console.log(data.property); // Might throw if data is null

// ✅ Check for null
const data = await $.fetch('/api/data');
if (data) {
  console.log(data.property);
} else {
  showError('Failed to load data');
}
```

### 2. Use with Effects for Reactivity

```javascript
// ❌ Manual fetching
button.addEventListener('click', async () => {
  const data = await $.fetch('/api/data');
  updateUI(data);
});

// ✅ Reactive fetching
const trigger = $(false);

$.effect(() => {
  if (trigger()) {
    $.fetch('/api/data').then(data => {
      if (data) updateUI(data);
    });
  }
});

trigger(true); // Triggers fetch
```

### 3. Combine with Loading Signals

```javascript
// ✅ Always show loading state
const loading = $(false);
const data = $(null);

async function load() {
  const result = await $.fetch('/api/data', {}, loading);
  if (result) data(result);
}

// In template
html`
  <div>
    ${() => loading() ? '<Spinner />' : 
      data() ? '<Data />' : 
      '<Empty />'}
  </div>
`;
```

### 4. Cancel In-flight Requests

```javascript
// ✅ Use AbortController with effects
let controller;

$.effect(() => {
  if (controller) {
    controller.abort();
  }
  
  controller = new AbortController();
  
  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      if (!controller.signal.aborted) {
        updateData(data);
      }
    });
  
  return () => controller.abort();
});
```

## 📊 Error Handling

### Basic Error Handling

```javascript
const data = await $.fetch('/api/data');
if (!data) {
  // Handle error (show message, retry, etc.)
}
```

### With Error Signal

```javascript
const data = $(null);
const error = $(null);
const loading = $(false);

async function loadData() {
  error(null);
  const result = await $.fetch('/api/data', {}, loading);
  
  if (result) {
    data(result);
  } else {
    error('Failed to load data');
  }
}
```
---

> **Pro Tip:** Combine `$.fetch` with `$.effect` and loading signals for a complete reactive data fetching solution. The loading signal integration makes it trivial to show loading states in your UI.
