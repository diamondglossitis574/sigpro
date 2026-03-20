let activeEffect = null;

export const $ = (initial) => {
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

export const $e = (fn) => {
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
    } 
    else if (key.startsWith('$')) {
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
    } 
    else {
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

const tags = ['div', 'span', 'p', 'button', 'input', 'h1', 'h2', 'label', 'section', 'ul', 'li', 'a', 'header', 'footer', 'main', 'nav'];
tags.forEach(tag => {
  window[`_${tag}`] = (props, children) => {
    if (typeof props !== 'object' || props instanceof Node || Array.isArray(props)) {
      return h(tag, {}, props);
    }
    return h(tag, props, children);
  };
});

window.Row = (props, children) => _div({
  ...((typeof props === 'object' && !Array.isArray(props)) ? props : {}),
  style: `display:flex; flex-direction:row; gap:10px; ${props?.style || ''}`
}, (Array.isArray(props) ? props : children));

window.Col = (props, children) => _div({
  ...((typeof props === 'object' && !Array.isArray(props)) ? props : {}),
  style: `display:flex; flex-direction:column; gap:10px; ${props?.style || ''}`
}, (Array.isArray(props) ? props : children));
