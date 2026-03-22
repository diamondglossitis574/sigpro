# Form Components

SigPro UI provides a complete set of reactive form components including select dropdowns, checkboxes, radio buttons, and range sliders.

## Select Dropdown (`_select`)

Creates a reactive dropdown select with options.

<div id="select-demo"></div>

```javascript
const $role = $('user')

_select({
  label: 'User Role',
  options: [
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'Standard User' },
    { value: 'guest', label: 'Guest' }
  ],
  $value: $role
})
```

## Checkbox (`_checkbox`)

Reactive checkbox with label.

<div id="checkbox-demo"></div>


```javascript
const $agreed = $(false)

_checkbox({
  label: 'I agree to the terms and conditions',
  $value: $agreed
})
```

## Radio Button (`_radio`)

Radio buttons for selecting one option from a group.

<div id="radio-demo"></div>

```javascript
const $payment = $('credit')

_radio({ name: 'payment', label: 'Credit Card', value: 'credit', $value: $payment })
_radio({ name: 'payment', label: 'PayPal', value: 'paypal', $value: $payment })
_radio({ name: 'payment', label: 'Crypto', value: 'crypto', $value: $payment })
```

## Range Slider (`_range`)

Reactive range slider for numeric values.

<div id="range-demo"></div>

```javascript
const $volume = $(50)

_range({
  label: 'Volume',
  min: 0,
  max: 100,
  step: 1,
  $value: $volume
})
```

## Complete Form Example

<div id="complete-form-demo"></div>


## API Reference

### `_select`

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Field label |
| `options` | `Array<{value: any, label: string}>` | Select options |
| `$value` | `Signal<any>` | Selected value signal |

### `_checkbox`

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Checkbox label |
| `$value` | `Signal<boolean>` | Checked state signal |

### `_radio`

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Radio group name |
| `label` | `string` | Radio option label |
| `value` | `any` | Value for this option |
| `$value` | `Signal<any>` | Group selected value signal |

### `_range`

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Slider label |
| `min` | `number` | Minimum value |
| `max` | `number` | Maximum value |
| `step` | `number` | Step increment |
| `$value` | `Signal<number>` | Current value signal |
