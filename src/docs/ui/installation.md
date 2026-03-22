# Installation

## Prerequisites

- Node.js 18 or higher
- A project with SigPro already installed

## Step 1: Install Dependencies

```bash
npm install -D tailwindcss @tailwindcss/vite daisyui@next
```

## Step 2: Configure Tailwind CSS v4

Create a CSS file (e.g., `src/app.css`):

```css
@import "tailwindcss";
@plugin "daisyui";
```

## Step 3: Import CSS in Your Entry Point

```javascript
// main.js
import './app.css';
import { $ } from 'sigpro';
import { UI } from 'sigpro/plugins';

$.plugin(UI).then(() => {
  console.log('✅ UI Components ready');
  import('./App.js').then(app => $.mount(app.default));
});
```

## Step 4: Verify Installation

<div id="test-install"></div>

## Troubleshooting

### Styles not applying?
- Make sure `app.css` is imported before any other code
- Check that Tailwind is properly configured in your build tool

### Components not found?
- Ensure `$.plugin(UI)` has completed before using components
- Check browser console for any loading errors

### Reactive updates not working?
- Make sure you're passing signals, not primitive values
- Use `$value` prop for two-way binding
