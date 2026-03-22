# Modal & Drawer Components

Overlay components for dialogs, side panels, and popups with reactive control.

## Modal (`_modal`)

A dialog component that appears on top of the page. The modal is completely removed from the DOM when closed, optimizing performance.

### Basic Modal

<div id="basic-modal-demo"></div>

```javascript
const $open = $(false)

_button({ onclick: () => $open(true) }, 'Open Modal')

_modal({ $open: $open, title: 'Welcome' }, [
  $.html('p', {}, 'This is a simple modal dialog.'),
  _button({ onclick: () => $open(false) }, 'Close')
])
```

### Modal with Actions

<div id="action-modal-demo"></div>


```javascript
const $open = $(false)
const $result = $(null)

_modal({ $open: $open, title: 'Confirm Delete' }, [
  $.html('p', {}, 'Are you sure you want to delete this item?'),
  _button({ class: 'btn-error', onclick: () => {
    $result('Item deleted')
    $open(false)
  } }, 'Delete')
])
```

### Modal with Form

<div id="form-modal-demo"></div>

## Drawer (`_drawer`)

A sidebar panel that slides in from the side.

### Basic Drawer

<div id="basic-drawer-demo"></div>

```javascript
const $open = $(false)

_drawer({
  id: 'my-drawer',
  $open: $open,
  content: $.html('div', {}, 'Main content'),
  side: $.html('div', { class: 'p-4' }, [
    $.html('h3', {}, 'Menu'),
    $.html('ul', { class: 'menu' }, [
      $.html('li', {}, [$.html('a', { onclick: () => $open(false) }, 'Close')])
    ])
  ])
})
```

### Drawer with Navigation Menu

<div id="nav-drawer-demo"></div>

## API Reference

### `_modal`

| Prop | Type | Description |
|------|------|-------------|
| `$open` | `Signal<boolean>` | Controls modal visibility |
| `title` | `string` | Modal title text |

### `_drawer`

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier for the drawer |
| `$open` | `Signal<boolean>` | Controls drawer visibility |
| `content` | `HTMLElement` | Main content area |
| `side` | `HTMLElement` | Sidebar content |
