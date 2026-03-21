(() => {
  let activeEffect = null;

  window.$ = (initial) => {
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

  window.$e = (fn) => {
    const effect = () => {
      const prev = activeEffect;
      activeEffect = effect;
      try { fn(); } finally { activeEffect = prev; }
    };
    effect();
    return effect;
  };

  const h = (tag, props = {}, children = []) => {
    const el = document.createElement(tag);
    for (let [key, val] of Object.entries(props)) {
      if (key.startsWith('on')) {
        el.addEventListener(key.toLowerCase().slice(2), val);
      } else if (key.startsWith('$')) {
        const attr = key.slice(1);
        if ((attr === 'value' || attr === 'checked') && typeof val === 'function') {
          const ev = attr === 'checked' ? 'change' : 'input';
          el.addEventListener(ev, e => val(attr === 'checked' ? e.target.checked : e.target.value));
        }
        $e(() => {
          const v = typeof val === 'function' ? val() : val;
          if (attr === 'value' || attr === 'checked') el[attr] = v;
          else if (typeof v === 'boolean') el.toggleAttribute(attr, v);
          else el.setAttribute(attr, v);
        });
      } else {
        el.setAttribute(key, val);
      }
    }
    const append = (c) => {
      if (Array.isArray(c)) return c.forEach(append);
      if (typeof c === 'function') {
        const node = document.createTextNode('');
        $e(() => {
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
    append(children);
    return el;
  };

  const tags = ['div', 'span', 'p', 'button', 'input', 'h1', 'h2', 'label', 'section', 'ul', 'li', 'a', 'header', 'footer', 'nav', 'main'];
  tags.forEach(tag => {
    window[`_${tag}`] = (props, children) => {
      if (typeof props !== 'object' || props instanceof Node || Array.isArray(props)) {
        return h(tag, {}, props);
      }
      return h(tag, props, children);
    };
  });

  window._storage = (key, initial, storage = localStorage) => {
    const saved = storage.getItem(key);
    const signal = $((saved !== null) ? JSON.parse(saved) : initial);
    $e(() => storage.setItem(key, JSON.stringify(signal())));
    return signal;
  };

  window._router = (routes) => {
  const path = $(window.location.hash.replace(/^#/, "") || "/");
  window.addEventListener("hashchange", () => path(window.location.hash.replace(/^#/, "") || "/"));

  return _div({ class: "router-container" }, [
    () => {
      const current = path();
      
      let params = {};
      const route = routes.find(r => {
        const routeParts = r.path.split('/').filter(Boolean);
        const currentParts = current.split('/').filter(Boolean);
        if (routeParts.length !== currentParts.length) return false;
        
        return routeParts.every((part, i) => {
          if (part.startsWith(':')) {
            params[part.slice(1)] = currentParts[i];
            return true;
          }
          return part === currentParts[i];
        });
      }) || routes.find(r => r.path === "*");

      if (!route) return _h1("404");
      return typeof route.component === 'function' 
        ? route.component(params) 
        : route.component;
    }
  ]);
};

  window._render = (node, target = document.body) => {
    target.innerHTML = ''; 
    const element = typeof node === 'function' ? node() : node;
    target.appendChild(element);
    return element;
  };

  window.Row = (props, children) => _div({
    ...((typeof props === 'object' && !Array.isArray(props)) ? props : {}),
    style: `display:flex; flex-direction:row; gap:10px; ${props?.style || ''}`
  }, (Array.isArray(props) ? props : children));

  window.Col = (props, children) => _div({
    ...((typeof props === 'object' && !Array.isArray(props)) ? props : {}),
    style: `display:flex; flex-direction:column; gap:10px; ${props?.style || ''}`
  }, (Array.isArray(props) ? props : children));
})();
