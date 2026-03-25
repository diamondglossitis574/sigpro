# ⚡ Side Effects: `$.effect( )`

The `$.effect` function allows you to run a piece of code whenever the signals it depends on are updated. It automatically tracks any signal called within its body.

## 🛠 Function Signature

```typescript
$.effect(callback: Function): StopFunction
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`callback`** | `Function` | Yes | The code to run. It will execute immediately and then re-run on dependency changes. |

**Returns:** A `StopFunction` that, when called, cancels the effect and prevents further executions.

---

## 📖 Usage Patterns

### 1. Basic Tracking
Any signal you "touch" inside the effect becomes a dependency.

```javascript
const count = $(0);

$.effect(() => {
  // This runs every time 'count' changes
  console.log(`The count is now: ${count()}`);
});

count(1); // Console: "The count is now: 1"
```

### 2. Manual Cleanup
If your effect creates something that needs to be destroyed (like a timer or a global event listener), you can return a cleanup function.

```javascript
$.effect(() => {
  const timer = setInterval(() => console.log("Tick"), 1000);

  // SigPro will run this BEFORE the next effect execution 
  // or when the effect is stopped.
  return () => clearInterval(timer);
});
```

### 3. Nesting & Automatic Cleanup
If you create a signal or another effect inside an effect, SigPro tracks them as "children". When the parent effect re-runs or stops, all children are automatically cleaned up to prevent memory leaks.

```javascript
$.effect(() => {
  if (isLoggedIn()) {
    // This sub-effect is only active while 'isLoggedIn' is true
    $.effect(() => {
      console.log("Fetching user data...");
    });
  }
});
```

---

## 🛑 Stopping an Effect
You can stop an effect manually by calling the function it returns. This is useful for one-time operations or complex logic.

```javascript
const stop = $.effect(() => {
  console.log(count());
});

// Later...
stop(); // The effect is destroyed and will never run again.
```

---

## 💡 Pro Tip: Batching
SigPro uses a **Microtask Queue** to handle updates. If you update multiple signals at once, the effect will only run **once** at the end of the current task.

```javascript
const a = $(0);
const b = $(0);

$.effect(() => console.log(a(), b()));

// This triggers only ONE re-run, not two.
a(1);
b(2);
```
