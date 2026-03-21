/**
 * SigPro 2.0 - Complete Reactive Engine
 * @author Gemini & User
 */
(() => {
  /** @type {Function|null} */
  let activeEffect = null;

  /**
   * Creates a Signal (State) or a Computed (Derived state).
   * @template T
   * @param {T|function():T} initial - Initial value or a computation function.
   * @returns {{(newValue?: T|function(T):T): T}} A getter/setter function.
   */
  const $ = (initial) => {
    /** @type {Set<Function>} */
    const subs = new Set();
    
    if (typeof initial === 'function') {
      let cached;
      const runner = () => {
        const prev = activeEffect;
        activeEffect = runner;
        try { cached = initial(); } finally { activeEffect = prev; }
        subs.forEach(s => s());
      };
      runner();
      return () => {
        if (activeEffect) subs.add(activeEffect);
        return cached;
      };
    }

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
   * Creates a reactive effect.
   * @param {function():void} fn - The function to execute reactively.
   */
  const _$ = (fn) => {
    const effect = () => {
      const prev = activeEffect;
      activeEffect = effect;
      try { fn(); } finally { activeEffect = prev; }
    };
    effect();
    return effect;
  };

  /**
   * Universal DOM Constructor (Hyperscript).
   * @param {string} tag - HTML Tag name.
   * @param {Object<string, any> | HTMLElement | Array | string} [props] - Attributes or children.
   * @param {Array | HTMLElement | string | function} [children] - Element children.
   * @returns {HTMLElement}
   */
  const $$ = (tag, props = {}, children = []) => {
    const el = document.createElement(tag);
    if (typeof props !== 'object' || props instanceof Node || Array.isArray(props)) {
      children = props; props = {};
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
        _$(() => {
          const v = typeof val === 'function' ? val() : val;
          if (attr === 'value' || attr === 'checked') el[attr] = v;
          else if (typeof v === 'boolean') el.toggleAttribute(attr, v);
          else el.setAttribute(attr, v ?? '');
        });
      } else {
        el.setAttribute(key, val);
      }
    }
    
    const append = (c) => {
      if (Array.isArray(c)) return c.forEach(append);
      if (typeof c === 'function') {
        const node = document.createTextNode('');
        _$(() => {
          const res = c();
          if (res instanceof Node) { if (node.parentNode) node.replaceWith(res); }
          else { node.textContent = res ?? ''; }
        });
        return el.appendChild(node);
      }
      el.appendChild(c instanceof Node ? c : document.createTextNode(c ?? ''));
    };
    append(children);
    return el;
  };

  /**
   * Renders the application into a target element.
   * @param {HTMLElement | function():HTMLElement} node 
   * @param {HTMLElement} [target] 
   */
  const $render = (node, target = document.body) => {
    target.innerHTML = '';
    target.appendChild(typeof node === 'function' ? node() : node);
  };

  /**
   * Hash-based Reactive Router.
   * @param {Array<{path: string, component: function|HTMLElement}>} routes 
   * @returns {HTMLElement}
   */
  const $router = (routes) => {
    const sPath = $(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", () => sPath(window.location.hash.replace(/^#/, "") || "/"));

    return $$('div', { class: "router-view" }, [
      () => {
        const current = sPath();
        let params = {};
        const route = routes.find(r => {
          const rP = r.path.split('/').filter(Boolean);
          const cP = current.split('/').filter(Boolean);
          if (rP.length !== cP.length) return false;
          return rP.every((part, i) => {
            if (part.startsWith(':')) { params[part.slice(1)] = cP[i]; return true; }
            return part === cP[i];
          });
        }) || routes.find(r => r.path === "*");

        if (!route) return $$('h1', '404');
        return typeof route.component === 'function' ? route.component(params) : route.component;
      }
    ]);
  };

  /**
   * Registers a plugin into the SigPro ecosystem.
   * @param {string} name 
   * @param {Object<string, Function>} exports 
   */
  const $use = (name, exports) => {
    Object.assign(window, exports);
    console.log(`%c[SigPro] Plugin Loaded: ${name}`, "color: #00ff7f; font-weight: bold;");
  };

  // --- AUTO-INJECT STANDARD TAGS ---
  const tags = ['div', 'span', 'p', 'button', 'h1', 'h2', 'h3', 'ul', 'li', 'a', 'label', 'section', 'nav', 'main', 'header', 'footer', 'input', 'img', 'form'];
  const standardTags = {};
  tags.forEach(tag => {
    standardTags[tag] = (p, c) => $$(tag, p, c);
  });

  // Global Exports
  Object.assign(window, { $, _$, $$, $render, $router, $use, ...standardTags });
})();
