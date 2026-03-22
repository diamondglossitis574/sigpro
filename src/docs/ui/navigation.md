# Navigation Components

Navigation components for building menus, navbars, and tabs with reactive active states.

## Navbar (`_navbar`)

A responsive navigation bar with built-in styling.

<div id="navbar-demo"></div>

```javascript
const $active = $('Home')

_navbar({ class: 'shadow-md' }, [
  div({ class: 'flex-1' }, [
    a({ class: 'text-xl font-bold' }, 'MyApp')
  ]),
  div({ class: 'flex-none gap-2' }, [
    _button({ 
      class: () => $active() === 'Home' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm',
      onclick: () => $active('Home')
    }, 'Home'),
    _button({ 
      class: () => $active() === 'About' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm',
      onclick: () => $active('About')
    }, 'About')
  ])
])
```

## Menu (`_menu`)

Vertical navigation menu with active state highlighting.

<div id="menu-demo"></div>

```javascript
const $selected = $('dashboard')

_menu({ items: [
  { 
    label: 'Dashboard', 
    icon: '📊',
    active: () => $selected() === 'dashboard',
    onclick: () => $selected('dashboard')
  },
  { 
    label: 'Analytics', 
    icon: '📈',
    active: () => $selected() === 'analytics',
    onclick: () => $selected('analytics')
  }
]})
```

## Tabs (`_tabs`)

Horizontal tabs with lifted styling and active state.

<div id="tabs-demo"></div>

```javascript
const $activeTab = $('profile')

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

## Dropdown (`_dropdown`)

A dropdown menu that appears on click.

<div id="dropdown-demo"></div>

```javascript
const $selected = $(null)

_dropdown({ label: 'Options' }, [
  li([a({ onclick: () => $selected('Edit') }, '✏️ Edit')]),
  li([a({ onclick: () => $selected('Duplicate') }, '📋 Duplicate')]),
  li([a({ onclick: () => $selected('Delete') }, '🗑️ Delete')])
])
```

## Complete Navigation Example

<div id="complete-nav-demo"></div>

## API Reference

### `_navbar`

| Prop | Type | Description |
|------|------|-------------|
| `class` | `string \| function` | Additional CSS classes |

### `_menu`

| Prop | Type | Description |
|------|------|-------------|
| `items` | `Array<{label: string, icon?: any, active?: boolean\|function, onclick: function}>` | Menu items |

### `_tabs`

| Prop | Type | Description |
|------|------|-------------|
| `items` | `Array<{label: string, active: boolean\|function, onclick: function}>` | Tab items |

### `_dropdown`

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Dropdown trigger text |
| `class` | `string \| function` | Additional CSS classes |
