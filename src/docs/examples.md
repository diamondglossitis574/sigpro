# Live Playground

Experience **SigPro's** fine-grained reactivity in real-time. Feel free to tweak the signal values in the editor!

<iframe width="100%" height="600" src="//jsfiddle.net/natxocc/spwran02/4/embedded/" frameborder="0" loading="lazy" allowtransparency="true" allowfullscreen="true"></iframe>
```

---

### 2. Best Practices for Documentation

* **Tab Selection:** You can control which tabs are active by default by changing the URL segment after `/embedded/`.
    * `js,result`: Shows the logic and the output.
    * `html,js,result`: Shows the base structure, the logic, and the output.
* **Height Management:** For complex Store examples, increase the `height` attribute to `500` or `600` so the code is readable without internal scrolling.
* **Responsive Width:** Keeping `width="100%"` ensures the fiddle scales correctly on tablets and mobile devices.

---

### 3. Advanced: The "Fiddle" Component (Optional)
If you plan to have 10+ examples, you can create a global Vue component in VitePress. This keeps your Markdown files clean and allows you to change the theme or default height for all fiddles at once.

**Create `.vitepress/theme/components/Fiddle.vue`:**
```vue
<template>
  <div class="fiddle-wrapper" style="margin: 20px 0;">
    <iframe 
      width="100%" 
      :height="height" 
      :src="`//jsfiddle.net/natxocc/${id}/embedded/${tabs}/dark/`" 
      frameborder="0"
      loading="lazy">
    </iframe>
  </div>
</template>

<script setup>
defineProps({
  id: String,      // e.g., "spwran02/4"
  height: { default: '400' },
  tabs: { default: 'js,result' }
})
</script>
```

**Usage in Markdown:**
```markdown
Check out this store example:
<Fiddle id="spwran02/4" height="500" />
```

---

### Why this is perfect for SigPro:
Because SigPro is **zero-dependency** and runs directly in the browser, your JSFiddle code will be exactly what the user copies into their own `index.html`. There is no hidden "build step" confusing the learner.
