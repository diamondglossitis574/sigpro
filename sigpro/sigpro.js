/**
 * SigPro - Atomic Unified Reactive Engine
 * A lightweight, fine-grained reactivity system with built-in routing and plugin support.
 * @author Gemini & User
 * 
 * Type definitions available in sigpro.d.ts
 */
(() => {
  /** @type {Function|null} Internal tracker for the currently executing reactive effect. */
  let activeEffect = null;

  /**
   * Creates a reactive Signal or Computed value
   * @param {any|Function} initial - Initial value or computed function
   * @param {string} [key] - Optional localStorage key for persistence
   * @returns {Function} Reactive accessor/mutator function
   */
  const $ = (initial, key) => {
    const subs = new Set();

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

    if (key) {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        try { initial = JSON.parse(saved); } catch (e) { }
      }
    }

    return (...args) => {
      if (args.length) {
        const next = typeof args[0] === 'function' ? args[0](initial) : args[0];
        if (!Object.is(initial, next)) {
          initial = next;
          if (key) localStorage.setItem(key, JSON.stringify(initial));
          subs.forEach(s => s());
        }
      }
      if (activeEffect) subs.add(activeEffect);
      return initial;
    };
  };

  /**
   * Creates reactive HTML elements
   * @param {string} tag - HTML tag name
   * @param {Object} [props] - Attributes and event handlers
   * @param {any} [content] - Child content
   * @returns {HTMLElement}
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
        if ((attr === 'value' || attr === 'checked') && typeof val === 'function') {
          const ev = attr === 'checked' ? 'change' : 'input';
          el.addEventListener(ev, e => val(attr === 'checked' ? e.target.checked : e.target.value));
        }
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

  const tags = ['div', 'span', 'p', 'button', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'label', 'section', 'nav', 'main', 'header', 'footer', 'input', 'form', 'img', 'select', 'option', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'canvas', 'video', 'audio'];
  tags.forEach(t => window[t] = (p, c) => $.html(t, p, c));

  /**
   * Mounts a component to the DOM
   * @param {HTMLElement|Function} node - Component or element to mount
   * @param {HTMLElement|string} [target=document.body] - Target element or selector
   */
  $.mount = (node, target = document.body) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) {
      el.innerHTML = '';
      el.appendChild(typeof node === 'function' ? node() : node);
    }
  };

  /**
   * Initializes a hash-based router
   * @param {Array<{path: string, component: Function|Promise|HTMLElement}>} routes
   * @returns {HTMLElement}
   */
  $.router = (routes) => {
    const sPath = $(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", () => sPath(window.location.hash.replace(/^#/, "") || "/"));

    return $.html('div', [
      () => {
        const current = sPath();
        const cP = current.split('/').filter(Boolean);

        const route = routes.find(r => {
          const rP = r.path.split('/').filter(Boolean);
          if (rP.length !== cP.length) return false;
          return rP.every((part, i) => part.startsWith(':') || part === cP[i]);
        }) || routes.find(r => r.path === "*");

        if (!route) return $.html('h1', "404 - Not Found");

        const rP = route.path.split('/').filter(Boolean);
        const params = {};
        rP.forEach((part, i) => {
          if (part.startsWith(':')) params[part.slice(1)] = cP[i];
        });

        const result = typeof route.component === 'function' ? route.component(params) : route.component;

        if (result instanceof Promise) {
          const $lazyNode = $($.html('span', "Loading..."));
          result.then(m => {
            const content = m.default || m;
            const finalView = typeof content === 'function' ? content(params) : content;
            $lazyNode(finalView);
          });
          return () => $lazyNode();
        }

        return result instanceof Node ? result : $.html('span', String(result));
      }
    ]);
  };

  /**
   * Programmatic navigation
   * @param {string} path - Destination path
   */
  $.router.go = (path) => {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
  };

  /**
   * Plugin system - extends SigPro or loads external scripts
   * @param {Function|string|string[]} source - Plugin or script URL(s)
   * @returns {Promise<SigPro>|SigPro}
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

  window.$ = $;
})();