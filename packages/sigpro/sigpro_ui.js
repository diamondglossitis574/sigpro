/**
 * SigPro UI 2.0 - daisyUI v5 & Tailwind v4 Plugin
 */
(() => {
  if (!window.$) return console.error("[SigPro UI] Fatal: SigPro 2.0 Core not found.");

  $.use(($) => {
    const ui = {};

    const parseClass = (base, extra) => {
      if (typeof extra === 'function') return () => `${base} ${extra() || ''}`;
      return `${base} ${extra || ''}`;
    };

    /** _button @param {Object} p @param {any} [c] */
    ui._button = (p, c) => button({
      ...p,
      class: parseClass('btn', p.$class || p.class),
      $disabled: () => p.$disabled?.() || p.$loading?.()
    }, [
      () => p.$loading?.() ? span({ class: 'loading loading-spinner' }) : null,
      p.icon && span({ class: 'mr-1' }, p.icon),
      c,
      p.badge && span({ class: `badge ${p.badgeClass || ''}` }, p.badge)
    ]);

    /** _input @param {Object} p */
    ui._input = (p) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
      p.label && div({ class: 'flex items-center gap-2' }, [
        span(p.label),
        p.tip && div({ class: 'tooltip tooltip-right', 'data-tip': p.tip }, span({ class: 'badge badge-ghost badge-xs' }, '?'))
      ]),
      $.html('input', { ...p, class: parseClass('input input-bordered w-full', p.$class || p.class), $value: p.$value }),
      () => p.$error?.() ? span({ class: 'text-error text-xs' }, p.$error()) : null
    ]);

    /** _select @param {Object} p */
    ui._select = (p) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
      p.label && span(p.label),
      select({ 
        ...p, 
        class: parseClass('select select-bordered', p.$class || p.class),
        onchange: (e) => p.$value?.(e.target.value)
      }, (p.options || []).map(o => $.html('option', { value: o.value, selected: o.value === p.$value?.() }, o.label)))
    ]);

    /** _checkbox @param {Object} p */
    ui._checkbox = (p) => label({ class: 'label cursor-pointer justify-start gap-3' }, [
      $.html('input', { type: 'checkbox', ...p, class: parseClass('checkbox', p.$class || p.class), $checked: p.$value }),
      p.label && span({ class: 'label-text' }, p.label)
    ]);

    /** _radio @param {Object} p */
    ui._radio = (p) => label({ class: 'label cursor-pointer justify-start gap-3' }, [
      $.html('input', { 
        type: 'radio', ...p, 
        class: parseClass('radio', p.$class || p.class), 
        $checked: () => p.$value?.() === p.value, 
        onclick: () => p.$value?.(p.value) 
      }),
      p.label && span({ class: 'label-text' }, p.label)
    ]);

    /** _range @param {Object} p */
    ui._range = (p) => div({ class: 'flex flex-col gap-2' }, [
      p.label && span({ class: 'label-text' }, p.label),
      $.html('input', { type: 'range', ...p, class: parseClass('range', p.$class || p.class), $value: p.$value })
    ]);

    /** _modal @param {Object} p @param {any} c */
    ui._modal = (p, c) => () => p.$open() ? dialog({ class: 'modal modal-open' }, [
      div({ class: 'modal-box' }, [
        p.title && h3({ class: 'text-lg font-bold mb-4' }, p.title),
        c,
        div({ class: 'modal-action' }, ui._button({ onclick: () => p.$open(false) }, "Cerrar"))
      ]),
      form({ method: 'dialog', class: 'modal-backdrop', onclick: () => p.$open(false) }, button("close"))
    ]) : null;

    /** _dropdown @param {Object} p @param {any} c */
    ui._dropdown = (p, c) => div({ ...p, class: parseClass('dropdown', p.$class || p.class) }, [
      div({ tabindex: 0, role: 'button', class: 'btn m-1' }, p.label),
      div({ tabindex: 0, class: 'dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52' }, c)
    ]);

    /** _accordion @param {Object} p @param {any} c */
    ui._accordion = (p, c) => div({ class: 'collapse collapse-arrow bg-base-200 mb-2' }, [
      $.html('input', { type: p.name ? 'radio' : 'checkbox', name: p.name, checked: p.open }),
      div({ class: 'collapse-title text-xl font-medium' }, p.title),
      div({ class: 'collapse-content' }, c)
    ]);

    /** _tabs @param {Object} p */
    ui._tabs = (p) => div({ role: 'tablist', class: parseClass('tabs tabs-lifted', p.$class || p.class) }, 
      (p.items || []).map(it => a({ 
        role: 'tab', 
        class: () => `tab ${ (typeof it.active === 'function' ? it.active() : it.active) ? 'tab-active' : '' }`,
        onclick: it.onclick
      }, it.label))
    );

    /** _badge @param {Object} p @param {any} c */
    ui._badge = (p, c) => span({ ...p, class: parseClass('badge', p.$class || p.class) }, c);

    /** _tooltip @param {Object} p @param {any} c */
    ui._tooltip = (p, c) => div({ ...p, class: parseClass('tooltip', p.$class || p.class), 'data-tip': p.tip }, c);

    /** _navbar @param {Object} p @param {any} c */
    ui._navbar = (p, c) => div({ ...p, class: parseClass('navbar bg-base-100 shadow-sm px-4', p.$class || p.class) }, c);

    /** _menu @param {Object} p */
    ui._menu = (p) => ul({ ...p, class: parseClass('menu bg-base-200 rounded-box', p.$class || p.class) }, 
      (p.items || []).map(it => li({}, a({ 
        class: () => (typeof it.active === 'function' ? it.active() : it.active) ? 'active' : '', 
        onclick: it.onclick 
      }, [it.icon && span({class:'mr-2'}, it.icon), it.label])))
    );

    /** _drawer @param {Object} p */
    ui._drawer = (p) => div({ class: 'drawer' }, [
      $.html('input', { id: p.id, type: 'checkbox', class: 'drawer-toggle', $checked: p.$open }),
      div({ class: 'drawer-content' }, p.content),
      div({ class: 'drawer-side' }, [
        label({ for: p.id, class: 'drawer-overlay', onclick: () => p.$open?.(false) }),
        div({ class: 'min-h-full bg-base-200 w-80' }, p.side)
      ])
    ]);

    /** _fieldset @param {Object} p @param {any} c */
    ui._fieldset = (p, c) => fieldset({ ...p, class: parseClass('fieldset bg-base-200 border border-base-300 p-4 rounded-lg', p.$class || p.class) }, [
      p.legend && legend({ class: 'fieldset-legend font-bold' }, p.legend),
      c
    ]);

    // Expose components to window and $ object
    Object.keys(ui).forEach(key => {
      window[key] = ui[key];
      $[key] = ui[key];
    });
  });
})();
