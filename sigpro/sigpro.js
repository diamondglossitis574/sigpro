/**
 * SigPro
 */
(() => {
  let activeEffect = null;
  let currentOwner = null;
  const effectQueue = new Set();
  let isFlushing = false;
  const MOUNTED_NODES = new WeakMap();

  const flush = () => {
    if (isFlushing) return;
    isFlushing = true;
    while (effectQueue.size > 0) {
      const sorted = Array.from(effectQueue).sort((a, b) => (a.depth || 0) - (b.depth || 0));
      effectQueue.clear();
      for (const eff of sorted) if (!eff._deleted) eff();
    }
    isFlushing = false;
  };

  const track = subs => {
    if (activeEffect && !activeEffect._deleted) {
      subs.add(activeEffect);
      activeEffect._deps.add(subs);
    }
  };

  const trigger = (subs) => {
    for (const eff of subs) {
      if (eff === activeEffect || eff._deleted) continue;
      if (eff._isComputed) {
        eff.markDirty();
        if (eff._subs) trigger(eff._subs);
      } else {
        effectQueue.add(eff);
      }
    }
    if (!isFlushing) queueMicrotask(flush);
  };

  const isObj = v => v && typeof v === 'object' && !(v instanceof Node);
  const PROXIES = new WeakMap();
  const RAW_SUBS = new WeakMap();

  const getPropSubs = (target, prop) => {
    let props = RAW_SUBS.get(target);
    if (!props) RAW_SUBS.set(target, (props = new Map()));
    let subs = props.get(prop);
    if (!subs) props.set(prop, (subs = new Set()));
    return subs;
  };

  const $ = (initial, key) => {
    if (isObj(initial) && !key && typeof initial !== 'function') {
      if (PROXIES.has(initial)) return PROXIES.get(initial);
      const proxy = new Proxy(initial, {
        get(t, p, r) {
          track(getPropSubs(t, p));
          const val = Reflect.get(t, p, r);
          return isObj(val) ? $(val) : val;
        },
        set(t, p, v, r) {
          const old = Reflect.get(t, p, r);
          if (Object.is(old, v)) return true;
          const res = Reflect.set(t, p, v, r);
          trigger(getPropSubs(t, p));
          if (Array.isArray(t) && p !== 'length') trigger(getPropSubs(t, 'length'));
          return res;
        },
        deleteProperty(t, p) {
          const res = Reflect.deleteProperty(t, p);
          trigger(getPropSubs(t, p));
          return res;
        }
      });
      PROXIES.set(initial, proxy);
      return proxy;
    }

    if (typeof initial === 'function') {
      const subs = new Set();
      let cached, dirty = true;

      const effect = () => {
        if (effect._deleted) return;
        effect._cleanups.forEach(c => c());
        effect._cleanups.clear();
        effect._deps.forEach(s => s.delete(effect));
        effect._deps.clear();

        const prev = activeEffect;
        activeEffect = effect;
        try {
          let maxD = 0;
          effect._deps.forEach(s => { if (s._d > maxD) maxD = s._d; });
          effect.depth = maxD + 1;
          subs._d = effect.depth;

          const val = initial();
          if (!Object.is(cached, val) || dirty) {
            cached = val;
            dirty = false;
            trigger(subs);
          }
        } finally {
          activeEffect = prev;
        }
      };

      effect._isComputed = true;
      effect._deps = new Set();
      effect._cleanups = new Set();
      effect._subs = subs;
      effect.markDirty = () => dirty = true;
      effect.stop = () => {
        effect._deleted = true;
        effectQueue.delete(effect);
        effect._cleanups.forEach(c => c());
        effect._deps.forEach(s => s.delete(effect));
        subs.clear();
      };

      if (currentOwner) {
        currentOwner.cleanups.add(effect.stop);
        effect._isComputed = false;
        effect();
        return () => { };
      }

      return () => {
        if (dirty) effect();
        track(subs);
        return cached;
      };
    }

    const subs = new Set();
    subs._d = 0;
    if (key) {
      try { const s = localStorage.getItem(key); if (s !== null) initial = JSON.parse(s); } catch (e) { }
    }

    return (...args) => {
      if (args.length) {
        const next = typeof args[0] === 'function' ? args[0](initial) : args[0];
        if (!Object.is(initial, next)) {
          initial = next;
          if (key) try { localStorage.setItem(key, JSON.stringify(initial)); } catch (e) { }
          trigger(subs);
        }
      }
      track(subs);
      return initial;
    };
  };

  const sweep = node => {
    if (node._cleanups) { node._cleanups.forEach(f => f()); node._cleanups.clear(); }
    node.childNodes?.forEach(sweep);
  };

  const createRuntime = fn => {
    const cleanups = new Set();
    const prev = currentOwner;
    currentOwner = { cleanups };
    const container = $.html('div', { style: 'display:contents' });
    try {
      const res = fn({ onCleanup: f => cleanups.add(f) });
      const process = n => {
        if (!n) return;
        if (n._isRuntime) { cleanups.add(n.destroy); container.appendChild(n.container); }
        else if (Array.isArray(n)) n.forEach(process);
        else container.appendChild(n instanceof Node ? n : document.createTextNode(String(n)));
      };
      process(res);
    } finally { currentOwner = prev; }
    return {
      _isRuntime: true,
      container,
      destroy: () => {
        cleanups.forEach(f => f());
        sweep(container);
        container.remove();
      }
    };
  };

  $.html = (tag, props = {}, content = []) => {
    if (props instanceof Node || Array.isArray(props) || typeof props !== "object") {
      content = props; props = {};
    }
    const el = document.createElement(tag);
    el._cleanups = new Set();

    for (let [k, v] of Object.entries(props)) {
      if (k.startsWith('on')) {
        const name = k.slice(2).toLowerCase().split('.')[0];
        const mods = k.slice(2).toLowerCase().split('.').slice(1);
        const handler = e => { if (mods.includes('prevent')) e.preventDefault(); if (mods.includes('stop')) e.stopPropagation(); v(e); };
        el.addEventListener(name, handler, { once: mods.includes('once') });
        el._cleanups.add(() => el.removeEventListener(name, handler));
      } else if (k.startsWith('$')) {
        const attr = k.slice(1);
        const stopAttr = $(() => {
          const val = typeof v === 'function' ? v() : v;
          if (attr === 'value' || attr === 'checked') el[attr] = val;
          else if (typeof val === 'boolean') el.toggleAttribute(attr, val);
          else val == null ? el.removeAttribute(attr) : el.setAttribute(attr, val);
        });
        el._cleanups.add(stopAttr);
        if ((attr === 'value' || attr === 'checked') && typeof v === 'function') {
          const evt = attr === 'checked' ? 'change' : 'input';
          const h = e => v(e.target[attr]);
          el.addEventListener(evt, h);
          el._cleanups.add(() => el.removeEventListener(evt, h));
        }
      } else el.setAttribute(k, v);
    }

    const append = c => {
      if (Array.isArray(c)) c.forEach(append);
      else if (typeof c === 'function') {
        const marker = document.createTextNode('');
        el.appendChild(marker);
        let nodes = [marker];
        const stopList = $(() => {
          const res = c();
          const next = (Array.isArray(res) ? res : [res]).map(i => i?.container || (i instanceof Node ? i : document.createTextNode(i ?? '')));
          if (marker.parentNode) {
            next.forEach(n => marker.parentNode.insertBefore(n, marker));
            nodes.forEach(n => { if (n !== marker) { sweep(n); n.remove(); } });
            nodes = [...next, marker];
          }
        });
        el._cleanups.add(stopList);
      } else el.appendChild(c instanceof Node ? c : document.createTextNode(c ?? ''));
    };
    append(content);
    return el;
  };

  const tags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'ul', 'li', 'button', 'input', 'label', 'form', 'section', 'a', 'img', 'nav', 'hr'];
  window.$ = new Proxy($, { get: (t, p) => t[p] || (tags.includes(p) ? (pr, c) => t.html(p, pr, c) : undefined) });
  tags.forEach(t => window[t] = (p, c) => $.html(t, p, c));

  $.router = routes => {
    const sPath = $(window.location.hash.replace(/^#/, '') || '/');
    const handler = () => sPath(window.location.hash.replace(/^#/, '') || '/');
    window.addEventListener('hashchange', handler);
    const outlet = $.html('div', { class: 'router-outlet' });
    let current = null;

    if (currentOwner) currentOwner.cleanups.add(() => {
      window.removeEventListener('hashchange', handler);
      if (current) current.destroy();
    });

    $(() => {
      const path = sPath(), parts = path.split('/').filter(Boolean);
      const route = routes.find(r => {
        const rp = r.path.split('/').filter(Boolean);
        return rp.length === parts.length && rp.every((p, i) => p.startsWith(':') || p === parts[i]);
      }) || routes.find(r => r.path === '*');

      if (current) current.destroy();
      if (!route) return outlet.replaceChildren($.html('h1', '404'));
      const params = {};
      route.path.split('/').filter(Boolean).forEach((p, i) => { if (p.startsWith(':')) params[p.slice(1)] = parts[i]; });
      current = createRuntime(() => route.component(params));
      outlet.replaceChildren(current.container);
    });
    return outlet;
  };

  $.router.go = p => window.location.hash = p.replace(/^#?\/?/, '#/');

  $.mount = (component, target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;

    if (MOUNTED_NODES.has(el)) {
      MOUNTED_NODES.get(el).destroy();
    }

    const instance = createRuntime(typeof component === 'function' ? component : () => component);
    el.replaceChildren(instance.container);
    MOUNTED_NODES.set(el, instance);
    return instance;
  };

})();
export const {$} = window;