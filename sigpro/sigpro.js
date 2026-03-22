/**
 * SigPro 2.0 - Atomic Unified Reactive Engine
 * A lightweight, fine-grained reactivity system with built-in routing and plugin support.
 * @author Gemini & User
 */
(() => {
  /** @type {Function|null} Internal tracker for the currently executing reactive effect. */
  let activeEffect = null;

  /**
   * @typedef {Object} SigPro
   * @property {function(string, Object=, any=): HTMLElement} html - Creates a reactive HTML element.
   * @property {function((HTMLElement|function), (HTMLElement|string)=): void} mount - Mounts a component to the DOM.
   * @property {function(Array<Object>): HTMLElement} router - Initializes a hash-based router.
   * @property {function(string): void} router.go - Programmatic navigation to a hash path.
   * @property {function((function|string|Array<string>)): (Promise<SigPro>|SigPro)} plugin - Extends SigPro or loads external scripts.
   */

  /**
   * Creates a Signal (state) or a Computed/Effect (reaction).
   * @param {any|function} initial - Initial value for a signal, or a function for computed logic.
   * @returns {Function} A reactive accessor/mutator function.
   * @example
   * const $count = $(0); // Signal: $count(5) to update, $count() to read.
   * const $double = $(() => $count() * 2); // Computed: Auto-updates when $count changes.
   */
  const $ = (initial) => {
    const subs = new Set();
    
    // Logic for Computed Signals (Functions)
    if (typeof initial === 'function') {
      let cached;
      const runner = () => {
        const prev = activeEffect;
        activeEffect = runner;
        try { 
          const next = initial();
          if (!Object.is(cached, next)) {
            cached = next;
            subs.forEach(s => s());
          }
        } finally { activeEffect = prev; }
      };
      runner();
      return () => {
        if (activeEffect) subs.add(activeEffect);
        return cached;
      };
    }

    // Logic for Standard Signals (State)
    return (...args) => {
      if (args.length) {
        const next = typeof args[0] === 'function' ? args[0](initial) : args[0];
        if (!Object.is(initial, next)) {
          initial = next;
          subs.forEach(s => s());
        }
      }
      if (activeEffect) subs.add(activeEffect);
      return initial;
    };
  };

  /**
   * Hyperscript engine to render reactive HTML nodes.
   * @param {string} tag - The HTML tag name (e.g., 'div', 'button').
   * @param {Object} [props] - Attributes, events (onclick), or reactive props ($value, $class).
   * @param {any} [content] - String, Node, Array of nodes, or reactive function.
   * @returns {HTMLElement} A live DOM element linked to SigPro signals.
   */
  $.html = (tag, props = {}, content = []) => {
    const el = document.createElement(tag);
    if (typeof props !== 'object' || props instanceof Node || Array.isArray(props) || typeof props === 'function') {
      content = props;
      props = {};
    }

    for (let [key, val] of Object.entries(props)) {
      if (key.startsWith('on')) {
        el.addEventListener(key.toLowerCase().slice(2), val);
      } else if (key.startsWith('$')) {
        const attr = key.slice(1);
        // Two-way binding for inputs
        if ((attr === 'value' || attr === 'checked') && typeof val === 'function') {
          const ev = attr === 'checked' ? 'change' : 'input';
          el.addEventListener(ev, e => val(attr === 'checked' ? e.target.checked : e.target.value));
        }
        // Reactive attribute update
        $(() => {
          const v = typeof val === 'function' ? val() : val;
          if (attr === 'value' || attr === 'checked') el[attr] = v;
          else if (typeof v === 'boolean') el.toggleAttribute(attr, v);
          else el.setAttribute(attr, v ?? '');
        });
      } else el.setAttribute(key, val);
    }

    const append = (c) => {
      if (Array.isArray(c)) return c.forEach(append);
      if (typeof c === 'function') {
        const node = document.createTextNode('');
        $(() => {
          const res = c();
          if (res instanceof Node) {
            if (node.parentNode) node.replaceWith(res);
          } else {
            node.textContent = res ?? '';
          }
        });
        return el.appendChild(node);
      }
      el.appendChild(c instanceof Node ? c : document.createTextNode(c ?? ''));
    };
    append(content);
    return el;
  };

  /**
   * Application mounter.
   * @param {HTMLElement|function} node - Root component or element to mount.
   * @param {HTMLElement|string} [target=document.body] - Target element or CSS selector.
   */
  $.mount = (node, target = document.body) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.innerHTML = '';
      el.appendChild(typeof node === 'function' ? node() : node);
    }
  };

  /**
   * Polymorphic Plugin System.
   * Registers internal functions or loads external .js files as plugins.
   * @param {function|string|Array<string>} source - Plugin function or URL(s).
   * @returns {Promise<SigPro>|SigPro} Resolves with the $ instance after loading or registering.
   */
  $.plugin = (source) => {
    if (typeof source === 'function') {
      source($);
      return $;
    }
    const urls = Array.isArray(source) ? source : [source];
    return Promise.all(urls.map(url => new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => {
        console.log(`%c[SigPro] Plugin Loaded: ${url}`, "color: #51cf66; font-weight: bold;");
        resolve();
      };
      script.onerror = () => reject(new Error(`[SigPro] Failed to load: ${url}`));
      document.head.appendChild(script);
    }))).then(() => $);
  };

  // Global HTML Tag Proxy Helpers
  const tags = ['div', 'span', 'p', 'button', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'label', 'section', 'nav', 'main', 'header', 'footer', 'input', 'form', 'img', 'select', 'option', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'canvas', 'video', 'audio'];
  tags.forEach(t => window[t] = (p, c) => $.html(t, p, c));

  window.$ = $;
})();