# Creating Custom Plugins

There are two main ways to expose a plugin's functionality: **Static/Manual Imports** (cleaner for large projects) or **Global/Automatic Window Injection** (easier for quick scripts and global helpers).

## 1. The Anatomy of a Plugin

A plugin is a standard JavaScript function. By convention, if a plugin adds a global helper or component, it should be prefixed with an underscore (`_`).

```javascript
// plugins/my-utils.js
export const MyUtils = ($) => {
  
  // 1. Attach to the SigPro instance
  $.capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // 2. Attach to the Window (Global access)
  window._hello = (name) => div(`Hello, ${$.capitalize(name)}!`);
  
  // 3. You can also return values if needed
  return { version: '1.0.0' };
};
```

---

## 2. Integration Strategies

### Option A: Manual Import (Recommended)
This approach keeps your global namespace clean. You import the logic only where you need it, but the plugin still initializes the core `$` extensions.

```javascript
// main.js
import { $ } from 'sigpro';
import { MyUtils } from './plugins/my-utils.js';

$.plugin(MyUtils);

// App.js
export default () => {
  const name = "sigpro";
  // $.capitalize was added by the plugin
  return h1($.capitalize(name)); 
};
```

### Option B: Automatic Window Injection
If your plugin defines global tags (like `_button` or `_hello`), you should attach them to the `window` object inside the plugin function. This makes them available everywhere without imports.

```javascript
// plugins/theme.js
export const Theme = ($) => {
  const $dark = $(false);

  window._themeToggle = () => button({
    onclick: () => $dark(v => !v),
    class: () => $dark() ? 'bg-black text-white' : 'bg-white text-black'
  }, "Toggle Mode");
};

// main.js
$.plugin(Theme).then(() => {
   // _themeToggle is now a global function
   $.mount(App);
});
```

---

## 3. Asynchronous Plugins
If your plugin needs to load external data or scripts before the app starts, make it `async`. SigPro will wait for it.

```javascript
export const ConfigLoader = async ($) => {
  const res = await fetch('/config.json');
  const config = await res.json();
  
  $.config = config; // Attach loaded config to SigPro
};

// Usage
$.plugin(ConfigLoader).then(() => {
  console.log("Config loaded:", $.config);
  $.mount(App);
});
```

---

## 4. Best Practices for Plugin Authors

| Rule | Description |
| :--- | :--- |
| **Prefixing** | Use `_` for UI components (`_modal`) and `$.` for logic (`$.fetch`). |
| **Idempotency** | Ensure calling `$.plugin(MyPlugin)` twice doesn't break the app. |
| **Encapsulation** | Use the `$` instance passed as an argument rather than importing it again inside the plugin. |
| **Reactivity** | Always use `$(...)` for internal state so the app stays reactive. |

