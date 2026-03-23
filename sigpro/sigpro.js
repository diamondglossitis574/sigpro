/**
 * SigPro v2.0
 */
(() => {
  let activeEffect = null;
  const effectQueue = new Set();
  let isFlushScheduled = false;
  let flushCount = 0;

  // --- Motor de Batching con Protección (v1 + v2) ---
  const flushQueue = () => {
    isFlushScheduled = false;
    flushCount++;

    if (flushCount > 100) {
      effectQueue.clear();
      throw new Error("SigPro: Bucle infinito detectado");
    }

    const effects = Array.from(effectQueue);
    effectQueue.clear();
    effects.forEach(fn => fn());

    // Resetear contador al final del microtask
    queueMicrotask(() => flushCount = 0);
  };

  const scheduleFlush = (s) => {
    effectQueue.add(s);
    if (!isFlushScheduled) {
      isFlushScheduled = true;
      queueMicrotask(flushQueue);
    }
  };

  const $ = (initial, key) => {
    const subs = new Set();

    // 1. Objetos Reactivos (v2)
    if (initial?.constructor === Object && !key) {
      const store = {};
      for (let k in initial) store[k] = $(initial[k]);
      return store;
    }

    // 2. Efectos y Computados con Limpieza (v1 + v2)
    if (typeof initial === 'function') {
      let cached, running = false;
      const cleanups = new Set();

      const runner = () => {
        if (runner.el && !runner.el.isConnected) return; // GC: v2
        if (running) return;

        // Ejecutar limpiezas previas (v1)
        cleanups.forEach(fn => fn());
        cleanups.clear();

        const prev = activeEffect;
        activeEffect = runner;
        activeEffect.onCleanup = (fn) => cleanups.add(fn); // Registro de limpieza

        running = true;
        try {
          const next = initial();
          if (!Object.is(cached, next)) {
            cached = next;
            subs.forEach(scheduleFlush);
          }
        } finally {
          activeEffect = prev;
          running = false;
        }
      };
      runner();
      return () => {
        if (activeEffect) subs.add(activeEffect);
        return cached;
      };
    }

    // 3. Persistencia (v2)
    if (key) {
      const saved = localStorage.getItem(key);
      if (saved !== null) try { initial = JSON.parse(saved); } catch (e) { }
    }

    // 4. Señal Atómica
    return (...args) => {
      if (args.length) {
        const next = typeof args[0] === 'function' ? args[0](initial) : args[0];
        if (!Object.is(initial, next)) {
          initial = next;
          if (key) localStorage.setItem(key, JSON.stringify(initial));
          subs.forEach(scheduleFlush);
        }
      }
      if (activeEffect) {
        subs.add(activeEffect);
        if (activeEffect.onCleanup) activeEffect.onCleanup(() => subs.delete(activeEffect));
      }
      return initial;
    };
  };

  // --- Motor de Renderizado con Modificadores de v1 ---
  $.html = (tag, props = {}, content = []) => {
    const el = document.createElement(tag);
    if (props instanceof Node || Array.isArray(props) || typeof props !== 'object') {
      content = props; props = {};
    }

    for (let [key, val] of Object.entries(props)) {
      if (key.startsWith('on')) {
        const [rawName, ...mods] = key.toLowerCase().slice(2).split('.');
        const handler = (e) => {
          if (mods.includes('prevent')) e.preventDefault();
          if (mods.includes('stop')) e.stopPropagation();

          if (mods.some(m => m.startsWith('debounce'))) {
            const ms = mods.find(m => m.startsWith('debounce')).split(':')[1] || 300;
            clearTimeout(val._timer);
            val._timer = setTimeout(() => val(e), ms);
          } else {
            val(e);
          }
        };
        el.addEventListener(rawName, handler, { once: mods.includes('once') });
      }
      else if (key.startsWith('$')) {
        const attr = key.slice(1);
        const attrEff = () => {
          const v = typeof val === 'function' ? val() : val;
          if (attr === 'value' || attr === 'checked') el[attr] = v;
          else if (typeof v === 'boolean') el.toggleAttribute(attr, v);
          else if (v == null) el.removeAttribute(attr);
          else el.setAttribute(attr, v);
        };
        attrEff.el = el; $(attrEff);

        if ((attr === 'value' || attr === 'checked') && typeof val === 'function') {
          el.addEventListener(attr === 'checked' ? 'change' : 'input', e =>
            val(attr === 'checked' ? e.target.checked : e.target.value)
          );
        }
      } else el.setAttribute(key, val);
    }

    const append = (c) => {
      if (Array.isArray(c)) return c.forEach(append);
      if (typeof c === 'function') {
        let nodes = [document.createTextNode('')];
        const contentEff = () => {
          const res = c();
          const nextNodes = (Array.isArray(res) ? res : [res]).map(i =>
            i instanceof Node ? i : document.createTextNode(i ?? '')
          );
          if (nextNodes.length === 0) nextNodes.push(document.createTextNode(''));

          if (nodes[0].parentNode) {
            const parent = nodes[0].parentNode;
            nextNodes.forEach(n => parent.insertBefore(n, nodes[0]));
            nodes.forEach(n => n.remove());
            nodes = nextNodes;
          }
        };
        contentEff.el = nodes[0];
        nodes.forEach(n => el.appendChild(n));
        $(contentEff);
        return;
      }
      el.appendChild(c instanceof Node ? c : document.createTextNode(c ?? ''));
    };

    append(content);
    return el;
  };

  const tags = ['div', 'span', 'p', 'h1', 'h2', 'ul', 'li', 'button', 'input', 'label', 'form', 'section', 'a', 'img'];
  tags.forEach(t => window[t] = (p, c) => $.html(t, p, c));

  // --- Router mejorado ---
  $.router = (routes) => {
    // Señal persistente del path actual
    const sPath = $(window.location.hash.replace(/^#/, "") || "/");

    // Listener nativo
    window.addEventListener("hashchange", () => sPath(window.location.hash.replace(/^#/, "") || "/"));

    const container = div({ class: "router-outlet" });

    const routeEff = () => {
      const cur = sPath();
      const cP = cur.split('/').filter(Boolean);

      // Buscamos la ruta (incluyendo parámetros :id y wildcard *)
      const route = routes.find(r => {
        const rP = r.path.split('/').filter(Boolean);
        return rP.length === cP.length && rP.every((p, i) => p.startsWith(':') || p === cP[i]);
      }) || routes.find(r => r.path === "*");

      if (!route) return container.replaceChildren(h1("404 - Not Found"));

      // Extraer parámetros dinámicos
      const params = {};
      route.path.split('/').filter(Boolean).forEach((p, i) => {
        if (p.startsWith(':')) params[p.slice(1)] = cP[i];
      });

      const res = typeof route.component === 'function' ? route.component(params) : route.component;

      // Renderizado Seguro con replaceChildren (v1 spirit)
      if (res instanceof Promise) {
        const loader = span("Cargando...");
        container.replaceChildren(loader);
        res.then(c => container.replaceChildren(c instanceof Node ? c : document.createTextNode(c)));
      } else {
        container.replaceChildren(res instanceof Node ? res : document.createTextNode(res));
      }
    };

    routeEff.el = container; // Seguridad de SigPro v2
    $(routeEff);

    return container;
  };

  // Vinculamos el método .go
  $.router.go = (path) => {
    const target = path.startsWith('/') ? path : `/${path}`;
    window.location.hash = target;
  };

  $.mount = (node, target = 'body') => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) { el.innerHTML = ''; el.appendChild(typeof node === 'function' ? node() : node); }
  };

  window.$ = $;
})();