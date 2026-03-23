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
   * Conditional rendering component
   * @param {Function} condition - Signal function that returns boolean
   * @param {*} thenValue - Content to render when condition is true
   * @param {*} otherwiseValue - Content to render when condition is false
   * @returns {Function} Function that returns appropriate content based on condition
   */
  ui._if = (condition, thenValue, otherwiseValue = null) => {
    return () => condition() ? thenValue : otherwiseValue;
  };

  /**
   * List rendering component that efficiently updates when the source array changes
   * @param {Function} sourceSignal - Signal function that returns an array of items
   * @param {Function} renderCallback - Callback that renders each item (item, index) => DOM element
   * @returns {HTMLElement} Container element that holds the rendered list
   */
  ui._for = (sourceSignal, renderCallback) => {
    const itemCache = new Map();
    const markerNode = document.createTextNode('');
    const container = $.html('div', { style: 'display:contents' }, [markerNode]);

    $(() => {
      const items = sourceSignal() || [];
      const newCache = new Map();
      const parent = markerNode.parentNode;
      if (!parent) return;

      items.forEach((item, index) => {
        if (itemCache.has(item)) {
          const cached = itemCache.get(item);
          newCache.set(item, cached);
          parent.insertBefore(cached.element, markerNode);
          itemCache.delete(item);
        } else {
          const element = $.html('div', { style: 'display:contents' }, [renderCallback(item, index)]);
          newCache.set(item, {
            element,
            cleanup: () => {
              if (element._cleanups) element._cleanups.forEach(cleanupFn => cleanupFn());
            }
          });
          parent.insertBefore(element, markerNode);
        }
      });

      itemCache.forEach(cached => {
        if (cached.cleanup) cached.cleanup();
        cached.element.remove();
      });

      itemCache.clear();
      newCache.forEach((value, key) => itemCache.set(key, value));
    });

    return container;
  };

  // --- INTERNAL HELPERS ---

  /**
   * Combines base CSS classes with conditional or static extra classes
   * @param {string} baseClasses - Base class names to always include
   * @param {string|Function} extraClasses - Additional classes or function returning classes
   * @returns {string|Function} Combined classes or function that returns combined classes
   */
  const combineClasses = (baseClasses, extraClasses) => {
    if (typeof extraClasses === 'function') return () => `${baseClasses} ${extraClasses() || ''}`;
    return `${baseClasses} ${extraClasses || ''}`;
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
   * Select dropdown component with reactive options and value binding
   * @param {Object} props - Select properties
   * @returns {HTMLElement} Select wrapper element
   */
  ui._select = (props) => label({ class: 'fieldset-label flex flex-col gap-1' }, [
    ui._if(() => props.label, span(props.label)),
    select({
      ...props,
      class: combineClasses('select select-bordered', props.$class || props.class),
      onchange: (event) => props.$value?.(event.target.value)
    }, ui._for(() => props.options || [], option =>
      $.html('option', { value: option.value, selected: option.value === props.$value?.() }, option.label))
    )
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
   * Modal dialog component with open state control
   * @param {Object} props - Modal properties
   * @param {*} children - Modal content
   * @returns {Function} Function that renders modal when open condition is true
   */
  ui._modal = (props, children) => ui._if(props.$open,
    dialog({ class: 'modal modal-open' }, [
      div({ class: 'modal-box' }, [
        ui._if(() => props.title, h3({ class: 'text-lg font-bold mb-4' }, props.title)),
        children,
        div({ class: 'modal-action' }, ui._button({ onclick: () => props.$open(false) }, translate('close')))
      ]),
      form({ method: 'dialog', class: 'modal-backdrop', onclick: () => props.$open(false) }, button(translate('close')))
    ])
  );

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
     * Tabs component with navigation and reactive content slots
     * @param {Object} props - Tabs properties
     * @param {Array} props.items - Array of tab objects { label, active: Signal/Fn, onclick: Fn, content: HTMLElement/Fn }
     * @param {string|Function} [props.$class] - Optional extra classes for the tab container
     * @returns {HTMLElement} Tabs container with navigation and content area
     */
  ui._tabs = (props) => div({ class: 'flex flex-col gap-4 w-full' }, [
    div({
      role: 'tablist',
      class: combineClasses('tabs tabs-lifted', props.$class || props.class)
    }, ui._for(() => props.items || [], tabItem => a({
      role: 'tab',
      class: () => `tab ${(typeof tabItem.active === 'function' ? tabItem.active() : tabItem.active) ? 'tab-active' : ''}`,
      onclick: tabItem.onclick
    }, tabItem.label))
    ),
    div({ class: 'tab-content-area' }, () => {
      const activeItem = (props.items || []).find(it =>
        typeof it.active === 'function' ? it.active() : it.active
      );
      return activeItem ? (typeof activeItem.content === 'function' ? activeItem.content() : activeItem.content) : null;
    })
  ]);

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
   * Toast notification component that auto-dismisses after a duration
   * @param {string} message - The message to display
   * @param {string} type - Alert type (e.g., "alert-success", "alert-error")
   * @param {number} duration - Time in milliseconds before auto-dismiss
   */
  ui._toast = (message, type = "alert-success", duration = 3500) => {
    if (!toastContainer || !toastContainer.isConnected) {
      toastContainer = div({ class: "fixed top-0 right-0 z-[9999] p-4 flex flex-col gap-3 pointer-events-none items-end w-full max-w-sm" });
      document.body.appendChild(toastContainer);
    }

    const closeToast = (toastElement) => {
      if (!toastElement || toastElement._closing) return;
      toastElement._closing = true;
      toastElement.style.transform = "translateX(100%)";
      toastElement.style.opacity = "0";
      setTimeout(() => {
        toastElement.style.maxHeight = "0px";
        toastElement.style.marginBottom = "-0.75rem";
        toastElement.style.padding = "0px";
      }, 150);
      toastElement.addEventListener("transitionend", () => {
        toastElement.remove();
        if (toastContainer && !toastContainer.hasChildNodes()) {
          toastContainer.remove();
          toastContainer = null;
        }
      });
    };

    const toastElement = div({ class: "card bg-base-100 shadow-xl border border-base-200 w-full overflow-hidden transition-all duration-500 transform translate-x-full opacity-0 pointer-events-auto", style: "max-height: 200px;" }, [
      div({ class: "card-body p-1" }, [
        div({ role: "alert", class: `alert ${type} alert-soft border-none p-3 flex items-center justify-between gap-4` }, [
          span({ class: "font-medium text-sm" }, message),
          button({ class: "btn btn-ghost btn-xs btn-circle", onclick: (event) => closeToast(event.target.closest(".card")) }, [
            span({ class: "icon-[lucide--x] w-4 h-4" })
          ])
        ])
      ])
    ]);

    toastContainer.appendChild(toastElement);
    requestAnimationFrame(() => requestAnimationFrame(() => toastElement.classList.remove("translate-x-full", "opacity-0")));
    setTimeout(() => closeToast(toastElement), duration);
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