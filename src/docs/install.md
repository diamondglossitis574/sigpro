# Installation & Setup

SigPro is designed to be drop-in ready. Whether you are building a complex application with a bundler or a simple reactive widget in a single HTML file, SigPro scales with your needs.

## 1. Installation

Choose the method that best fits your workflow:

::: code-group

```bash [npm]
npm install sigpro
````

```bash [pnpm]
pnpm add sigpro
```

```bash [yarn]
yarn add sigpro
```

```bash [bun]
bun add sigpro
```

```html [CDN (ESM)]
<script type="module">
  import { $ } from 'https://cdn.jsdelivr.net/npm/sigpro@latest/+esm';
</script>
```

:::

-----

## 2\. Quick Start Examples

Depending on your installation method, here is how you can get SigPro running in seconds.

::: code-group

```javascript [Mainstream (Bundlers)]
// File: App.js
import { $ } from 'sigpro'; 

export const App = () => {
  // $ is global, but we import it for better IDE intellisense
  const $count = $(0);
  
  // Tags like div, h1, button are available globally
  return div({ class: 'card' }, [
    h1(["Count is: ", $count]),
    button({ onclick: () => $count(c => c + 1) }, "Increment")
  ]);
};

// File: main.js
import { $ } from 'sigpro';
import { App } from './App.js';

$.mount(App, '#app');
```

```html [Classic (Direct CDN)]
<!DOCTYPE html>
<html lang="en">
<body>
  <div id="app"></div>

  <script type="module">
    // Import directly from CDN
    import { $ } from 'https://cdn.jsdelivr.net/npm/sigpro@latest/+esm';

    const $name = $("Developer");

    // No need to import div, section, h2, input... they are global!
    const App = () => section([
      h2(["Welcome, ", $name]),
      input({ 
        type: 'text', 
        $value: $name, // Automatic two-way binding
        placeholder: 'Type your name...' 
      })
    ]);

    $.mount(App, '#app');
  </script>
</body>
</html>
```

:::

-----

## 3\. Global by Design

One of SigPro's core strengths is its **Global API**.

  * **The `$` Function:** Once loaded, it attaches itself to `window.$`. While you can use `import` for better IDE support and type checking, it is accessible everywhere.
  * **HTML Tags:** Common tags (`div`, `span`, `button`, etc.) are automatically registered in the global scope. This eliminates "Import Hell" and keeps your components clean and readable.

## 4\. Why no build step?

Because SigPro uses **native ES Modules** and standard JavaScript functions to generate the DOM, you don't actually *need* a compiler like Babel or a loader for JSX.

  * **Development:** Just save and refresh. No complex HMR issues.
  * **Production:** Use any bundler (Vite, esbuild, Rollup) to tree-shake and minify your final code for maximum performance.

