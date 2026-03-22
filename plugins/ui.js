/**
 * SigPro UI - daisyUI v5 & Tailwind v4 Plugin
 * Provides a set of reactive functional components.
 */

export const UI = ($) => {
  const ui = {};

  /**
   * Internal helper to merge base classes with reactive or static extra classes.
   * @param {string} base - The default daisyUI class.
   * @param {string|function} extra - User-provided classes.
   * @returns {string|function} Merged classes.
   */
  const parseClass = (base, extra) => {
    if (typeof extra === 'function') return () => `${base} ${extra() || ''}`;
    return `${base} ${extra || ''}`;
  };

  /**
   * Standard Button component.
   * @param {Object} p - Properties.
   * @param {string|function} [p.class] - Extra CSS classes.
   * @param {function} [p.$loading] - Reactive loading state.
   * @param {function} [p.$disabled] - Reactive disabled state.
   * @param {HTMLElement|string} [p.icon] - Leading icon.
   * @param {string} [p.badge] - Badge text.
   * @param {any} c - Children content.
   */
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

  /**
   * Form Input with label, tooltip, and error handling.
   * @param {Object} p - Input properties.
   * @param {string} [p.label] - Field label.
   * @param {string} [p.tip] - Tooltip text.
   * @param {function} [p.$value] - Reactive signal for the value.
   * @param {function} [p.$error] - Reactive signal for error messages.
   */
  ui._input = (p) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
    p.label && div({ class: 'flex items-center gap-2' }, [
      span(p.label),
      p.tip && div({ class: 'tooltip tooltip-right', 'data-tip': p.tip },
        span({ class: 'badge badge-ghost badge-xs' }, '?'))
    ]),
    $.html('input', {
      ...p,
      class: parseClass('input input-bordered w-full', p.$class || p.class),
      $value: p.$value
    }),
    () => p.$error?.() ? span({ class: 'text-error text-xs' }, p.$error()) : null
  ]);

  /**
   * Select dropdown component.
   * @param {Object} p - Select properties.
   * @param {Array<{value: any, label: string}>} p.options - Array of options.
   * @param {function} p.$value - Reactive signal for the selected value.
   */
  ui._select = (p) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
    p.label && span(p.label),
    select({
      ...p,
      class: parseClass('select select-bordered', p.$class || p.class),
      onchange: (e) => p.$value?.(e.target.value)
    }, (p.options || []).map(o =>
      $.html('option', { value: o.value, selected: o.value === p.$value?.() }, o.label))
    )
  ]);

  /**
   * Checkbox component.
   */
  ui._checkbox = (p) => label({ class: 'label cursor-pointer justify-start gap-3' }, [
    $.html('input', { type: 'checkbox', ...p, class: parseClass('checkbox', p.$class || p.class), $checked: p.$value }),
    p.label && span({ class: 'label-text' }, p.label)
  ]);

  /**
   * Radio button component.
   */
  ui._radio = (p) => label({ class: 'label cursor-pointer justify-start gap-3' }, [
    $.html('input', {
      type: 'radio', ...p,
      class: parseClass('radio', p.$class || p.class),
      $checked: () => p.$value?.() === p.value,
      onclick: () => p.$value?.(p.value)
    }),
    p.label && span({ class: 'label-text' }, p.label)
  ]);

  /**
   * Range slider component.
   */
  ui._range = (p) => div({ class: 'flex flex-col gap-2' }, [
    p.label && span({ class: 'label-text' }, p.label),
    $.html('input', { type: 'range', ...p, class: parseClass('range', p.$class || p.class), $value: p.$value })
  ]);

  /**
   * Modal dialog component.
   * @param {Object} p - Modal properties.
   * @param {function} p.$open - Reactive signal (boolean) to control visibility.
   * @param {any} c - Modal body content.
   */
  ui._modal = (p, c) => () => p.$open() ? dialog({ class: 'modal modal-open' }, [
    div({ class: 'modal-box' }, [
      p.title && h3({ class: 'text-lg font-bold mb-4' }, p.title),
      c,
      div({ class: 'modal-action' }, ui._button({ onclick: () => p.$open(false) }, "Close"))
    ]),
    form({ method: 'dialog', class: 'modal-backdrop', onclick: () => p.$open(false) }, button("close"))
  ]) : null;

  /**
   * Dropdown menu component.
   */
  ui._dropdown = (p, c) => div({ ...p, class: parseClass('dropdown', p.$class || p.class) }, [
    div({ tabindex: 0, role: 'button', class: 'btn m-1' }, p.label),
    div({ tabindex: 0, class: 'dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52' }, c)
  ]);

  /**
   * Accordion/Collapse component.
   */
  ui._accordion = (p, c) => div({ class: 'collapse collapse-arrow bg-base-200 mb-2' }, [
    $.html('input', { type: p.name ? 'radio' : 'checkbox', name: p.name, checked: p.open }),
    div({ class: 'collapse-title text-xl font-medium' }, p.title),
    div({ class: 'collapse-content' }, c)
  ]);

  /**
   * Tabs navigation component.
   * @param {Object} p - Tab properties.
   * @param {Array<{label: string, active: boolean|function, onclick: function}>} p.items - Tab items.
   */
  ui._tabs = (p) => div({ role: 'tablist', class: parseClass('tabs tabs-lifted', p.$class || p.class) },
    (p.items || []).map(it => a({
      role: 'tab',
      class: () => `tab ${(typeof it.active === 'function' ? it.active() : it.active) ? 'tab-active' : ''}`,
      onclick: it.onclick
    }, it.label))
  );

  /**
   * Badge component.
   */
  ui._badge = (p, c) => span({ ...p, class: parseClass('badge', p.$class || p.class) }, c);

  /**
   * Tooltip wrapper.
   */
  ui._tooltip = (p, c) => div({ ...p, class: parseClass('tooltip', p.$class || p.class), 'data-tip': p.tip }, c);

  /**
   * Navbar component.
   */
  ui._navbar = (p, c) => div({ ...p, class: parseClass('navbar bg-base-100 shadow-sm px-4', p.$class || p.class) }, c);

  /**
   * Vertical Menu component.
   */
  ui._menu = (p) => ul({ ...p, class: parseClass('menu bg-base-200 rounded-box', p.$class || p.class) },
    (p.items || []).map(it => li({}, a({
      class: () => (typeof it.active === 'function' ? it.active() : it.active) ? 'active' : '',
      onclick: it.onclick
    }, [it.icon && span({ class: 'mr-2' }, it.icon), it.label])))
  );

  /**
   * Sidebar Drawer component.
   */
  ui._drawer = (p) => div({ class: 'drawer' }, [
    $.html('input', { id: p.id, type: 'checkbox', class: 'drawer-toggle', $checked: p.$open }),
    div({ class: 'drawer-content' }, p.content),
    div({ class: 'drawer-side' }, [
      label({ for: p.id, class: 'drawer-overlay', onclick: () => p.$open?.(false) }),
      div({ class: 'min-h-full bg-base-200 w-80' }, p.side)
    ])
  ]);

  /**
   * Fieldset wrapper with legend.
   */
  ui._fieldset = (p, c) => fieldset({
    ...p,
    class: parseClass('fieldset bg-base-200 border border-base-300 p-4 rounded-lg', p.$class || p.class)
  }, [
    p.legend && legend({ class: 'fieldset-legend font-bold' }, p.legend),
    c
  ]);

  // Expose components globally and to the SigPro instance
  Object.keys(ui).forEach(key => {
    window[key] = ui[key];
    $[key] = ui[key];
  });
};