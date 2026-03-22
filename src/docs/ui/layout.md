# Layout Components

Layout components for structuring your application with containers, sections, and collapsible panels.

## Fieldset (`_fieldset`)

Groups related form fields with a legend.

<div id="fieldset-demo"></div>


```javascript
_fieldset({ legend: 'Personal Information' }, [
  _input({ label: 'Full Name', $value: $name }),
  _input({ label: 'Email Address', type: 'email', $value: $email }),
  _select({ label: 'Role', options: [...], $value: $role })
])
```

## Accordion (`_accordion`)

Collapsible content panels. Can be used as standalone or grouped.

### Single Accordion

<div id="single-accordion-demo"></div>

```javascript
_accordion({ title: 'What is SigPro UI?' }, [
  $.html('p', {}, 'SigPro UI is a reactive component library...')
])
```

### Grouped Accordions (Radio Behavior)

When multiple accordions share the same `name`, only one can be open at a time.

<div id="grouped-accordion-demo"></div>

```javascript
// Grouped accordions - only one open at a time
_accordion({ title: 'Getting Started', name: 'faq' }, content1)
_accordion({ title: 'Installation', name: 'faq' }, content2)
_accordion({ title: 'Customization', name: 'faq' }, content3)
```

### Accordion with Open State

Control the initial open state with the `open` prop.

<div id="open-accordion-demo"></div>

```javascript
_accordion({ title: 'Open by Default', open: true }, [
  $.html('p', {}, 'This accordion starts open.')
])
```

## Complete Layout Example

<div id="complete-layout-demo"></div>

## API Reference

### `_fieldset`

| Prop | Type | Description |
|------|------|-------------|
| `legend` | `string` | Fieldset title/legend text |
| `class` | `string \| function` | Additional CSS classes |

### `_accordion`

| Prop | Type | Description |
|------|------|-------------|
| `title` | `string` | Accordion header text |
| `name` | `string` | Group name for radio behavior (optional) |
| `open` | `boolean` | Initially open state (default: false) |

## Styling Tips

### Custom Fieldset Styling

```javascript
_fieldset({ 
  legend: 'Custom Styled',
  class: 'bg-primary/10 border-primary' 
}, [
  // content
])
```

### Custom Accordion Styling

```javascript
_accordion({ 
  title: 'Styled Accordion',
  class: 'bg-base-200' 
}, [
  // content
])
```

### Nested Layouts

Layout components can be nested to create complex structures:

```javascript
_fieldset({ legend: 'Main Section' }, [
  _accordion({ title: 'Subsection 1' }, [
    _input({ label: 'Field 1', $value: $field1 })
  ]),
  _accordion({ title: 'Subsection 2' }, [
    _input({ label: 'Field 2', $value: $field2 })
  ])
])
```
