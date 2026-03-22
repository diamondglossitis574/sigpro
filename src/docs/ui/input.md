# Input Component

The `_input` component creates reactive form inputs with built-in support for labels, tooltips, error messages, and two-way binding.

## Basic Usage

<div id="basic-input-demo"></div>


```javascript
const $name = $('')

_input({
  label: 'Name',
  placeholder: 'Enter your name',
  $value: $name
})
```

## With Tooltip

The `tip` prop adds an info badge with a tooltip.

<div id="tooltip-input-demo"></div>


```javascript
_input({
  label: 'Username',
  tip: 'Choose a unique username (min. 3 characters)',
  placeholder: 'johndoe123',
  $value: $username
})
```

## With Error Handling

The `$error` signal displays an error message and styles the input accordingly.

<div id="error-input-demo"></div>

```javascript
const $email = $('')
const $error = $(null)

const validate = (value) => {
  if (value && !value.includes('@')) {
    $error('Please enter a valid email address')
  } else {
    $error(null)
  }
}

_input({
  label: 'Email',
  type: 'email',
  placeholder: 'user@example.com',
  $value: $email,
  $error: $error,
  oninput: (e) => validate(e.target.value)
})
```

## Input Types

The component supports all standard HTML input types.

<div id="types-input-demo"></div>

```javascript
_input({ label: 'Text', placeholder: 'Text input', $value: $text })
_input({ label: 'Password', type: 'password', placeholder: '••••••••', $value: $password })
_input({ label: 'Number', type: 'number', placeholder: '0', $value: $number })
```

## Two-Way Binding

The `$value` prop creates two-way binding between the input and the signal.

<div id="binding-input-demo"></div>

```javascript
const $message = $('Hello World')

_input({
  label: 'Message',
  $value: $message
})

// The input updates when signal changes, and vice versa
_button({ onclick: () => $message('Reset!') }, 'Reset Signal')
```

## API Reference

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label text |
| `tip` | `string` | Tooltip text shown on hover |
| `$value` | `Signal<any>` | Two-way bound value signal |
| `$error` | `Signal<string\|null>` | Error message signal |
| `type` | `string` | Input type (text, email, password, number, etc.) |
| `placeholder` | `string` | Placeholder text |
| `class` | `string \| function` | Additional CSS classes |
| `oninput` | `function` | Input event handler |
| `onchange` | `function` | Change event handler |
| `disabled` | `boolean` | Disabled state |

## Examples

### Registration Form Field

<div id="register-demo"></div>

```javascript
const $username = $('')
const $usernameError = $(null)
const $email = $('')
const $emailError = $(null)

_input({
  label: 'Username',
  placeholder: 'johndoe',
  $value: $username,
  $error: $usernameError,
  oninput: (e) => validateUsername(e.target.value)
})

_input({
  label: 'Email',
  type: 'email',
  placeholder: 'john@example.com',
  $value: $email,
  $error: $emailError,
  oninput: (e) => validateEmail(e.target.value)
})
```
