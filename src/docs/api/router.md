# 🚦 Routing: `$.router( )` & `$.go( )`

SigPro includes a built-in, lightweight **Hash Router** to create Single Page Applications (SPA). It manages the URL state, matches components to paths, and handles the lifecycle of your pages automatically.

## 🛠 Router Signature

```typescript
$.router(routes: Route[]): HTMLElement
```

### Route Object
| Property | Type | Description |
| :--- | :--- | :--- |
| **`path`** | `string` | The URL fragment (e.g., `"/home"`, `"/user/:id"`, or `"*"`). |
| **`component`** | `Function` | A function that returns a Tag or a `$.view`. |

---

## 📖 Usage Patterns

### 1. Defining Routes
The router returns a `div` element with the class `.router-outlet`. When the hash changes, the router destroys the previous view and mounts the new one inside this container.

```javascript
const App = () => Div({ class: "app-layout" }, [
  Navbar(),
  // The router outlet is placed here
  $.router([
    { path: "/", component: Home },
    { path: "/profile/:id", component: UserProfile },
    { path: "*", component: NotFound }
  ])
]);
```

### 2. Dynamic Segments (`:id`)
When a path contains a colon (e.g., `:id`), the router parses that segment and passes it as an object to the component function.

```javascript
// If the URL is #/profile/42
const UserProfile = (params) => {
  return H1(`User ID is: ${params.id}`); // Displays "User ID is: 42"
};
```

---

## 🏎 Programmatic Navigation: `$.go( )`

To navigate between pages without using an `<a>` tag, use `$.go`. This function updates the browser's hash, which in turn triggers the router to swap components.

### Signature
```typescript
$.go(path: string): void
```

### Examples
```javascript
// Navigate to a static path
Button({ onclick: () => $.go("/") }, "Home")

// Navigate to a dynamic path
Button({ 
  onclick: () => $.go(`/profile/${user.id}`) 
}, "View Profile")
```

---

## ⚡ Technical Behavior

* **Automatic Cleanup**: Every time you navigate, the router calls `.destroy()` on the previous `$.view`. This ensures that all **signals, effects, and event listeners** from the old page are purged from memory.
* **Hash-Based**: By using `window.location.hash`, SigPro works out-of-the-box on any static hosting (like GitHub Pages or Vercel) without needing server-side redirects.
* **Initial Load**: On the first execution, `$.router` automatically reads the current hash or defaults to `/` if empty.

---

## 🎨 Styling the Outlet
Since the router returns a standard DOM element, you can style the transition or the container easily:

```css
.router-outlet {
  flex: 1;
  padding: 2rem;
  animation: fadeIn 0.2s ease-in;
}
```
