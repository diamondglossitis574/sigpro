/**
 * SigPro 2.0 UI - daisyUI v5 & Tailwind v4 Plugin
 */
(() => {
  if (!window.$ || !window.$.use) return console.error("[SigPro UI] Core not found.");

  $.use(($) => {
    const parseClass = (base, extra) => {
      if (typeof extra === 'function') return () => `${base} ${extra() || ''}`;
      return `${base} ${extra || ''}`;
    };

    /** @param {Object} p @param {any} [c] */
    $._button = (p, c) => button({
      ...p,
      class: parseClass('btn', p.$class || p.class),
      $disabled: () => p.$disabled?.() || p.$loading?.()
    }, [
      () => p.$loading?.() ? span({ class: 'loading loading-spinner' }) : null,
      p.icon && span({ class: 'mr-1' }, p.icon),
      c,
      p.badge && span({ class: `badge ${p.badgeClass || ''}` }, p.badge)
    ]);

    /** @param {Object} p */
    $._input = (p) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
      p.label && div({ class: 'flex items-center gap-2' }, [
        span(p.label),
        p.tip && div({ class: 'tooltip tooltip-right', 'data-tip': p.tip }, span({ class: 'badge badge-ghost badge-xs' }, '?'))
      ]),
      $.html('input', { ...p, class: parseClass('input input-bordered w-full', p.$class || p.class), $value: p.$value }),
      () => p.$error?.() ? span({ class: 'text-error text-xs' }, p.$error()) : null
    ]);

    /** @param {Object} p */
    $._select = (p) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
      p.label && span(p.label),
      select({ 
        ...p, 
        class: parseClass('select select-bordered', p.$class || p.class),
        onchange: (e) => p.$value?.(e.target.value)
      }, (p.options || []).map(o => $.html('option', { value: o.value, selected: o.value === p.$value?.() }, o.label)))
    ]);

    /** @param {Object} p */
    $._checkbox = (p) => label({ class: 'label cursor-pointer justify-start gap-3' }, [
      $.html('input', { type: 'checkbox', ...p, class: parseClass('checkbox', p.$class || p.class), $checked: p.$value }),
      p.label && span({ class: 'label-text' }, p.label)
    ]);

    /** @param {Object} p */
    $._modal = (p, c) => () => p.$open() ? dialog({ class: 'modal modal-open' }, [
      div({ class: 'modal-box' }, [
        p.title && h3({ class: 'text-lg font-bold mb-4' }, p.title),
        c,
        div({ class: 'modal-action' }, $._button({ onclick: () => p.$open(false) }, "Close"))
      ]),
      form({ method: 'dialog', class: 'modal-backdrop', onclick: () => p.$open(false) }, button("close"))
    ]) : null;

    /** @param {Object} p */
    $._tabs = (p) => div({ role: 'tablist', class: parseClass('tabs tabs-lifted', p.$class || p.class) }, 
      (p.items || []).map(it => a({ 
        role: 'tab', 
        class: () => `tab ${ (typeof it.active === 'function' ? it.active() : it.active) ? 'tab-active' : '' }`,
        onclick: it.onclick
      }, it.label))
    );

    /** @param {Object} p */
    $._menu = (p) => ul({ ...p, class: parseClass('menu bg-base-200 rounded-box', p.$class || p.class) }, 
      (p.items || []).map(it => li({}, a({ 
        class: () => (typeof it.active === 'function' ? it.active() : it.active) ? 'active' : '', 
        onclick: it.onclick 
      }, [it.icon && span({class:'mr-2'}, it.icon), it.label])))
    );

    /** @param {Object} p */
    $._drawer = (p) => div({ class: 'drawer' }, [
      $.html('input', { id: p.id, type: 'checkbox', class: 'drawer-toggle', $checked: p.$open }),
      div({ class: 'drawer-content' }, p.content),
      div({ class: 'drawer-side' }, [
        label({ for: p.id, class: 'drawer-overlay', onclick: () => p.$open?.(false) }),
        div({ class: 'min-h-full bg-base-200 w-80' }, p.side)
      ])
    ]);

    /** @param {Object} p @param {any} c */
    $._fieldset = (p, c) => fieldset({ ...p, class: parseClass('fieldset bg-base-200 border border-base-300 p-4 rounded-lg', p.$class || p.class) }, [
      p.legend && legend({ class: 'fieldset-legend font-bold' }, p.legend),
      c
    ]);
  });
})();
