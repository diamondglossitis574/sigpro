# Button Component

The `_button` component creates reactive buttons with built-in support for loading states, icons, badges, and disabled states.

## Basic Usage

<div id="basic-button-demo"></div>

```javascript
_button({ onclick: () => alert('Clicked!') }, 'Click Me')
```

## Loading State

The `$loading` signal automatically shows a spinner and disables the button.

<div id="loading-button-demo"></div>

```javascript
const $loading = $(false)

_button({ 
  $loading: $loading,
  onclick: async () => {
    $loading(true)
    await saveData()
    $loading(false)
  }
}, 'Save')
```

## Icons

Add icons to buttons using the `icon` prop.

<div id="icon-button-demo"></div>

```javascript
_button({ icon: '⭐' }, 'Favorite')
_button({ icon: '💾' }, 'Save')
_button({ icon: '🗑️', class: 'btn-error' }, 'Delete')
```

## Badges

Add badges to buttons for notifications or status indicators.

<div id="badge-button-demo"></div>

```javascript
_button({ badge: '3' }, 'Notifications')
_button({ badge: 'New', badgeClass: 'badge-secondary' }, 'Update Available')
```

## Button Variants

Use daisyUI classes to style your buttons.

<div id="variant-button-demo"></div>

```javascript
_button({ class: 'btn-primary' }, 'Primary')
_button({ class: 'btn-secondary' }, 'Secondary')
_button({ class: 'btn-outline' }, 'Outline')
_button({ class: 'btn-sm' }, 'Small')
```

## Counter Example

<div id="counter-demo"></div>

```javascript
const $count = $(0)

_button({ 
  onclick: () => $count($count() + 1),
  icon: '🔢'
}, () => `Count: ${$count()}`)
```

## Async Action Example

<div id="async-demo"></div>

```javascript
const $saving = $(false)
const $success = $(false)

_button({ 
  $loading: $saving,
  icon: '💾',
  onclick: async () => {
    $saving(true)
    await saveToDatabase()
    $saving(false)
    $success(true)
    setTimeout(() => $success(false), 2000)
  }
}, 'Save')
```

## API Reference

| Prop | Type | Description |
|------|------|-------------|
| `$loading` | `Signal<boolean>` | Shows spinner and disables button |
| `$disabled` | `Signal<boolean>` | Disables the button |
| `icon` | `string \| Node` | Icon to display before text |
| `badge` | `string` | Badge text to display |
| `badgeClass` | `string` | Additional CSS classes for badge |
| `class` | `string \| function` | Additional CSS classes |
| `onclick` | `function` | Click event handler |
| `type` | `string` | Button type ('button', 'submit', etc.) |

