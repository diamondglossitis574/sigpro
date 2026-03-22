# SigPro UI Plugin - Complete Documentation

## Overview

The **SigPro UI** plugin is a comprehensive, reactive component library built on SigPro's atomic reactivity system. It seamlessly integrates **Tailwind CSS v4** for utility-first styling and **daisyUI v5** for semantic, themeable components. Every component is reactive by nature, automatically responding to signal changes without manual DOM updates.

## Table of Contents

1. [Installation & Setup](#installation--setup)
2. [Core Concepts](#core-concepts)
3. [Form Components](#form-components)
4. [Action Components](#action-components)
5. [Layout Components](#layout-components)
6. [Navigation Components](#navigation-components)
7. [Feedback Components](#feedback-components)
8. [Container Components](#container-components)
9. [Complete Examples](#complete-examples)
10. [Styling Guide](#styling-guide)
11. [Best Practices](#best-practices)

---

## Installation & Setup

### Step 1: Install Dependencies

```bash
npm install -D tailwindcss @tailwindcss/vite daisyui@next
```

### Step 2: Configure Tailwind CSS v4

Create `src/app.css`:

```css
/* src/app.css */
@import "tailwindcss";
@plugin "daisyui";

/* Optional: Custom themes */
@theme {
  --color-primary: oklch(0.65 0.2 250);
  --color-secondary: oklch(0.7 0.15 150);
}

/* Dark mode support */
@custom-variant dark (&:where(.dark, [data-theme="dark"], [data-theme="dark"] *)));
```

### Step 3: Initialize in Your Entry Point

```javascript
// main.js
import './app.css';
import { $ } from 'sigpro';
import { UI } from 'sigpro/plugins';

// Load the UI plugin - makes all _components globally available
$.plugin(UI).then(() => {
  // All UI components are now registered
  import('./App.js').then(app => $.mount(app.default));
});
```

---

## Core Concepts

### Reactive Props

All UI components accept reactive props using the `$` prefix. When you pass a signal, the component automatically updates:

```javascript
const $username = $('John');
const $error = $(null);

// Reactive input with two-way binding
_input({
  $value: $username,     // Auto-updates when signal changes
  $error: $error         // Shows error message when signal has value
})
```

### The `parseClass` Helper

All components intelligently merge base classes with user-provided classes, supporting both static strings and reactive functions:

```javascript
// Static class merging
_button({ class: 'btn-primary' }, 'Click me')
// Result: class="btn btn-primary"

// Reactive classes
const $theme = $('btn-primary');
_button({ class: () => $theme() }, 'Dynamic Button')
// Updates when $theme changes
```

---

## Form Components

### `_input` - Smart Input Field

A complete input wrapper with label, tooltip, error handling, and two-way binding.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Field label text |
| `tip` | `string` | Tooltip text shown on hover of a "?" badge |
| `$value` | `signal` | Two-way bound value signal |
| `$error` | `signal` | Error message signal (shows red border + message) |
| `type` | `string` | Input type: 'text', 'email', 'password', etc. |
| `placeholder` | `string` | Placeholder text |
| `class` | `string\|function` | Additional CSS classes |

**Examples:**

```javascript
// Basic usage
const $email = $('');
_input({
  label: 'Email Address',
  type: 'email',
  placeholder: 'user@example.com',
  $value: $email
})

// With validation
const $password = $('');
const $passwordError = $(null);

_input({
  label: 'Password',
  type: 'password',
  $value: $password,
  $error: $passwordError,
  oninput: (e) => {
    if (e.target.value.length < 6) {
      $passwordError('Password must be at least 6 characters');
    } else {
      $passwordError(null);
    }
  }
})
```

### `_select` - Dropdown Selector

Reactive select component with options array.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Field label |
| `options` | `Array<{value: any, label: string}>` | Select options |
| `$value` | `signal` | Two-way bound selected value |

**Example:**

```javascript
const $role = $('user');
const roles = [
  { value: 'admin', label: 'Administrator' },
  { value: 'user', label: 'Standard User' },
  { value: 'guest', label: 'Guest' }
];

_select({
  label: 'User Role',
  options: roles,
  $value: $role
})

// Reactive selection
console.log($role()); // 'user'
```

### `_checkbox` - Toggle Checkbox

Styled checkbox with label support.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Checkbox label text |
| `$value` | `signal` | Boolean signal for checked state |

**Example:**

```javascript
const $remember = $(true);

_checkbox({
  label: 'Remember me',
  $value: $remember
})
```

### `_radio` - Radio Button Group

Radio button with group value binding.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Radio option label |
| `value` | `any` | Value for this radio option |
| `$value` | `signal` | Group signal holding selected value |

**Example:**

```javascript
const $paymentMethod = $('credit');

['credit', 'paypal', 'crypto'].forEach(method => {
  _radio({
    name: 'payment',
    label: method.toUpperCase(),
    value: method,
    $value: $paymentMethod
  })
})

// Selected: $paymentMethod() === 'credit'
```

### `_range` - Slider Control

Reactive range slider with optional label.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Slider label |
| `min` | `number` | Minimum value |
| `max` | `number` | Maximum value |
| `step` | `number` | Step increment |
| `$value` | `signal` | Current value signal |

**Example:**

```javascript
const $volume = $(50);

_range({
  label: 'Volume',
  min: 0,
  max: 100,
  step: 1,
  $value: $volume
})

// Display current value
span(() => `Volume: ${$volume()}%`)
```

---

## Action Components

### `_button` - Smart Action Button

Feature-rich button with loading states, icons, and badges.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `$loading` | `signal` | Shows spinner + disables when true |
| `$disabled` | `signal` | Manual disabled state |
| `icon` | `string\|HTMLElement` | Icon element or emoji/unicode |
| `badge` | `string` | Badge text to display |
| `badgeClass` | `string` | Additional badge styling |
| `type` | `string` | Button type: 'button', 'submit', etc. |
| `onclick` | `function` | Click handler |

**Examples:**

```javascript
// Basic button
_button({ onclick: () => alert('Clicked!') }, 'Click Me')

// Loading state
const $saving = $(false);
_button({
  $loading: $saving,
  icon: '💾',
  onclick: async () => {
    $saving(true);
    await saveData();
    $saving(false);
  }
}, 'Save Changes')

// With badge notification
_button({
  badge: '3',
  badgeClass: 'badge-secondary',
  icon: '🔔'
}, 'Notifications')
```

---

## Layout Components

### `_fieldset` - Form Section Group

Groups related form fields with a legend.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `legend` | `string` | Fieldset title |
| `class` | `string\|function` | Additional classes |

**Example:**

```javascript
_fieldset({ legend: 'Personal Information' }, [
  _input({ label: 'First Name', $value: $firstName }),
  _input({ label: 'Last Name', $value: $lastName }),
  _input({ label: 'Email', type: 'email', $value: $email })
])
```

### `_accordion` - Collapsible Section

Expandable/collapsible content panel.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `title` | `string` | Accordion header text |
| `name` | `string` | Optional group name (radio behavior) |
| `open` | `boolean` | Initially open state |

**Examples:**

```javascript
// Single accordion (checkbox behavior)
_accordion({ title: 'Frequently Asked Questions' }, [
  p('This is the collapsible content...')
])

// Grouped accordions (radio behavior - only one open)
_accordion({ title: 'Section 1', name: 'faq' }, [
  p('Content for section 1')
]),
_accordion({ title: 'Section 2', name: 'faq' }, [
  p('Content for section 2')
])
```

### `_drawer` - Sidebar Drawer

Responsive drawer component that can be toggled programmatically.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique ID for checkbox toggle |
| `$open` | `signal` | Boolean signal for drawer state |
| `content` | `HTMLElement` | Main content area |
| `side` | `HTMLElement` | Sidebar content |

**Example:**

```javascript
const $drawerOpen = $(false);

_drawer({
  id: 'main-drawer',
  $open: $drawerOpen,
  content: [
    _button({ onclick: () => $drawerOpen(true) }, 'Open Menu'),
    div('Main content goes here')
  ],
  side: [
    _menu({ items: [
      { label: 'Home', onclick: () => $drawerOpen(false) },
      { label: 'Settings', onclick: () => $drawerOpen(false) }
    ]})
  ]
})
```

---

## Navigation Components

### `_navbar` - Application Header

Responsive navigation bar with built-in styling.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `class` | `string\|function` | Additional classes |

**Example:**

```javascript
_navbar([
  div({ class: 'flex-1' }, [
    a({ class: 'text-xl font-bold' }, 'MyApp')
  ]),
  div({ class: 'flex-none' }, [
    _button({ class: 'btn-ghost btn-sm' }, 'Login'),
    _button({ class: 'btn-primary btn-sm' }, 'Sign Up')
  ])
])
```

### `_menu` - Vertical Navigation

Sidebar or dropdown menu with active state support.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `items` | `Array<{label: string, icon?: any, active?: boolean\|function, onclick: function}>` | Menu items |

**Example:**

```javascript
const $currentPage = $('home');

_menu({ items: [
  { 
    label: 'Dashboard', 
    icon: '📊',
    active: () => $currentPage() === 'dashboard',
    onclick: () => $currentPage('dashboard')
  },
  { 
    label: 'Profile', 
    icon: '👤',
    active: () => $currentPage() === 'profile',
    onclick: () => $currentPage('profile')
  },
  { 
    label: 'Settings', 
    icon: '⚙️',
    active: () => $currentPage() === 'settings',
    onclick: () => $currentPage('settings')
  }
]})
```

### `_tabs` - Tab Navigation

Horizontal tabs with lifted styling.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `items` | `Array<{label: string, active: boolean\|function, onclick: function}>` | Tab items |

**Example:**

```javascript
const $activeTab = $('profile');

_tabs({ items: [
  { 
    label: 'Profile', 
    active: () => $activeTab() === 'profile',
    onclick: () => $activeTab('profile')
  },
  { 
    label: 'Settings', 
    active: () => $activeTab() === 'settings',
    onclick: () => $activeTab('settings')
  }
]})
```

---

## Feedback Components

### `_badge` - Status Indicator

Small badge for counts, statuses, or labels.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `class` | `string\|function` | Badge style (badge-primary, badge-success, etc.) |

**Example:**

```javascript
_badge({ class: 'badge-success' }, 'Active')
_badge({ class: 'badge-error' }, '3 Errors')
_badge({ class: 'badge-warning' }, 'Pending')
```

### `_tooltip` - Hover Information

Wrapper that shows tooltip text on hover.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `tip` | `string` | Tooltip text |
| `position` | `string` | Tooltip position (top, bottom, left, right) |

**Example:**

```javascript
_tooltip({ tip: 'Click to save changes', class: 'tooltip-primary' }, [
  _button({}, 'Save')
])

_tooltip({ tip: 'Your email will not be shared', class: 'tooltip-bottom' }, [
  span('ⓘ')
])
```

---

## Container Components

### `_modal` - Dialog Window

Programmatically controlled modal dialog.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `$open` | `signal` | Boolean signal controlling visibility |
| `title` | `string` | Modal title |
| `class` | `string\|function` | Additional styling |

**Example:**

```javascript
const $showModal = $(false);

_modal({ 
  $open: $showModal, 
  title: 'Confirm Action' 
}, [
  p('Are you sure you want to delete this item?'),
  div({ class: 'flex gap-2 justify-end mt-4' }, [
    _button({ onclick: () => $showModal(false) }, 'Cancel'),
    _button({ 
      class: 'btn-error',
      onclick: () => {
        deleteItem();
        $showModal(false);
      }
    }, 'Delete')
  ])
])

// Trigger modal
_button({ onclick: () => $showModal(true) }, 'Delete Item')
```

### `_dropdown` - Context Menu

Dropdown menu that appears on click.

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `label` | `string` | Dropdown trigger text |
| `class` | `string\|function` | Additional classes |

**Example:**

```javascript
_dropdown({ label: 'Options' }, [
  li([a({ onclick: () => edit() }, 'Edit')]),
  li([a({ onclick: () => duplicate() }, 'Duplicate')]),
  li([a({ class: 'text-error', onclick: () => delete() }, 'Delete')])
])
```

---

## Complete Examples

### Example 1: User Registration Form

```javascript
// Signals
const $username = $('');
const $email = $('');
const $password = $('');
const $terms = $(false);
const $loading = $(false);

// Validation signals
const $usernameError = $(null);
const $emailError = $(null);
const $passwordError = $(null);

// Form submission
const handleSubmit = async () => {
  $loading(true);
  
  // Validate
  if ($username().length < 3) $usernameError('Username too short');
  if (!$email().includes('@')) $emailError('Invalid email');
  if ($password().length < 6) $passwordError('Password too short');
  if (!$terms()) alert('Accept terms');
  
  if (!$usernameError() && !$emailError() && !$passwordError()) {
    await api.register({
      username: $username(),
      email: $email(),
      password: $password()
    });
  }
  
  $loading(false);
};

// Component
div({ class: 'max-w-md mx-auto p-6' }, [
  _fieldset({ legend: 'Create Account' }, [
    _input({
      label: 'Username',
      $value: $username,
      $error: $usernameError,
      placeholder: 'johndoe'
    }),
    _input({
      label: 'Email',
      type: 'email',
      $value: $email,
      $error: $emailError,
      placeholder: 'john@example.com'
    }),
    _input({
      label: 'Password',
      type: 'password',
      $value: $password,
      $error: $passwordError
    }),
    _checkbox({
      label: 'I agree to the Terms of Service',
      $value: $terms
    }),
    _button({
      $loading: $loading,
      class: 'btn-primary w-full mt-4',
      onclick: handleSubmit
    }, 'Sign Up')
  ])
])
```

### Example 2: Dashboard with Router Integration

```javascript
// App.js
export default () => {
  const $activeRoute = $('dashboard');
  
  return div({ class: 'min-h-screen' }, [
    _navbar([
      div({ class: 'flex-1' }, [
        a({ class: 'text-xl font-bold' }, 'Dashboard')
      ]),
      _button({ 
        class: 'btn-ghost btn-circle',
        onclick: () => $.router.go('/settings')
      }, '⚙️')
    ]),
    div({ class: 'flex' }, [
      // Sidebar
      div({ class: 'w-64 p-4' }, [
        _menu({ items: [
          { 
            label: 'Dashboard', 
            icon: '📊',
            active: () => $activeRoute() === 'dashboard',
            onclick: () => {
              $activeRoute('dashboard');
              $.router.go('/');
            }
          },
          { 
            label: 'Analytics', 
            icon: '📈',
            active: () => $activeRoute() === 'analytics',
            onclick: () => {
              $activeRoute('analytics');
              $.router.go('/analytics');
            }
          },
          { 
            label: 'Settings', 
            icon: '⚙️',
            active: () => $activeRoute() === 'settings',
            onclick: () => {
              $activeRoute('settings');
              $.router.go('/settings');
            }
          }
        ]})
      ]),
      
      // Main content
      div({ class: 'flex-1 p-6' }, [
        $.router([
          { path: '/', component: () => DashboardComponent() },
          { path: '/analytics', component: () => AnalyticsComponent() },
          { path: '/settings', component: () => SettingsComponent() }
        ])
      ])
    ])
  ]);
};
```

### Example 3: E-commerce Product Card

```javascript
const ProductCard = ({ product }) => {
  const $quantity = $(1);
  const $inCart = $(false);
  
  return div({ class: 'card bg-base-100 shadow-xl' }, [
    figure([img({ src: product.image, alt: product.name })]),
    div({ class: 'card-body' }, [
      h2({ class: 'card-title' }, product.name),
      p(product.description),
      div({ class: 'flex justify-between items-center mt-4' }, [
        span({ class: 'text-2xl font-bold' }, `$${product.price}`),
        div({ class: 'flex gap-2' }, [
          _range({
            min: 1,
            max: 10,
            $value: $quantity,
            class: 'w-32'
          }),
          _button({
            $loading: $inCart,
            class: 'btn-primary',
            onclick: async () => {
              $inCart(true);
              await addToCart(product.id, $quantity());
              $inCart(false);
            }
          }, 'Add to Cart')
        ])
      ])
    ])
  ]);
};
```

---

## Styling Guide

### Theme Configuration

DaisyUI v5 supports extensive theming. Configure in `tailwind.config.js` or CSS:

```css
/* app.css */
@import "tailwindcss";
@plugin "daisyui";

/* Custom theme */
[data-theme="corporate"] {
  --color-primary: oklch(0.6 0.2 250);
  --color-secondary: oklch(0.7 0.15 150);
  --color-accent: oklch(0.8 0.1 50);
  --color-neutral: oklch(0.3 0.01 260);
  --color-base-100: oklch(0.98 0.01 260);
  --color-info: oklch(0.65 0.2 220);
  --color-success: oklch(0.65 0.2 140);
  --color-warning: oklch(0.7 0.2 85);
  --color-error: oklch(0.65 0.25 25);
}
```

### Component Modifiers

Each component accepts Tailwind/daisyUI classes:

```javascript
// Button variants
_button({ class: 'btn-primary' }, 'Primary')
_button({ class: 'btn-secondary' }, 'Secondary')
_button({ class: 'btn-accent' }, 'Accent')
_button({ class: 'btn-outline' }, 'Outline')
_button({ class: 'btn-ghost' }, 'Ghost')
_button({ class: 'btn-sm' }, 'Small')
_button({ class: 'btn-lg' }, 'Large')
_button({ class: 'btn-block' }, 'Full Width')
```

---

## Best Practices

### 1. Reactive Performance
Always use signals for values that change, not direct variable assignments:

```javascript
// ❌ Bad
let name = 'John';
_input({ $value: () => name }); // Won't update

// ✅ Good
const $name = $('John');
_input({ $value: $name });
```

### 2. Error Handling
Use `$error` signals with validation:

```javascript
const $error = $(null);

_input({
  $error: $error,
  onchange: (e) => {
    if (!validate(e.target.value)) {
      $error('Invalid input');
    } else {
      $error(null);
    }
  }
})
```

### 3. Modal Management
Keep modals conditionally rendered based on `$open`:

```javascript
// Modal only exists in DOM when open
_modal({ $open: $showModal }, content)
```

### 4. Form Submissions
Combine loading states with error handling:

```javascript
const $loading = $(false);
const $error = $(null);

_button({
  $loading: $loading,
  onclick: async () => {
    $loading(true);
    try {
      await submit();
      $error(null);
    } catch (err) {
      $error(err.message);
    }
    $loading(false);
  }
}, 'Submit')
```

### 5. Component Composition
Build reusable components by combining UI primitives:

```javascript
const FormField = ({ label, $value, type = 'text' }) => {
  return _fieldset({ legend: label }, [
    _input({ type, $value, class: 'w-full' })
  ]);
};

// Usage
FormField({ label: 'Email', $value: $email });
```

---

## API Reference

All components are globally available after plugin initialization:

| Component | Function Signature |
|-----------|-------------------|
| `_button` | `(props, children) => HTMLElement` |
| `_input` | `(props) => HTMLElement` |
| `_select` | `(props) => HTMLElement` |
| `_checkbox` | `(props) => HTMLElement` |
| `_radio` | `(props) => HTMLElement` |
| `_range` | `(props) => HTMLElement` |
| `_fieldset` | `(props, children) => HTMLElement` |
| `_accordion` | `(props, children) => HTMLElement` |
| `_modal` | `(props, children) => HTMLElement` |
| `_drawer` | `(props) => HTMLElement` |
| `_navbar` | `(props, children) => HTMLElement` |
| `_menu` | `(props) => HTMLElement` |
| `_tabs` | `(props) => HTMLElement` |
| `_badge` | `(props, children) => HTMLElement` |
| `_tooltip` | `(props, children) => HTMLElement` |
| `_dropdown` | `(props, children) => HTMLElement` |

---

## Troubleshooting

### Styles Not Applying
Ensure Tailwind CSS is properly configured and imported before your app code:

```javascript
import './app.css'; // Must be first
import { $ } from 'sigpro';
```

### Components Not Found
Verify plugin is loaded before using components:

```javascript
$.plugin(UI).then(() => {
  // Components are ready
  $.mount(App);
});
```

### Reactive Updates Not Working
Ensure you're using signals, not primitive values:

```javascript
// Wrong
let count = 0;
_button({}, () => count)

// Correct
const $count = $(0);
_button({}, () => $count())
```
