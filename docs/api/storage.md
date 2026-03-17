# Storage API 💾

SigPro provides persistent signals that automatically synchronize with browser storage APIs. This allows you to create reactive state that survives page reloads and browser sessions with zero additional code.

## Core Concepts

### What is Persistent Storage?

Persistent signals are special signals that:
- **Initialize from storage** (localStorage/sessionStorage) if a saved value exists
- **Auto-save** whenever the signal value changes
- **Handle JSON serialization** automatically
- **Clean up** when set to `null` or `undefined`

### Storage Types

| Storage | Persistence | Use Case |
|---------|-------------|----------|
| `localStorage` | Forever (until cleared) | User preferences, themes, saved data |
| `sessionStorage` | Until tab/window closes | Form drafts, temporary state |

## `$.storage(key, initialValue, [storage])`

Creates a persistent signal that syncs with browser storage.

```javascript
import { $ } from 'sigpro';

// localStorage (default)
const theme = $.storage('theme', 'light');
const user = $.storage('user', null);
const settings = $.storage('settings', { notifications: true });

// sessionStorage
const draft = $.storage('draft', '', sessionStorage);
const formData = $.storage('form', {}, sessionStorage);
```

## 📋 API Reference

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `key` | `string` | required | Storage key name |
| `initialValue` | `any` | required | Default value if none stored |
| `storage` | `Storage` | `localStorage` | Storage type (`localStorage` or `sessionStorage`) |

### Returns

| Return | Description |
|--------|-------------|
| `Function` | Signal function (getter/setter) with persistence |

## 🎯 Basic Examples

### Theme Preference

```javascript
import { $, html } from 'sigpro';

// Persistent theme signal
const theme = $.storage('theme', 'light');

// Apply theme to document
$.effect(() => {
  document.body.className = `theme-${theme()}`;
});

// Toggle theme
const toggleTheme = () => {
  theme(t => t === 'light' ? 'dark' : 'light');
};

// Template
html`
  <div>
    <p>Current theme: ${theme}</p>
    <button @click=${toggleTheme}>
      Toggle Theme
    </button>
  </div>
`;
```

### User Preferences

```javascript
import { $ } from 'sigpro';

// Complex preferences object
const preferences = $.storage('preferences', {
  language: 'en',
  fontSize: 'medium',
  notifications: true,
  compactView: false,
  sidebarOpen: true
});

// Update single preference
const setPreference = (key, value) => {
  preferences({
    ...preferences(),
    [key]: value
  });
};

// Usage
setPreference('language', 'es');
setPreference('fontSize', 'large');
console.log(preferences().language); // 'es'
```

### Form Draft

```javascript
import { $, html } from 'sigpro';

// Session-based draft (clears when tab closes)
const draft = $.storage('contact-form', {
  name: '',
  email: '',
  message: ''
}, sessionStorage);

// Auto-save on input
const handleInput = (field, value) => {
  draft({
    ...draft(),
    [field]: value
  });
};

// Clear draft after submit
const handleSubmit = async () => {
  await submitForm(draft());
  draft(null); // Clears from storage
};

// Template
html`
  <form @submit=${handleSubmit}>
    <input
      type="text"
      :value=${() => draft().name}
      @input=${(e) => handleInput('name', e.target.value)}
      placeholder="Name"
    />
    <input
      type="email"
      :value=${() => draft().email}
      @input=${(e) => handleInput('email', e.target.value)}
      placeholder="Email"
    />
    <textarea
      :value=${() => draft().message}
      @input=${(e) => handleInput('message', e.target.value)}
      placeholder="Message"
    ></textarea>
    <button type="submit">Send</button>
  </form>
`;
```

## 🚀 Advanced Examples

### Authentication State

```javascript
import { $, html } from 'sigpro';

// Persistent auth state
const auth = $.storage('auth', {
  token: null,
  user: null,
  expiresAt: null
});

// Computed helpers
const isAuthenticated = $(() => {
  const { token, expiresAt } = auth();
  if (!token || !expiresAt) return false;
  return new Date(expiresAt) > new Date();
});

const user = $(() => auth().user);

// Login function
const login = async (email, password) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (response.ok) {
    const { token, user, expiresIn } = await response.json();
    auth({
      token,
      user,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString()
    });
    return true;
  }
  return false;
};

// Logout
const logout = () => {
  auth(null); // Clear from storage
};

// Auto-refresh token
$.effect(() => {
  if (!isAuthenticated()) return;
  
  const { expiresAt } = auth();
  const expiresIn = new Date(expiresAt) - new Date();
  const refreshTime = expiresIn - 60000; // 1 minute before expiry
  
  if (refreshTime > 0) {
    const timer = setTimeout(refreshToken, refreshTime);
    return () => clearTimeout(timer);
  }
});

// Navigation guard
$.effect(() => {
  if (!isAuthenticated() && window.location.pathname !== '/login') {
    $.router.go('/login');
  }
});
```

### Multi-tab Synchronization

```javascript
import { $ } from 'sigpro';

// Storage key for cross-tab communication
const STORAGE_KEY = 'app-state';

// Create persistent signal
const appState = $.storage(STORAGE_KEY, {
  count: 0,
  lastUpdated: null
});

// Listen for storage events (changes from other tabs)
window.addEventListener('storage', (event) => {
  if (event.key === STORAGE_KEY && event.newValue) {
    try {
      // Update signal without triggering save loop
      const newValue = JSON.parse(event.newValue);
      appState(newValue);
    } catch (e) {
      console.error('Failed to parse storage event:', e);
    }
  }
});

// Update state (syncs across all tabs)
const increment = () => {
  appState({
    count: appState().count + 1,
    lastUpdated: new Date().toISOString()
  });
};

// Tab counter
const tabCount = $(1);

// Track number of tabs open
window.addEventListener('storage', (event) => {
  if (event.key === 'tab-heartbeat') {
    tabCount(parseInt(event.newValue) || 1);
  }
});

// Send heartbeat
setInterval(() => {
  localStorage.setItem('tab-heartbeat', tabCount());
}, 1000);
```

### Settings Manager

```javascript
import { $, html } from 'sigpro';

// Settings schema
const settingsSchema = {
  theme: {
    type: 'select',
    options: ['light', 'dark', 'system'],
    default: 'system'
  },
  fontSize: {
    type: 'range',
    min: 12,
    max: 24,
    default: 16
  },
  notifications: {
    type: 'checkbox',
    default: true
  },
  language: {
    type: 'select',
    options: ['en', 'es', 'fr', 'de'],
    default: 'en'
  }
};

// Persistent settings
const settings = $.storage('app-settings', 
  Object.entries(settingsSchema).reduce((acc, [key, config]) => ({
    ...acc,
    [key]: config.default
  }), {})
);

// Settings component
const SettingsPanel = () => {
  return html`
    <div class="settings-panel">
      <h2>Settings</h2>
      
      ${Object.entries(settingsSchema).map(([key, config]) => {
        switch(config.type) {
          case 'select':
            return html`
              <div class="setting">
                <label>${key}:</label>
                <select 
                  :value=${() => settings()[key]}
                  @change=${(e) => updateSetting(key, e.target.value)}
                >
                  ${config.options.map(opt => html`
                    <option value="${opt}" ?selected=${() => settings()[key] === opt}>
                      ${opt}
                    </option>
                  `)}
                </select>
              </div>
            `;
            
          case 'range':
            return html`
              <div class="setting">
                <label>${key}: ${() => settings()[key]}</label>
                <input
                  type="range"
                  min="${config.min}"
                  max="${config.max}"
                  :value=${() => settings()[key]}
                  @input=${(e) => updateSetting(key, parseInt(e.target.value))}
                />
              </div>
            `;
            
          case 'checkbox':
            return html`
              <div class="setting">
                <label>
                  <input
                    type="checkbox"
                    :checked=${() => settings()[key]}
                    @change=${(e) => updateSetting(key, e.target.checked)}
                  />
                  ${key}
                </label>
              </div>
            `;
        }
      })}
      
      <button @click=${resetDefaults}>Reset to Defaults</button>
    </div>
  `;
};

// Helper functions
const updateSetting = (key, value) => {
  settings({
    ...settings(),
    [key]: value
  });
};

const resetDefaults = () => {
  const defaults = Object.entries(settingsSchema).reduce((acc, [key, config]) => ({
    ...acc,
    [key]: config.default
  }), {});
  settings(defaults);
};

// Apply settings globally
$.effect(() => {
  const { theme, fontSize } = settings();
  
  // Apply theme
  document.documentElement.setAttribute('data-theme', theme);
  
  // Apply font size
  document.documentElement.style.fontSize = `${fontSize}px`;
});
```

### Shopping Cart Persistence

```javascript
import { $, html } from 'sigpro';

// Persistent shopping cart
const cart = $.storage('shopping-cart', {
  items: [],
  lastUpdated: null
});

// Computed values
const cartItems = $(() => cart().items);
const itemCount = $(() => cartItems().reduce((sum, item) => sum + item.quantity, 0));
const subtotal = $(() => cartItems().reduce((sum, item) => sum + (item.price * item.quantity), 0));
const tax = $(() => subtotal() * 0.1);
const total = $(() => subtotal() + tax());

// Cart actions
const addToCart = (product, quantity = 1) => {
  const existing = cartItems().findIndex(item => item.id === product.id);
  
  if (existing >= 0) {
    // Update quantity
    const newItems = [...cartItems()];
    newItems[existing] = {
      ...newItems[existing],
      quantity: newItems[existing].quantity + quantity
    };
    
    cart({
      items: newItems,
      lastUpdated: new Date().toISOString()
    });
  } else {
    // Add new item
    cart({
      items: [...cartItems(), { ...product, quantity }],
      lastUpdated: new Date().toISOString()
    });
  }
};

const removeFromCart = (productId) => {
  cart({
    items: cartItems().filter(item => item.id !== productId),
    lastUpdated: new Date().toISOString()
  });
};

const updateQuantity = (productId, quantity) => {
  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    const newItems = cartItems().map(item =>
      item.id === productId ? { ...item, quantity } : item
    );
    
    cart({
      items: newItems,
      lastUpdated: new Date().toISOString()
    });
  }
};

const clearCart = () => {
  cart({
    items: [],
    lastUpdated: new Date().toISOString()
  });
};

// Cart expiration (7 days)
const CART_EXPIRY_DAYS = 7;

$.effect(() => {
  const lastUpdated = cart().lastUpdated;
  if (lastUpdated) {
    const expiryDate = new Date(lastUpdated);
    expiryDate.setDate(expiryDate.getDate() + CART_EXPIRY_DAYS);
    
    if (new Date() > expiryDate) {
      clearCart();
    }
  }
});

// Cart display component
const CartDisplay = () => html`
  <div class="cart">
    <h3>Shopping Cart (${itemCount} items)</h3>
    
    ${cartItems().map(item => html`
      <div class="cart-item">
        <span>${item.name}</span>
        <span>$${item.price} x ${item.quantity}</span>
        <span>$${item.price * item.quantity}</span>
        <button @click=${() => removeFromCart(item.id)}>Remove</button>
        <input
          type="number"
          min="1"
          :value=${item.quantity}
          @change=${(e) => updateQuantity(item.id, parseInt(e.target.value))}
        />
      </div>
    `)}
    
    <div class="cart-totals">
      <p>Subtotal: $${subtotal}</p>
      <p>Tax (10%): $${tax}</p>
      <p><strong>Total: $${total}</strong></p>
    </div>
    
    ${() => cartItems().length > 0 ? html`
      <button @click=${checkout}>Checkout</button>
      <button @click=${clearCart}>Clear Cart</button>
    ` : html`
      <p>Your cart is empty</p>
    `}
  </div>
`;
```

### Recent Searches History

```javascript
import { $, html } from 'sigpro';

// Persistent search history (max 10 items)
const searchHistory = $.storage('search-history', []);

// Add search to history
const addSearch = (query) => {
  if (!query.trim()) return;
  
  const current = searchHistory();
  const newHistory = [
    { query, timestamp: new Date().toISOString() },
    ...current.filter(item => item.query !== query)
  ].slice(0, 10); // Keep only last 10
  
  searchHistory(newHistory);
};

// Clear history
const clearHistory = () => {
  searchHistory([]);
};

// Remove specific item
const removeFromHistory = (query) => {
  searchHistory(searchHistory().filter(item => item.query !== query));
};

// Search component
const SearchWithHistory = () => {
  const searchInput = $('');
  
  const handleSearch = () => {
    const query = searchInput();
    if (query) {
      addSearch(query);
      performSearch(query);
      searchInput('');
    }
  };
  
  return html`
    <div class="search-container">
      <div class="search-box">
        <input
          type="search"
          :value=${searchInput}
          @keydown.enter=${handleSearch}
          placeholder="Search..."
        />
        <button @click=${handleSearch}>Search</button>
      </div>
      
      ${() => searchHistory().length > 0 ? html`
        <div class="search-history">
          <h4>Recent Searches</h4>
          ${searchHistory().map(item => html`
            <div class="history-item">
              <button 
                class="history-query"
                @click=${() => {
                  searchInput(item.query);
                  handleSearch();
                }}
              >
                🔍 ${item.query}
              </button>
              <small>${new Date(item.timestamp).toLocaleString()}</small>
              <button 
                class="remove-btn"
                @click=${() => removeFromHistory(item.query)}
              >
                ✕
              </button>
            </div>
          `)}
          <button class="clear-btn" @click=${clearHistory}>
            Clear History
          </button>
        </div>
      ` : ''}
    </div>
  `;
};
```

### Multiple Profiles / Accounts

```javascript
import { $, html } from 'sigpro';

// Profile manager
const profiles = $.storage('user-profiles', {
  current: 'default',
  list: {
    default: {
      name: 'Default',
      theme: 'light',
      preferences: {}
    }
  }
});

// Switch profile
const switchProfile = (profileId) => {
  profiles({
    ...profiles(),
    current: profileId
  });
};

// Create profile
const createProfile = (name) => {
  const id = `profile-${Date.now()}`;
  profiles({
    current: id,
    list: {
      ...profiles().list,
      [id]: {
        name,
        theme: 'light',
        preferences: {},
        createdAt: new Date().toISOString()
      }
    }
  });
  return id;
};

// Delete profile
const deleteProfile = (profileId) => {
  if (profileId === 'default') return; // Can't delete default
  
  const newList = { ...profiles().list };
  delete newList[profileId];
  
  profiles({
    current: 'default',
    list: newList
  });
};

// Get current profile data
const currentProfile = $(() => {
  const { current, list } = profiles();
  return list[current] || list.default;
});

// Profile-aware settings
const profileTheme = $(() => currentProfile().theme);
const profilePreferences = $(() => currentProfile().preferences);

// Update profile data
const updateCurrentProfile = (updates) => {
  const { current, list } = profiles();
  profiles({
    current,
    list: {
      ...list,
      [current]: {
        ...list[current],
        ...updates
      }
    }
  });
};

// Profile selector component
const ProfileSelector = () => html`
  <div class="profile-selector">
    <select 
      :value=${() => profiles().current}
      @change=${(e) => switchProfile(e.target.value)}
    >
      ${Object.entries(profiles().list).map(([id, profile]) => html`
        <option value="${id}">${profile.name}</option>
      `)}
    </select>
    
    <button @click=${() => {
      const name = prompt('Enter profile name:');
      if (name) createProfile(name);
    }}>
      New Profile
    </button>
  </div>
`;
```

## 🛡️ Error Handling

### Storage Errors

```javascript
import { $ } from 'sigpro';

// Safe storage wrapper
const safeStorage = (key, initialValue, storage = localStorage) => {
  try {
    return $.storage(key, initialValue, storage);
  } catch (error) {
    console.warn(`Storage failed for ${key}, using in-memory fallback:`, error);
    return $(initialValue);
  }
};

// Usage with fallback
const theme = safeStorage('theme', 'light');
const user = safeStorage('user', null);
```

### Quota Exceeded Handling

```javascript
import { $ } from 'sigpro';

const createManagedStorage = (key, initialValue, maxSize = 1024 * 100) => { // 100KB limit
  const signal = $.storage(key, initialValue);
  
  // Monitor size
  const size = $(0);
  
  $.effect(() => {
    try {
      const value = signal();
      const json = JSON.stringify(value);
      const bytes = new Blob([json]).size;
      
      size(bytes);
      
      if (bytes > maxSize) {
        console.warn(`Storage for ${key} exceeded ${maxSize} bytes`);
        // Could implement cleanup strategy here
      }
    } catch (e) {
      console.error('Size check failed:', e);
    }
  });
  
  return { signal, size };
};

// Usage
const { signal: largeData, size } = createManagedStorage('app-data', {}, 50000);
```

## 📊 Storage Limits

| Storage Type | Typical Limit | Notes |
|--------------|---------------|-------|
| `localStorage` | 5-10MB | Varies by browser |
| `sessionStorage` | 5-10MB | Cleared when tab closes |
| `cookies` | 4KB | Not recommended for SigPro |

## 🎯 Best Practices

### 1. Validate Stored Data

```javascript
import { $ } from 'sigpro';

// Schema validation
const createValidatedStorage = (key, schema, defaultValue, storage) => {
  const signal = $.storage(key, defaultValue, storage);
  
  // Wrap to validate on read/write
  const validated = (...args) => {
    if (args.length) {
      // Validate before writing
      const value = args[0];
      if (typeof value === 'function') {
        // Handle functional updates
        return validated(validated());
      }
      
      // Basic validation
      const isValid = Object.keys(schema).every(key => {
        const validator = schema[key];
        return !validator || validator(value[key]);
      });
      
      if (!isValid) {
        console.warn('Invalid data, skipping storage write');
        return signal();
      }
    }
    
    return signal(...args);
  };
  
  return validated;
};

// Usage
const userSchema = {
  name: v => v && v.length > 0,
  age: v => v >= 18 && v <= 120,
  email: v => /@/.test(v)
};

const user = createValidatedStorage('user', userSchema, {
  name: '',
  age: 25,
  email: ''
});
```

### 2. Handle Versioning

```javascript
import { $ } from 'sigpro';

const VERSION = 2;

const createVersionedStorage = (key, migrations, storage) => {
  const raw = $.storage(key, { version: VERSION, data: {} }, storage);
  
  const migrate = (data) => {
    let current = data;
    const currentVersion = current.version || 1;
    
    for (let v = currentVersion; v < VERSION; v++) {
      const migrator = migrations[v];
      if (migrator) {
        current = migrator(current);
      }
    }
    
    return current;
  };
  
  // Migrate if needed
  const stored = raw();
  if (stored.version !== VERSION) {
    const migrated = migrate(stored);
    raw(migrated);
  }
  
  return raw;
};

// Usage
const migrations = {
  1: (old) => ({
    version: 2,
    data: {
      ...old.data,
      preferences: old.preferences || {}
    }
  })
};

const settings = createVersionedStorage('app-settings', migrations);
```

### 3. Encrypt Sensitive Data

```javascript
import { $ } from 'sigpro';

// Simple encryption (use proper crypto in production)
const encrypt = (text) => {
  return btoa(text); // Base64 - NOT secure, just example
};

const decrypt = (text) => {
  try {
    return atob(text);
  } catch {
    return null;
  }
};

const createSecureStorage = (key, initialValue, storage) => {
  const encryptedKey = `enc_${key}`;
  const signal = $.storage(encryptedKey, null, storage);
  
  const secure = (...args) => {
    if (args.length) {
      // Encrypt before storing
      const value = args[0];
      const encrypted = encrypt(JSON.stringify(value));
      return signal(encrypted);
    }
    
    // Decrypt when reading
    const encrypted = signal();
    if (!encrypted) return initialValue;
    
    try {
      const decrypted = decrypt(encrypted);
      return decrypted ? JSON.parse(decrypted) : initialValue;
    } catch {
      return initialValue;
    }
  };
  
  return secure;
};

// Usage
const secureToken = createSecureStorage('auth-token', null);
secureToken('sensitive-data-123'); // Stored encrypted
```

## 📈 Performance Considerations

| Operation | Cost | Notes |
|-----------|------|-------|
| Initial read | O(1) | Single storage read |
| Write | O(1) + JSON.stringify | Auto-save on change |
| Large objects | O(n) | Stringify/parse overhead |
| Multiple keys | O(k) | k = number of keys |

---

> **Pro Tip:** Use `sessionStorage` for temporary data like form drafts, and `localStorage` for persistent user preferences. Always validate data when reading from storage to handle corrupted values gracefully.
