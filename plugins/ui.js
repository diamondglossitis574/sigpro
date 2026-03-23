/**
 * SigPro UI - daisyUI v5 & Tailwind v4 Plugin
 * Provides a set of reactive functional components, flow control and i18n.
 */
export const UI = ($, defaultLang = 'es') => {
  const ui = {};

  // --- I18N CORE ---
  const i18n = {
    es: { close: "Cerrar", confirm: "Confirmar", cancel: "Cancelar", search: "Buscar...", loading: "Cargando..." },
    en: { close: "Close", confirm: "Confirm", cancel: "Cancel", search: "Search...", loading: "Loading..." }
  };

  const currentLocale = $(defaultLang);

  /**
   * Sets the current locale for internationalization
   * @param {string} locale - The locale code to set (e.g., 'es', 'en')
   */
  ui._setLocale = (locale) => currentLocale(locale);

  /**
   * Returns a function that retrieves a translated string for the current locale
   * @param {string} key - The translation key to look up
   * @returns {Function} Function that returns the translated string
   */
  const translate = (key) => () => i18n[currentLocale()][key] || key;

  // --- UTILITY FUNCTIONS ---

  /**
   * Normalized conditional rendering.
   * @param {Function} condition - Signal returning boolean.
   * @param {*} thenValue - Content if true.
   * @param {*} otherwiseValue - Content if false.
   * @returns {Function} Normalized accessor.
   */
  ui._if = (condition, thenValue, otherwiseValue = null) => {
    return () => {
      const isTrue = condition();
      const result = isTrue ? thenValue : otherwiseValue;
      if (typeof result === 'function' && !(result instanceof HTMLElement)) {
        return result();
      }
      return result;
    };
  };

  /**
   * FOR (List Rendering): Efficient keyed reconciliation with movement optimization.
   * @param {Function} source - Signal function returning an array of items.
   * @param {Function} render - (item, index) => HTMLElement.
   * @param {Function} keyFn - (item, index) => string|number. Required.
   * @returns {HTMLElement} Container with fragment-like behavior and automatic item cleanup.
   */
  ui._for = (source, render, keyFn) => {
    if (typeof keyFn !== 'function') throw new Error('SigPro UI: _for requires a keyFn.');

    const marker = document.createTextNode('');
    const container = $.html('div', { style: 'display:contents' }, [marker]);
    const cache = new Map();

    $(() => {
      const items = source() || [];
      const newKeys = new Set();

      items.forEach((item, index) => {
        const key = keyFn(item, index);
        newKeys.add(key);

        if (cache.has(key)) {
          const runtime = cache.get(key);
          container.insertBefore(runtime.container, marker);
        } else {
          const runtime = $.createRuntime(() => {
            return $.html('div', { style: 'display:contents' }, [render(item, index)]);
          });
          cache.set(key, runtime);
          container.insertBefore(runtime.container, marker);
        }
      });

      cache.forEach((runtime, key) => {
        if (!newKeys.has(key)) {
          runtime.destroy();
          runtime.container.remove();
          cache.delete(key);
        }
      });
    });

    return container;
  };

  /**
  * REQ (Request): Reactive fetch handler with auto-abort on re-executions or component destruction.
  * @param {string|Function} url - Target URL or Signal function returning a URL.
  * @param {Object} [payload] - Data to send in the body.
  * @param {Object} [options] - Fetch options including method, headers, and transform function.
  * @returns {{data: Function, loading: Function, error: Function, success: Function, reload: Function}}
  */
  ui._req = (url, payload = null, options = {}) => {
    const data = $(null), loading = $(false), error = $(null), success = $(false);
    let abortController = null;

    const execute = async (customPayload = null) => {
      const targetUrl = typeof url === 'function' ? url() : url;
      if (!targetUrl) return;

      if (abortController) abortController.abort();
      abortController = new AbortController();

      loading(true); error(null); success(false);
      try {
        const bodyData = customPayload || payload;
        const res = await fetch(targetUrl, {
          method: options.method || (bodyData ? 'POST' : 'GET'),
          headers: { 'Content-Type': 'application/json', ...options.headers },
          body: bodyData ? JSON.stringify(bodyData) : null,
          signal: abortController.signal,
          ...options
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        let json = await res.json();
        if (typeof options.transform === 'function') json = options.transform(json);

        data(json);
        success(true);
      } catch (err) {
        if (err.name !== 'AbortError') error(err.message);
      } finally {
        loading(false);
      }
    };

    $(() => {
      execute();
      return () => abortController?.abort();
    });

    return { data, loading, error, success, reload: (p) => execute(p) };
  };

/**
 * RES (Resource/Response): UI handler for a Request object.
 * @param {Object} reqObj - The object returned by _req.
 * @param {Function} renderFn - (data) => HTMLElement. Executed only on success.
 * @returns {HTMLElement} A reactive container handling loading, error, and success states.
 */
ui._res = (reqObj, renderFn) => div({ class: 'res-container' }, [
  ui._if(reqObj.loading,
    div({ class: 'flex justify-center p-4' }, span({ class: 'loading loading-dots text-primary' }))
  ),
  ui._if(reqObj.error, () =>
    div({ role: 'alert', class: 'alert alert-error' }, [
      span(reqObj.error()),
      ui._button({ class: 'btn-xs btn-ghost border-current', onclick: () => reqObj.reload() }, 'Retry')
    ])
  ),
  ui._if(reqObj.success, () => {
    const current = reqObj.data();
    return current !== null ? renderFn(current) : null;
  })
]);

// --- INTERNAL HELPERS ---

/**
 * Combines base CSS classes with conditional or static extra classes
 * @param {string} baseClasses - Base class names to always include
 * @param {string|Function} extraClasses - Additional classes or function returning classes
 * @returns {string|Function} Combined classes or function that returns combined classes
 */
const combineClasses = (base, extra) => {
  if (typeof extra === 'function') {
    return () => `${base} ${extra() || ''}`.trim();
  }
  return `${base} ${extra || ''}`.trim();
};

// --- UI COMPONENTS ---

/**
   * Button component with loading state, icon, indicator badge, and tooltip support
   * @param {Object} props - Button properties
   * @param {string|number|Function} [props.badge] - Content for the indicator badge
   * @param {string} [props.badgeClass] - daisyUI classes for the badge (e.g., 'badge-primary')
   * @param {HTMLElement|string} [props.icon] - Icon element or string to place before children
   * @param {string} [props.tooltip] - Text to display in the daisyUI tooltip
   * @param {Function} [props.$loading] - SigPro Signal: if true, shows spinner and disables button
   * @param {Function} [props.$disabled] - SigPro Signal: if true, disables the button
   * @param {string|Function} [props.$class] - Additional reactive or static CSS classes for the button
   * @param {Function} [props.onclick] - Click event handler
   * @param {*} children - Button text or inner content
   * @returns {HTMLElement} Button element (wrapped in indicator/tooltip containers if props are present)
   */
ui._button = (props, children) => {
  const btnEl = button({
    ...props,
    badge: undefined,
    badgeClass: undefined,
    tooltip: undefined,
    class: combineClasses('btn', props.$class || props.class),
    $disabled: () => props.$disabled?.() || props.$loading?.()
  }, [
    ui._if(() => props.$loading?.(), span({ class: 'loading loading-spinner' })),
    props.icon && span({ class: 'mr-1' }, props.icon),
    children
  ]);

  let out = btnEl;

  if (props.badge) {
    out = div({ class: 'indicator' }, [
      span({ class: combineClasses(`indicator-item badge ${props.badgeClass || 'badge-secondary'}`) }, props.badge),
      out
    ]);
  }

  if (props.tooltip) {
    out = div({ class: 'tooltip', 'data-tip': props.tooltip }, out);
  }

  return out;
};

/**
   * Input component with label, tooltip, error state, and search placeholder support
   * @param {Object} props - Input properties
   * @param {string} [props.label] - Text for the input label
   * @param {string} [props.tip] - Contextual help text displayed in a tooltip next to the label
   * @param {boolean} [props.isSearch] - If true, uses internationalized "search" placeholder if none provided
   * @param {Function} [props.$value] - SigPro Signal for two-way data binding
   * @param {Function} [props.$error] - SigPro Signal returning an error message string to display
   * @param {string|Function} [props.$class] - Additional reactive or static CSS classes for the input
   * @param {string} [props.placeholder] - Standard HTML placeholder attribute
   * @param {string} [props.type] - Standard HTML input type (text, password, email, etc.)
   * @param {Function} [props.oninput] - Event handler for input changes (handled automatically if $value is a signal)
   * @returns {HTMLElement} Label wrapper containing the label, tooltip, input, and error message
   */
ui._input = (props) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
  ui._if(() => props.label, div({ class: 'flex items-center gap-2' }, [
    span(props.label),
    ui._if(() => props.tip, div({ class: 'tooltip tooltip-right', 'data-tip': props.tip },
      span({ class: 'badge badge-ghost badge-xs' }, '?')))
  ])),
  $.html('input', {
    ...props,
    placeholder: props.placeholder || (props.isSearch ? translate('search') : ''),
    class: combineClasses('input input-bordered w-full', props.$class || props.class),
    $value: props.$value
  }),
  ui._if(() => props.$error?.(), span({ class: 'text-error text-xs' }, () => props.$error()))
]);

/**
 * SELECT: Dropdown component with native SigPro $value binding and keyed options.
 * @param {Object} props - Select properties including $value signal and options array.
 * @returns {HTMLElement} Styled select element within a label wrapper.
 */
ui._select = (props) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
  ui._if(() => props.label, span(props.label)),
  $.html('select', {
    ...props,
    class: combineClasses('select select-bordered', props.$class || props.class),
    $value: props.$value,
    onchange: (e) => props.$value?.(e.target.value)
  }, ui._for(() => props.options || [], opt =>
    $.html('option', { value: opt.value }, opt.label),
    opt => opt.value
  ))
]);

/**
 * Checkbox component with reactive value binding
 * @param {Object} props - Checkbox properties
 * @returns {HTMLElement} Checkbox wrapper element
 */
ui._checkbox = (props) => label({ class: 'label cursor-pointer justify-start gap-3' }, [
  $.html('input', { type: 'checkbox', ...props, class: combineClasses('checkbox', props.$class || props.class), $checked: props.$value }),
  ui._if(() => props.label, span({ class: 'label-text' }, props.label))
]);

/**
 * Radio button component with reactive value binding and group support
 * @param {Object} props - Radio properties
 * @returns {HTMLElement} Radio wrapper element
 */
ui._radio = (props) => label({ class: 'label cursor-pointer justify-start gap-3' }, [
  $.html('input', {
    type: 'radio', ...props,
    class: combineClasses('radio', props.$class || props.class),
    $checked: () => props.$value?.() === props.value,
    onclick: () => props.$value?.(props.value)
  }),
  ui._if(() => props.label, span({ class: 'label-text' }, props.label))
]);

/**
 * Range slider component with reactive value binding
 * @param {Object} props - Range properties
 * @returns {HTMLElement} Range wrapper element
 */
ui._range = (props) => div({ class: 'flex flex-col gap-2' }, [
  ui._if(() => props.label, span({ class: 'label-text' }, props.label)),
  $.html('input', { type: 'range', ...props, class: combineClasses('range', props.$class || props.class), $value: props.$value })
]);

/**
 * MODAL: Dialog component with explicit runtime destruction via watcher.
 * @param {Object} props - Modal properties including $open signal and title.
 * @param {*} children - Inner modal content.
 * @returns {Function} Conditional modal renderer.
 */
ui._modal = (props, children) => {
  let activeRuntime = null;

  return ui._if(props.$open, () => {
    activeRuntime = $.createRuntime(() => dialog({
      class: 'modal modal-open'
    }, [
      div({ class: 'modal-box' }, [
        ui._if(() => props.title, h3({ class: 'text-lg font-bold mb-4' }, props.title)),
        children,
        div({ class: 'modal-action' }, ui._button({ onclick: () => props.$open(false) }, translate('close')))
      ]),
      form({ method: 'dialog', class: 'modal-backdrop', onclick: () => props.$open(false) }, button(translate('close')))
    ]));

    const stopWatcher = $(() => {
      if (!props.$open()) {
        activeRuntime?.destroy();
        stopWatcher();
      }
    });

    return activeRuntime.container;
  });
};

/**
  * Generic Dropdown component for menus, pickers (color/date), or custom lists
  * @param {Object} props - Dropdown properties
  * @param {string|HTMLElement} props.label - Trigger element content (button text/icon)
  * @param {string|Function} [props.$class] - daisyUI classes (e.g., 'dropdown-end', 'dropdown-hover')
  * @param {boolean} [props.isAction] - If true, adds 'dropdown-open' or similar for programmatic control
  * @param {*} children - Dropdown content (ul/li for menus, or custom picker/input components)
  * @returns {HTMLElement} Dropdown container with keyboard focus support
  */
ui._dropdown = (props, children) => div({
  ...props,
  class: combineClasses('dropdown', props.$class || props.class)
}, [
  div({ tabindex: 0, role: 'button', class: 'btn m-1' }, props.label),
  div({
    tabindex: 0,
    class: 'dropdown-content z-[50] p-2 shadow bg-base-100 rounded-box min-w-max'
  }, children)
]);

/**
 * Accordion component with radio/checkbox toggle support
 * @param {Object} props - Accordion properties
 * @param {*} children - Accordion content
 * @returns {HTMLElement} Accordion container
 */
ui._accordion = (props, children) => div({ class: 'collapse collapse-arrow bg-base-200 mb-2' }, [
  $.html('input', { type: props.name ? 'radio' : 'checkbox', name: props.name, checked: props.open }),
  div({ class: 'collapse-title text-xl font-medium' }, props.title),
  div({ class: 'collapse-content' }, children)
]);

/**
 * TABS: Navigation component with reactive items and content slots.
 * @param {Object} props - Tabs properties including items array or signal.
 * @returns {HTMLElement} Tabs container with navigation and content area.
 */
ui._tabs = (props) => {
  const itemsSignal = typeof props.items === 'function' ? props.items : () => props.items || [];

  return div({ class: 'flex flex-col gap-4 w-full' }, [
    div({
      role: 'tablist',
      class: combineClasses('tabs tabs-lifted', props.$class || props.class)
    }, ui._for(itemsSignal, tabItem => a({
      role: 'tab',
      class: () => `tab ${(typeof tabItem.active === 'function' ? tabItem.active() : tabItem.active) ? 'tab-active' : ''}`,
      onclick: tabItem.onclick
    }, tabItem.label), t => t.label)),

    div({ class: 'tab-content-area' }, () => {
      const activeItem = itemsSignal().find(it =>
        typeof it.active === 'function' ? it.active() : it.active
      );
      if (!activeItem) return null;
      return typeof activeItem.content === 'function' ? activeItem.content() : activeItem.content;
    })
  ]);
};

/**
 * Badge component for status indicators
 * @param {Object} props - Badge properties
 * @param {*} children - Badge content
 * @returns {HTMLElement} Badge element
 */
ui._badge = (props, children) => span({ ...props, class: combineClasses('badge', props.$class || props.class) }, children);

/**
 * Tooltip component that shows help text on hover
 * @param {Object} props - Tooltip properties
 * @param {*} children - Tooltip trigger content
 * @returns {HTMLElement} Tooltip container
 */
ui._tooltip = (props, children) => div({ ...props, class: combineClasses('tooltip', props.$class || props.class), 'data-tip': props.tip }, children);

/**
 * Navigation bar component
 * @param {Object} props - Navbar properties
 * @param {*} children - Navbar content
 * @returns {HTMLElement} Navbar container
 */
ui._navbar = (props, children) => div({ ...props, class: combineClasses('navbar bg-base-100 shadow-sm px-4', props.$class || props.class) }, children);

/**
  * Menu component with support for icons, active states, and nested sub-menus
  * @param {Object} props - Menu properties
  * @param {Array<{label: string, icon: HTMLElement, active: Signal/Fn, onclick: Fn, children: Array}>} props.items - Menu items
  * @param {string|Function} [props.$class] - daisyUI classes (e.g., 'menu-horizontal', 'w-56')
  * @returns {HTMLElement} List element with support for multi-level nesting
  */
ui._menu = (props) => {
  const renderItems = (items) => ui._for(() => items || [], it => li({}, [
    it.children ? [
      details({ open: it.open }, [
        summary({}, [
          it.icon && span({ class: 'mr-2' }, it.icon),
          it.label
        ]),
        ul({}, renderItems(it.children))
      ])
    ] :
      a({
        class: () => (typeof it.active === 'function' ? it.active() : it.active) ? 'active' : '',
        onclick: it.onclick
      }, [
        it.icon && span({ class: 'mr-2' }, it.icon),
        it.label
      ])
  ]));

  return ul({
    ...props,
    class: combineClasses('menu bg-base-200 rounded-box', props.$class || props.class)
  }, renderItems(props.items));
};

/**
 * Drawer/sidebar component that slides in from the side
 * @param {Object} props - Drawer properties
 * @returns {HTMLElement} Drawer container
 */
ui._drawer = (props) => div({ class: 'drawer' }, [
  $.html('input', { id: props.id, type: 'checkbox', class: 'drawer-toggle', $checked: props.$open }),
  div({ class: 'drawer-content' }, props.content),
  div({ class: 'drawer-side' }, [
    label({ for: props.id, class: 'drawer-overlay', onclick: () => props.$open?.(false) }),
    div({ class: 'min-h-full bg-base-200 w-80' }, props.side)
  ])
]);

/**
 * Form fieldset component with legend support
 * @param {Object} props - Fieldset properties
 * @param {*} children - Fieldset content
 * @returns {HTMLElement} Fieldset container
 */
ui._fieldset = (props, children) => fieldset({
  ...props,
  class: combineClasses('fieldset bg-base-200 border border-base-300 p-4 rounded-lg', props.$class || props.class)
}, [
  ui._if(() => props.legend, legend({ class: 'fieldset-legend font-bold' }, props.legend)),
  children
]);

/**
 * Stack component for overlapping elements
 * @param {Object} props - Stack properties
 * @param {*} children - Stack content
 * @returns {HTMLElement} Stack container
 */
ui._stack = (props, children) => div({ ...props, class: combineClasses('stack', props.$class || props.class) }, children);

/**
 * Statistics card component for displaying metrics
 * @param {Object} props - Stat properties
 * @returns {HTMLElement} Stat card element
 */
ui._stat = (props) => div({ class: 'stat' }, [
  props.icon && div({ class: 'stat-figure text-secondary' }, props.icon),
  props.label && div({ class: 'stat-title' }, props.label),
  div({ class: 'stat-value' }, typeof props.$value === 'function' ? props.$value : props.value),
  props.desc && div({ class: 'stat-desc' }, props.desc)
]);

/**
 * Toggle switch component that swaps between two states
 * @param {Object} props - Swap properties
 * @returns {HTMLElement} Swap container
 */
ui._swap = (props) => label({ class: 'swap' }, [
  $.html('input', {
    type: 'checkbox',
    $checked: props.$value,
    onchange: (event) => props.$value?.(event.target.checked)
  }),
  div({ class: 'swap-on' }, props.on),
  div({ class: 'swap-off' }, props.off)
]);

let toastContainer = null;

/**
 * TOAST: Notification system with direct reference management and runtime cleanup.
 * @param {string} message - Text to display.
 * @param {string} [type] - daisyUI alert class.
 * @param {number} [duration] - Expiry time in ms.
 */
ui._toast = (message, type = "alert-success", duration = 3500) => {
  let container = document.getElementById('sigpro-toast-container');
  if (!container) {
    container = $.html('div', { id: 'sigpro-toast-container', class: 'fixed top-0 right-0 z-[9999] p-4 flex flex-col gap-2' });
    document.body.appendChild(container);
  }

  const runtime = $.createRuntime(() => {
    const el = div({ class: `alert ${type} shadow-lg transition-all duration-300 translate-x-10 opacity-0` }, [
      span(message),
      ui._button({ class: 'btn-xs btn-circle btn-ghost', onclick: () => remove() }, '✕')
    ]);

    const remove = () => {
      el.classList.add('translate-x-full', 'opacity-0');
      setTimeout(() => {
        runtime.destroy();
        el.remove();
        if (!container.hasChildNodes()) container.remove();
      }, 300);
    };

    setTimeout(remove, duration);
    return el;
  });

  const toastEl = runtime.container.firstChild;
  container.appendChild(runtime.container);
  requestAnimationFrame(() => toastEl.classList.remove('translate-x-10', 'opacity-0'));
};
/**
 * Confirmation dialog component with cancel and confirm actions
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Callback function when confirm is clicked
 */
ui._confirm = (title, message, onConfirm) => {
  const isOpen = $(true);
  const root = div();
  document.body.appendChild(root);
  $.mount(root, () => ui._modal({ $open: isOpen, title }, [
    p({ class: 'py-4' }, message),
    div({ class: 'modal-action gap-2' }, [
      ui._button({ class: 'btn-ghost', onclick: () => isOpen(false) }, translate('cancel')),
      ui._button({ class: 'btn-primary', onclick: () => { onConfirm(); isOpen(false); } }, translate('confirm'))
    ])
  ]));
  $(() => { if (!isOpen()) setTimeout(() => root.remove(), 400); });
};

ui._t = translate;
Object.keys(ui).forEach(key => { window[key] = ui[key]; $[key] = ui[key]; });
};