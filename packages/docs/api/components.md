# Components API 🧩

Components in SigPro are native Web Components built on the Custom Elements standard. They provide a way to create reusable, encapsulated pieces of UI with reactive properties and automatic cleanup.

## `$.component(tagName, setupFunction, observedAttributes, useShadowDOM)`

Creates a custom element with reactive properties and automatic dependency tracking.

```javascript
import { $, html } from 'sigpro';

$.component('my-button', (props, { slot, emit }) => {
  return html`
    <button 
      class="btn"
      @click=${() => emit('click')}
    >
      ${slot()}
    </button>
  `;
}, ['variant']); // Observe the 'variant' attribute
```

## 📋 API Reference

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `tagName` | `string` | required | Custom element tag name (must include a hyphen, e.g., `my-button`) |
| `setupFunction` | `Function` | required | Function that returns the component's template |
| `observedAttributes` | `string[]` | `[]` | Attributes to observe for changes (become reactive props) |
| `useShadowDOM` | `boolean` | `false` | `true` = Shadow DOM (encapsulated), `false` = Light DOM (inherits styles) |

### Setup Function Parameters

The setup function receives two arguments:

1. **`props`** - Object containing reactive signals for each observed attribute
2. **`context`** - Object with helper methods and properties

#### Context Object Properties

| Property | Type | Description |
|----------|------|-------------|
| `slot(name)` | `Function` | Returns array of child nodes for the specified slot |
| `emit(name, detail)` | `Function` | Dispatches a custom event |
| `select(selector)` | `Function` | Query selector within component's root |
| `selectAll(selector)` | `Function` | Query selector all within component's root |
| `host` | `HTMLElement` | Reference to the custom element instance |
| `root` | `Node` | Component's root (shadow root or element itself) |
| `onUnmount(callback)` | `Function` | Register cleanup function |

## 🏠 Light DOM vs Shadow DOM

### Light DOM (`useShadowDOM = false`) - Default

The component **inherits global styles** from the application. Perfect for components that should integrate with your site's design system.

```javascript
// Button that uses global Tailwind CSS
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
}, ['variant']);
```

### Shadow DOM (`useShadowDOM = true`) - Encapsulated

The component **encapsulates its styles** completely. External styles don't affect it, and its styles don't leak out.

```javascript
// Calendar with encapsulated styles
$.component('ui-calendar', (props) => {
  return html`
    <style>
      /* These styles won't affect the rest of the page */
      .calendar {
        font-family: system-ui, sans-serif;
        background: white;
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .day {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 50%;
      }
      .day.selected {
        background: #2196f3;
        color: white;
      }
    </style>
    
    <div class="calendar">
      ${renderCalendar(props.date())}
    </div>
  `;
}, ['date'], true); // true = use Shadow DOM
```

## 🎯 Basic Examples

### Simple Counter Component

```javascript
// counter.js
$.component('my-counter', (props) => {
  const count = $(0);
  
  return html`
    <div class="counter">
      <p>Count: ${count}</p>
      <button @click=${() => count(c => c + 1)}>+</button>
      <button @click=${() => count(c => c - 1)}>-</button>
      <button @click=${() => count(0)}>Reset</button>
    </div>
  `;
});
```

**Usage:**
```html
<my-counter></my-counter>
```

### Component with Props

```javascript
// greeting.js
$.component('my-greeting', (props) => {
  const name = props.name() || 'World';
  const greeting = $(() => `Hello, ${name}!`);
  
  return html`
    <div class="greeting">
      <h1>${greeting}</h1>
      <p>This is a greeting component.</p>
    </div>
  `;
}, ['name']); // Observe the 'name' attribute
```

**Usage:**
```html
<my-greeting name="John"></my-greeting>
<my-greeting name="Jane"></my-greeting>
```

### Component with Events

```javascript
// toggle.js
$.component('my-toggle', (props, { emit }) => {
  const isOn = $(props.initial() === 'on');
  
  const toggle = () => {
    isOn(!isOn());
    emit('toggle', { isOn: isOn() });
    emit(isOn() ? 'on' : 'off');
  };
  
  return html`
    <button 
      class="toggle ${() => isOn() ? 'active' : ''}"
      @click=${toggle}
    >
      ${() => isOn() ? 'ON' : 'OFF'}
    </button>
  `;
}, ['initial']);
```

**Usage:**
```html
<my-toggle 
  initial="off"
  @toggle=${(e) => console.log('Toggled:', e.detail)}
  @on=${() => console.log('Turned on')}
  @off=${() => console.log('Turned off')}
></my-toggle>
```

## 🎨 Advanced Examples

### Form Input Component

```javascript
// form-input.js
$.component('form-input', (props, { emit }) => {
  const value = $(props.value() || '');
  const error = $(null);
  const touched = $(false);
  
  // Validation effect
  $.effect(() => {
    if (props.pattern() && touched()) {
      const regex = new RegExp(props.pattern());
      const isValid = regex.test(value());
      error(isValid ? null : props.errorMessage() || 'Invalid input');
      emit('validate', { isValid, value: value() });
    }
  });
  
  const handleInput = (e) => {
    value(e.target.value);
    emit('update', e.target.value);
  };
  
  const handleBlur = () => {
    touched(true);
  };
  
  return html`
    <div class="form-group">
      ${props.label() ? html`
        <label class="form-label">
          ${props.label()}
          ${props.required() ? html`<span class="required">*</span>` : ''}
        </label>
      ` : ''}
      
      <input
        type="${props.type() || 'text'}"
        class="form-control ${() => error() ? 'is-invalid' : ''}"
        :value=${value}
        @input=${handleInput}
        @blur=${handleBlur}
        placeholder="${props.placeholder() || ''}"
        ?disabled=${props.disabled}
        ?required=${props.required}
      />
      
      ${() => error() ? html`
        <div class="error-message">${error()}</div>
      ` : ''}
      
      ${props.helpText() ? html`
        <small class="help-text">${props.helpText()}</small>
      ` : ''}
    </div>
  `;
}, ['label', 'type', 'value', 'placeholder', 'disabled', 'required', 'pattern', 'errorMessage', 'helpText']);
```

**Usage:**
```html
<form-input
  label="Email"
  type="email"
  required
  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
  errorMessage="Please enter a valid email"
  @update=${(e) => formData.email = e.detail}
  @validate=${(e) => setEmailValid(e.detail.isValid)}
>
</form-input>
```

### Modal/Dialog Component

```javascript
// modal.js
$.component('my-modal', (props, { slot, emit, onUnmount }) => {
  const isOpen = $(false);
  
  // Handle escape key
  const handleKeydown = (e) => {
    if (e.key === 'Escape' && isOpen()) {
      close();
    }
  };
  
  $.effect(() => {
    if (isOpen()) {
      document.addEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = '';
    }
  });
  
  // Cleanup on unmount
  onUnmount(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
  });
  
  const open = () => {
    isOpen(true);
    emit('open');
  };
  
  const close = () => {
    isOpen(false);
    emit('close');
  };
  
  // Expose methods to parent
  props.open = open;
  props.close = close;
  
  return html`
    <div>
      <!-- Trigger button -->
      <button 
        class="modal-trigger"
        @click=${open}
      >
        ${slot('trigger') || 'Open Modal'}
      </button>
      
      <!-- Modal overlay -->
      ${() => isOpen() ? html`
        <div class="modal-overlay" @click=${close}>
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>${props.title() || 'Modal'}</h3>
              <button class="close-btn" @click=${close}>&times;</button>
            </div>
            <div class="modal-body">
              ${slot('body')}
            </div>
            <div class="modal-footer">
              ${slot('footer') || html`
                <button @click=${close}>Close</button>
              `}
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}, ['title'], false);
```

**Usage:**
```html
<my-modal title="Confirm Delete">
  <button slot="trigger">Delete Item</button>
  
  <div slot="body">
    <p>Are you sure you want to delete this item?</p>
    <p class="warning">This action cannot be undone.</p>
  </div>
  
  <div slot="footer">
    <button class="cancel" @click=${close}>Cancel</button>
    <button class="delete" @click=${handleDelete}>Delete</button>
  </div>
</my-modal>
```

### Data Table Component

```javascript
// data-table.js
$.component('data-table', (props, { emit }) => {
  const data = $(props.data() || []);
  const columns = $(props.columns() || []);
  const sortColumn = $(null);
  const sortDirection = $('asc');
  const filterText = $('');
  
  // Computed: filtered and sorted data
  const processedData = $(() => {
    let result = [...data()];
    
    // Filter
    if (filterText()) {
      const search = filterText().toLowerCase();
      result = result.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(search)
        )
      );
    }
    
    // Sort
    if (sortColumn()) {
      const col = sortColumn();
      const direction = sortDirection() === 'asc' ? 1 : -1;
      
      result.sort((a, b) => {
        if (a[col] < b[col]) return -direction;
        if (a[col] > b[col]) return direction;
        return 0;
      });
    }
    
    return result;
  });
  
  const handleSort = (col) => {
    if (sortColumn() === col) {
      sortDirection(sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      sortColumn(col);
      sortDirection('asc');
    }
    emit('sort', { column: col, direction: sortDirection() });
  };
  
  return html`
    <div class="data-table">
      <!-- Search input -->
      <div class="table-toolbar">
        <input
          type="search"
          :value=${filterText}
          placeholder="Search..."
          class="search-input"
        />
        <span class="record-count">
          ${() => `${processedData().length} of ${data().length} records`}
        </span>
      </div>
      
      <!-- Table -->
      <table>
        <thead>
          <tr>
            ${columns().map(col => html`
              <th 
                @click=${() => handleSort(col.field)}
                class:sortable=${true}
                class:sorted=${() => sortColumn() === col.field}
              >
                ${col.label}
                ${() => sortColumn() === col.field ? html`
                  <span class="sort-icon">
                    ${sortDirection() === 'asc' ? '↑' : '↓'}
                  </span>
                ` : ''}
              </th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${() => processedData().map(row => html`
            <tr @click=${() => emit('row-click', row)}>
              ${columns().map(col => html`
                <td>${row[col.field]}</td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
      
      <!-- Empty state -->
      ${() => processedData().length === 0 ? html`
        <div class="empty-state">
          No data found
        </div>
      ` : ''}
    </div>
  `;
}, ['data', 'columns']);
```

**Usage:**
```javascript
const userColumns = [
  { field: 'id', label: 'ID' },
  { field: 'name', label: 'Name' },
  { field: 'email', label: 'Email' },
  { field: 'role', label: 'Role' }
];

const userData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' }
];
```

```html
<data-table 
  .data=${userData}
  .columns=${userColumns}
  @row-click=${(e) => console.log('Row clicked:', e.detail)}
>
</data-table>
```

### Tabs Component

```javascript
// tabs.js
$.component('my-tabs', (props, { slot, emit }) => {
  const activeTab = $(props.active() || 0);
  
  // Get all tab headers from slots
  const tabs = $(() => {
    const headers = slot('tab');
    return headers.map((node, index) => ({
      index,
      title: node.textContent,
      content: slot(`panel-${index}`)[0]
    }));
  });
  
  $.effect(() => {
    emit('change', { index: activeTab(), tab: tabs()[activeTab()] });
  });
  
  return html`
    <div class="tabs">
      <div class="tab-headers">
        ${tabs().map(tab => html`
          <button
            class="tab-header ${() => activeTab() === tab.index ? 'active' : ''}"
            @click=${() => activeTab(tab.index)}
          >
            ${tab.title}
          </button>
        `)}
      </div>
      
      <div class="tab-panels">
        ${tabs().map(tab => html`
          <div 
            class="tab-panel"
            style="display: ${() => activeTab() === tab.index ? 'block' : 'none'}"
          >
            ${tab.content}
          </div>
        `)}
      </div>
    </div>
  `;
}, ['active']);
```

**Usage:**
```html
<my-tabs @change=${(e) => console.log('Tab changed:', e.detail)}>
  <div slot="tab">Profile</div>
  <div slot="panel-0">
    <h3>Profile Settings</h3>
    <form>...</form>
  </div>
  
  <div slot="tab">Security</div>
  <div slot="panel-1">
    <h3>Security Settings</h3>
    <form>...</form>
  </div>
  
  <div slot="tab">Notifications</div>
  <div slot="panel-2">
    <h3>Notification Preferences</h3>
    <form>...</form>
  </div>
</my-tabs>
```

### Component with External Data

```javascript
// user-profile.js
$.component('user-profile', (props, { emit, onUnmount }) => {
  const user = $(null);
  const loading = $(false);
  const error = $(null);
  
  // Fetch user data when userId changes
  $.effect(() => {
    const userId = props.userId();
    if (!userId) return;
    
    loading(true);
    error(null);
    
    const controller = new AbortController();
    
    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        user(data);
        emit('loaded', data);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          error(err.message);
          emit('error', err);
        }
      })
      .finally(() => loading(false));
    
    // Cleanup: abort fetch if component unmounts or userId changes
    onUnmount(() => controller.abort());
  });
  
  return html`
    <div class="user-profile">
      ${() => loading() ? html`
        <div class="spinner">Loading...</div>
      ` : error() ? html`
        <div class="error">Error: ${error()}</div>
      ` : user() ? html`
        <div class="user-info">
          <img src="${user().avatar}" class="avatar" />
          <h2>${user().name}</h2>
          <p>${user().email}</p>
          <p>Member since: ${new Date(user().joined).toLocaleDateString()}</p>
        </div>
      ` : html`
        <div class="no-user">No user selected</div>
      `}
    </div>
  `;
}, ['user-id']);
```

## 📦 Component Libraries

### Building a Reusable Component Library

```javascript
// components/index.js
import { $, html } from 'sigpro';

// Button component
export const Button = $.component('ui-button', (props, { slot, emit }) => {
  const variant = props.variant() || 'primary';
  const size = props.size() || 'md';
  
  const sizes = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variants = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white'
  };
  
  return html`
    <button
      class="rounded font-semibold transition-colors ${sizes[size]} ${variants[variant]}"
      ?disabled=${props.disabled}
      @click=${() => emit('click')}
    >
      ${slot()}
    </button>
  `;
}, ['variant', 'size', 'disabled']);

// Card component
export const Card = $.component('ui-card', (props, { slot }) => {
  return html`
    <div class="card border rounded-lg shadow-sm overflow-hidden">
      ${props.title() ? html`
        <div class="card-header bg-gray-50 px-4 py-3 border-b">
          <h3 class="font-semibold">${props.title()}</h3>
        </div>
      ` : ''}
      
      <div class="card-body p-4">
        ${slot()}
      </div>
      
      ${props.footer() ? html`
        <div class="card-footer bg-gray-50 px-4 py-3 border-t">
          ${slot('footer')}
        </div>
      ` : ''}
    </div>
  `;
}, ['title']);

// Badge component
export const Badge = $.component('ui-badge', (props, { slot }) => {
  const type = props.type() || 'default';
  
  const types = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return html`
    <span class="inline-block px-2 py-1 text-xs font-semibold rounded ${types[type]}">
      ${slot()}
    </span>
  `;
}, ['type']);

export { $, html };
```

**Usage:**
```javascript
import { Button, Card, Badge } from './components/index.js';

// Use components anywhere
const app = html`
  <div>
    <Card title="Welcome">
      <p>This is a card component</p>
      <div slot="footer">
        <Button variant="primary" @click=${handleClick}>
          Save Changes
        </Button>
        <Badge type="success">New</Badge>
      </div>
    </Card>
  </div>
`;
```

## 🎯 Decision Guide: Light DOM vs Shadow DOM

| Use Light DOM (`false`) when... | Use Shadow DOM (`true`) when... |
|--------------------------------|-------------------------------|
| Component is part of your main app | Building a UI library for others |
| Using global CSS (Tailwind, Bootstrap) | Creating embeddable widgets |
| Need to inherit theme variables | Styles must be pixel-perfect everywhere |
| Working with existing design system | Component has complex, specific styles |
| Quick prototyping | Distributing to different projects |
| Form elements that should match site | Need style isolation/encapsulation |

## 📊 Summary

| Feature | Description |
|---------|-------------|
| **Native Web Components** | Built on Custom Elements standard |
| **Reactive Props** | Observed attributes become signals |
| **Two Rendering Modes** | Light DOM (default) or Shadow DOM |
| **Automatic Cleanup** | Effects and listeners cleaned up on disconnect |
| **Event System** | Custom events with `emit()` |
| **Slot Support** | Full slot API for content projection |
| **Zero Dependencies** | Pure vanilla JavaScript |

---

> **Pro Tip:** Start with Light DOM components for app-specific UI, and use Shadow DOM when building components that need to work identically across different projects or websites.