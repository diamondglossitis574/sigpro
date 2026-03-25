# 🛑 Untracking: `$.ignore( )`

The `$.ignore` function allows you to read a signal's value inside an effect or a computed signal **without** creating a dependency. 

## 🛠 Function Signature

```typescript
$.ignore(callback: Function): any
```

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| **`callback`** | `Function` | Yes | A function where signals can be read "silently". |

**Returns:** Whatever the callback function returns.

---

## 📖 Usage Patterns

### 1. Preventing Dependency Tracking
Normally, reading a signal inside `$.effect` makes the effect re-run when that signal changes. `$.ignore` breaks this link.

```javascript
const count = $(0);
const logLabel = $("System Log");

$.effect(() => {
  // This effect tracks 'count'...
  const currentCount = count();
  
  // ...but NOT 'logLabel'. 
  // Changing 'logLabel' will NOT re-run this effect.
  const label = $.ignore(() => logLabel());
  
  console.log(`${label}: ${currentCount}`);
});

count(1);     // Console: "System Log: 1" (Triggers re-run)
logLabel("UI"); // Nothing happens in console (Ignored)
```

### 2. Reading State in Event Handlers
Inside complex UI logic, you might want to take a "snapshot" of a signal without triggering a reactive chain.

```javascript
const handleClick = () => {
  // Accessing state without letting the caller know we touched it
  const data = $.ignore(() => mySignal());
  process(data);
};
```

### 3. Avoiding Infinite Loops
If you need to **write** to a signal based on its own value inside an effect (and you aren't using the functional updater), `$.ignore` prevents the effect from triggering itself.

```javascript
$.effect(() => {
  const value = someSignal();
  
  if (value > 100) {
    // We update the signal, but we ignore the read to avoid a loop
    $.ignore(() => someSignal(0));
  }
});
```

---

## 💡 Why use it?

* **Performance:** Prevents expensive effects from running when non-essential data changes.
* **Logic Control:** Allows "sampling" a signal at a specific point in time.
* **Safety:** Essential for complex state orchestrations where circular dependencies might occur.

