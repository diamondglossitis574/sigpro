# SigPro Playground 🚀

An interactive online environment to experiment with **SigPro** - a minimalist reactive library for building reactive user interfaces directly in the browser.

![SigPro Playground](https://via.placeholder.com/800x400?text=SigPro+Playground)

## 🌟 Features

- **Zero Setup** - No installation required, works directly in the browser
- **Live Preview** - See your code results in real-time
- **Built-in SigPro** - Full library included with `$`, `$$`, `html`, `$component`, and `$router`
- **Error Console** - Instant feedback on syntax and runtime errors
- **Code Sharing** - Generate shareable URLs with your code
- **Auto-execution** - Runs automatically as you type (with debounce)
- **Keyboard Shortcuts** - Ctrl+Enter to manually execute
- **Clean Interface** - Modern dark-themed editor inspired by VS Code

## 🎮 Quick Start

### Online Version
Simply open the `play.html` file in your web browser and start coding!

### Write Your First Code

```javascript
// Create reactive signals
const name = $('World');
const count = $(0);

// Create an effect that reacts to changes
$$(() => {
    document.body.innerHTML = `
        <h1>Hello ${name()}!</h1>
        <p>Count: ${count()}</p>
        <button onclick="count(c => c + 1)">Increment</button>
    `;
});

// Update signals and watch the magic happen
setTimeout(() => name('SigPro'), 2000);
```

## 📖 Usage Guide

### The Editor Panel

- **Write Code** - The left panel contains the code editor with syntax highlighting
- **Auto-execute** - Code runs automatically 1 second after you stop typing
- **Manual Run** - Click the "Run" button or press `Ctrl+Enter`
- **Format** - Click "Format" to beautify your code (coming soon)
- **Share** - Generate a shareable link with your current code
- **Reset** - Restore the default example

### The Preview Panel

- **Live Results** - See your code output in real-time
- **Error Display** - Any errors appear in the console at the bottom
- **Clean Slate** - Each execution starts with a fresh environment

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Execute code manually |
| `Ctrl + S` | Save current code (coming soon) |

## 🎯 Example Code Snippets

### Basic Counter
```javascript
const counter = $(0);

setInterval(() => {
    counter(c => c + 1);
}, 1000);

$$(() => {
    document.body.innerHTML = `<h1>Counter: ${counter()}</h1>`;
});
```

### Two-way Binding with html Tag
```javascript
const text = $('Edit me');

document.body.appendChild(html`
    <div>
        <input :value="${text}" placeholder="Type something...">
        <p>You typed: ${text}</p>
    </div>
`);
```

### Computed Values
```javascript
const price = $(10);
const quantity = $(2);
const total = $(() => price() * quantity());

$$(() => {
    document.body.innerHTML = `
        <div>
            <p>Price: $${price()}</p>
            <p>Quantity: ${quantity()}</p>
            <p><strong>Total: $${total()}</strong></p>
            <button onclick="price(p => p + 1)">+ Price</button>
            <button onclick="quantity(q => q + 1)">+ Quantity</button>
        </div>
    `;
});
```

### Custom Component
```javascript
$component('my-button', (props, { emit }) => {
    return html`
        <button @click="${() => emit('click', props.count())}">
            Count is: ${() => props.count()}
        </button>
    `;
}, ['count']);

document.body.appendChild(html`
    <my-button :count="${$(5)}"></my-button>
`);
```

## 🔗 Sharing Code

1. Write your code in the editor
2. Click the **Share** button
3. Copy the generated URL
4. Share it with anyone - they'll see exactly your code!

The code is encoded in the URL, so no backend storage is needed.

## 🛠️ Advanced Features

### Using the Router
```javascript
const routes = [
    { path: '/', component: () => html`<h1>Home</h1>` },
    { path: '/about', component: () => html`<h1>About</h1>` },
    { path: /^\/user\/(?<id>.+)/, component: (params) => html`<h1>User: ${params.id}</h1>` }
];

document.body.appendChild($router(routes));
$router.go('/about');
```

### Working with Lists
```javascript
const items = $(['Apple', 'Banana', 'Orange']);

$$(() => {
    document.body.innerHTML = `
        <ul>
            ${items().map(item => `<li>${item}</li>`).join('')}
        </ul>
        <button onclick="items([...items(), 'New Fruit'])">Add</button>
    `;
});
```

## 📦 SigPro API Reference

| Function | Description |
|----------|-------------|
| `$(value)` | Creates a reactive signal |
| `$$(effect)` | Creates a reactive effect |
| `html\`...\`` | Tagged template for reactive HTML |
| `$component(name, setup, attrs)` | Creates a web component |
| `$router(routes)` | Creates a hash-based router |

## 🤔 Troubleshooting

**Error: "Cannot read property..."**
- Make sure you're accessing signal values with `signal()`, not `signal`

**Nothing shows in preview**
- Check the error console for syntax errors
- Make sure you're appending to `document.body` or using `html` correctly

**Changes not updating**
- Verify you're using `$$()` to create effects
- Signals must be called as functions: `count()` not `count`

## 🌐 Browser Support

Works in all modern browsers (Chrome, Firefox, Safari, Edge) that support:
- JavaScript ES6+
- Custom Elements (for `$component`)
- iframe sandboxing

## 📝 License

MIT License - feel free to use, modify, and distribute!

## 🤝 Contributing

Found a bug or want to improve the playground? Feel free to:
- Report issues
- Suggest new features
- Submit improvements

---

**Happy Coding with SigPro!** ⚡
