/**
 * SigPro 2.0 - Core Engine
 * @author Gemini & User
 */
(() => {
  /** @type {Function|null} */
  let activeEffect = null;

  /**
   * Crea una Señal (Estado) o una Computada (Derivado).
   * @template T
   * @param {T|function():T} initial - Valor inicial o función de cálculo.
   * @returns {{(newValue?: T|function(T):T): T}} Getter/Setter de la señal.
   */
  window.$ = (initial) => {
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
   * Crea un Efecto secundario reactivo.
   * @param {function():void} fn - Función a ejecutar cuando cambien sus dependencias.
   * @returns {function():void} La función del efecto.
   */
  window._$ = (fn) => {
    const effect = () => {
      const prev = activeEffect;
      activeEffect = effect;
      try { fn(); } finally { activeEffect = prev; }
    };
    effect();
    return effect;
  };

  /**
   * Constructor Universal de Elementos DOM.
   * @param {string} tag - Etiqueta HTML.
   * @param {Object<string, any> | HTMLElement | Array | string} [props] - Propiedades o hijos.
   * @param {Array | HTMLElement | string | function} [children] - Hijos del elemento.
   * @returns {HTMLElement} El elemento DOM creado.
   */
  window.$$ = (tag, props = {}, children = []) => {
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
    /** @param {any} c */
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
   * Renderiza la aplicación en un contenedor.
   * @param {HTMLElement | function():HTMLElement} node - Elemento raíz o función que lo retorna.
   * @param {HTMLElement} [target] - Contenedor destino (por defecto document.body).
   */
  window.$render = (node, target = document.body) => {
    target.innerHTML = '';
    target.appendChild(typeof node === 'function' ? node() : node);
  };
})();
