# Data Fetching: `_fetch`

The **Fetch Plugin** provides a reactive wrapper around the native browser Fetch API. Instead of managing complex `async/await` flows within your UI, `_fetch` returns a "Reactive Tripod" (Data, Loading, and Error) that your components can listen to automatically.

## 1. Core Concept

When you call `_fetch`, it returns three signals immediately. Your UI declares how to react to these signals as they change from their initial state to the final response.

* **`$data`**: Initialized as `null`. Automatically holds the JSON response on success.
* **`$loading`**: Initialized as `true`. Flips to `false` once the request settles.
* **`$error`**: Initialized as `null`. Holds the error message if the request fails.

---

## 2. Installation

Register the `Fetch` plugin in your `main.js`. By convention, we load it alongside the UI and Router to have the full SigPro ecosystem ready.

```javascript
import { $ } from 'sigpro';
import { Fetch } from 'sigpro/plugins';

$.plugin([Fetch]).then(() => {
  // Now _fetch() is available globally
  import('./App.js').then(app => $.mount(app.default));
});
```


---

## 3. Basic Usage

Use `_fetch` inside your component to get live updates. The UI updates surgically whenever a signal changes.

```javascript
export default () => {
  const { $data, $loading, $error } = _fetch('https://api.github.com/users/octocat');

  return div({ class: 'p-6 flex flex-col gap-4' }, [
    h1("Profile Details"),
    
    // 1. Loading State (using SigPro UI button)
    () => $loading() && _button({ $loading: true }, "Fetching..."),

    // 2. Error State
    () => $error() && div({ class: 'alert alert-error' }, $error()),

    // 3. Success State
    () => $data() && div({ class: 'card bg-base-200 p-4' }, [
      img({ src: $data().avatar_url, class: 'w-16 rounded-full' }),
      h2($data().name),
      p($data().bio)
    ])
  ]);
};
```

---

## 4. Advanced Configuration

`_fetch` accepts the same `RequestInit` options as the standard `fetch()` (methods, headers, body, etc.).

```javascript
const { $data, $loading } = _fetch('/api/v1/update', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'active' })
});
```

---

## 5. Why use `_fetch` instead of native Fetch?

1.  **Declarative UI**: You define the "Loading", "Error", and "Success" templates once, and they swap automatically.
2.  **No `useEffect` required**: Since SigPro is natively reactive, you don't need lifecycle hooks to trigger re-renders; the signals handle it.
3.  **Consistency**: It follows the same `_prefix` pattern as the rest of the official plugin ecosystem.
4.  **Automatic JSON Parsing**: It assumes JSON by default and handles 404/500 errors by populating the `$error` signal.
