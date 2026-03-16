// Global state for tracking the current reactive effect
let activeEffect = null;
const effectQueue = new Set();
let isFlushScheduled = false;
let flushCount = 0;

const flushEffectQueue = () => {
  isFlushScheduled = false;
  flushCount++;

  if (flushCount > 100) {
    effectQueue.clear();
    flushCount = 0;
    throw new Error("SigPro: Infinite reactive loop detected.");
  }

  try {
    const effects = Array.from(effectQueue);
    effectQueue.clear();
    for (const effect of effects) effect.run();
  } catch (error) {
    console.error("SigPro Flush Error:", error);
  } finally {
    setTimeout(() => {
      flushCount = 0;
    }, 0);
  }
};

/**
 * Creates a reactive signal
 * @param {any} initialValue - Initial value or getter function
 * @returns {Function} Signal getter/setter function
 */
const $ = (initialValue) => {
  const subscribers = new Set();
  let signal;

  if (typeof initialValue === "function") {
    let isDirty = true;
    let cachedValue;

    const computedEffect = {
      dependencies: new Set(),
      markDirty: () => {
        if (!isDirty) {
          isDirty = true;
          subscribers.forEach((sub) => {
            if (sub.markDirty) sub.markDirty();
            effectQueue.add(sub);
          });
          if (!isFlushScheduled && effectQueue.size) {
            isFlushScheduled = true;
            queueMicrotask(flushEffectQueue);
          }
        }
      },
      run: () => {
        computedEffect.dependencies.forEach((dep) => dep.delete(computedEffect));
        computedEffect.dependencies.clear();
        const prev = activeEffect;
        activeEffect = computedEffect;
        try { cachedValue = initialValue(); } 
        finally { activeEffect = prev; isDirty = false; }
      },
    };

    signal = () => {
      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.dependencies.add(subscribers);
      }
      if (isDirty) computedEffect.run();
      return cachedValue;
    };
  } else {
    signal = (...args) => {
      if (args.length) {
        const next = typeof args[0] === "function" ? args[0](initialValue) : args[0];
        if (!Object.is(initialValue, next)) {
          initialValue = next;
          subscribers.forEach((sub) => {
            if (sub.markDirty) sub.markDirty();
            effectQueue.add(sub);
          });
          if (!isFlushScheduled && effectQueue.size) {
            isFlushScheduled = true;
            queueMicrotask(flushEffectQueue);
          }
        }
      }
      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.dependencies.add(subscribers);
      }
      return initialValue;
    };
  }
  return signal;
};

let currentPageCleanups = null;

/**
 * Creates a reactive effect that runs when dependencies change
 * @param {Function} effectFn - The effect function to run
 * @returns {Function} Cleanup function to stop the effect
 */
const $e = (effectFn) => {
  const effect = {
    dependencies: new Set(),
    cleanupHandlers: new Set(),
    run() {
      this.cleanupHandlers.forEach((h) => h());
      this.cleanupHandlers.clear();
      this.dependencies.forEach((dep) => dep.delete(this));
      this.dependencies.clear();

      const prev = activeEffect;
      activeEffect = this;
      try {
        const res = effectFn();
        if (typeof res === "function") this.cleanupHandlers.add(res);
      } finally { activeEffect = prev; }
    },
    stop() {
      this.cleanupHandlers.forEach((h) => h());
      this.dependencies.forEach((dep) => dep.delete(this));
    },
  };

  if (currentPageCleanups) currentPageCleanups.push(() => effect.stop());
  if (activeEffect) activeEffect.cleanupHandlers.add(() => effect.stop());
  
  effect.run();
  return () => effect.stop();
};

/**
 * Persistent signal with localStorage
 * @param {string} key - Storage key
 * @param {any} initialValue - Default value if none stored
 * @param {Storage} [storage=localStorage] - Storage type (localStorage/sessionStorage)
 * @returns {Function} Signal that persists to storage
 */
const $s = (key, initialValue, storage = localStorage) => {
  let initial;
  try {
    const saved = storage.getItem(key);
    if (saved !== null) {
      initial = JSON.parse(saved);
    } else {
      initial = initialValue;
    }
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    initial = initialValue;
    storage.removeItem(key);
  }

  const signal = $(initial);

  $e(() => {
    try {
      const value = signal();
      if (value === undefined || value === null) {
        storage.removeItem(key);
      } else {
        storage.setItem(key, JSON.stringify(value));
      }
    } catch (e) {
      console.warn(`Error saving ${key} to storage:`, e);
    }
  });

  return signal;
};

/**
 * Tagged template literal for creating reactive HTML
 * @param {string[]} strings - Template strings
 * @param {...any} values - Dynamic values
 * @returns {DocumentFragment} Reactive document fragment
 * @see {@link https://developer.mozilla.org/es/docs/Glossary/Cross-site_scripting}
 */
const html = (strings, ...values) => {
  const templateCache = html._templateCache ?? (html._templateCache = new WeakMap());

  const getNodeByPath = (root, path) => path.reduce((node, index) => node?.childNodes?.[index], root);

  const applyTextContent = (node, values) => {
    const parts = node.textContent.split("{{part}}");
    const parent = node.parentNode;
    let valueIndex = 0;

    parts.forEach((part, index) => {
      if (part) parent.insertBefore(document.createTextNode(part), node);
      if (index < parts.length - 1) {
        const currentValue = values[valueIndex++];
        const startMarker = document.createComment("s");
        const endMarker = document.createComment("e");
        parent.insertBefore(startMarker, node);
        parent.insertBefore(endMarker, node);

        if (typeof currentValue === "function") {
          let lastResult;
          $e(() => {
            const result = currentValue();
            if (result === lastResult) return;
            lastResult = result;
            updateContent(result);
          });
        } else {
          updateContent(currentValue);
        }

        function updateContent(result) {
          if (typeof result !== "object" && !Array.isArray(result)) {
            const textNode = startMarker.nextSibling;
            const safeText = String(result ?? "");

            if (textNode !== endMarker && textNode?.nodeType === 3) {
              textNode.textContent = safeText;
            } else {
              while (startMarker.nextSibling !== endMarker) parent.removeChild(startMarker.nextSibling);
              parent.insertBefore(document.createTextNode(safeText), endMarker);
            }
          } else {
            while (startMarker.nextSibling !== endMarker) parent.removeChild(startMarker.nextSibling);

            const items = Array.isArray(result) ? result : [result];
            const fragment = document.createDocumentFragment();
            items.forEach((item) => {
              if (item == null || item === false) return;
              const nodeItem = item instanceof Node ? item : document.createTextNode(item);
              fragment.appendChild(nodeItem);
            });
            parent.insertBefore(fragment, endMarker);
          }
        }
      }
    });
    node.remove();
  };

  let cachedTemplate = templateCache.get(strings);
  if (!cachedTemplate) {
    const template = document.createElement("template");
    template.innerHTML = strings.join("{{part}}");

    const dynamicNodes = [];
    const treeWalker = document.createTreeWalker(template.content, 133);

    const getNodePath = (node) => {
      const path = [];
      while (node && node !== template.content) {
        let index = 0;
        for (let sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) index++;
        path.push(index);
        node = node.parentNode;
      }
      return path.reverse();
    };

    let currentNode;
    while ((currentNode = treeWalker.nextNode())) {
      let isDynamic = false;
      const nodeInfo = {
        type: currentNode.nodeType,
        path: getNodePath(currentNode),
        parts: [],
      };

      if (currentNode.nodeType === 1) {
        for (let i = 0; i < currentNode.attributes.length; i++) {
          const attribute = currentNode.attributes[i];
          if (attribute.value.includes("{{part}}")) {
            nodeInfo.parts.push({ name: attribute.name });
            isDynamic = true;
          }
        }
      } else if (currentNode.nodeType === 3 && currentNode.textContent.includes("{{part}}")) {
        isDynamic = true;
      }

      if (isDynamic) dynamicNodes.push(nodeInfo);
    }

    templateCache.set(strings, (cachedTemplate = { template, dynamicNodes }));
  }

  const fragment = cachedTemplate.template.content.cloneNode(true);
  let valueIndex = 0;

  const targets = cachedTemplate.dynamicNodes.map((nodeInfo) => ({
    node: getNodeByPath(fragment, nodeInfo.path),
    info: nodeInfo,
  }));

  targets.forEach(({ node, info }) => {
    if (!node) return;

    if (info.type === 1) {
      info.parts.forEach((part) => {
        const currentValue = values[valueIndex++];
        const attributeName = part.name;
        const firstChar = attributeName[0];

        if (firstChar === "@") {
          const [eventName, ...modifiers] = attributeName.slice(1).split(".");

          const handlerWrapper = (e) => {
            if (modifiers.includes("prevent")) e.preventDefault();
            if (modifiers.includes("stop")) e.stopPropagation();
            if (modifiers.includes("self") && e.target !== node) return;

            if (modifiers.some((m) => m.startsWith("debounce"))) {
              const ms = modifiers.find((m) => m.startsWith("debounce"))?.split(":")[1] || 300;
              clearTimeout(node._debounceTimer);
              node._debounceTimer = setTimeout(() => currentValue(e), ms);
              return;
            }

            if (modifiers.includes("once")) {
              node.removeEventListener(eventName, handlerWrapper);
            }

            currentValue(e);
          };

          node.addEventListener(eventName, handlerWrapper, {
            passive: modifiers.includes("passive"),
            capture: modifiers.includes("capture"),
          });
        } else if (firstChar === ":") {
          const propertyName = attributeName.slice(1);
          const eventType = node.type === "checkbox" || node.type === "radio" ? "change" : "input";

          if (typeof currentValue === "function") {
            $e(() => {
              const value = currentValue();
              if (node[propertyName] !== value) node[propertyName] = value;
            });
          } else {
            node[propertyName] = currentValue;
          }

          node.addEventListener(eventType, () => {
            const value = eventType === "change" ? node.checked : node.value;
            if (typeof currentValue === "function") currentValue(value);
          });
        } else if (firstChar === "?") {
          const attrName = attributeName.slice(1);

          if (typeof currentValue === "function") {
            $e(() => {
              const result = currentValue();
              node.toggleAttribute(attrName, !!result);
            });
          } else {
            node.toggleAttribute(attrName, !!currentValue);
          }
        } else if (firstChar === ".") {
          const propertyName = attributeName.slice(1);

          if (typeof currentValue === "function") {
            $e(() => {
              const result = currentValue();
              node[propertyName] = result;
              if (result != null && typeof result !== "object" && typeof result !== "boolean") {
                node.setAttribute(propertyName, result);
              }
            });
          } else {
            node[propertyName] = currentValue;
            if (currentValue != null && typeof currentValue !== "object" && typeof currentValue !== "boolean") {
              node.setAttribute(propertyName, currentValue);
            }
          }
        } else {
          if (typeof currentValue === "function") {
            $e(() => node.setAttribute(attributeName, currentValue()));
          } else {
            node.setAttribute(attributeName, currentValue);
          }
        }
      });
    } else if (info.type === 3) {
      const placeholderCount = node.textContent.split("{{part}}").length - 1;
      applyTextContent(node, values.slice(valueIndex, valueIndex + placeholderCount));
      valueIndex += placeholderCount;
    }
  });

  return fragment;
};

/**
 * Creates a page with automatic cleanup
 * @param {Function} setupFunction - Page setup function that receives props
 * @returns {Function} A function that creates page instances with props
 */
const $p = (setupFunction) => {
  const tagName = "page-" + Math.random().toString(36).substring(2, 9);

  customElements.define(
    tagName,
    class extends HTMLElement {
      connectedCallback() {
        this.style.display = "contents";
        this._cleanups = [];
        currentPageCleanups = this._cleanups;

        try {
          const result = setupFunction({
            params: JSON.parse(this.getAttribute("params") || "{}"),
            onUnmount: (fn) => this._cleanups.push(fn),
          });
          this.appendChild(result instanceof Node ? result : document.createTextNode(String(result)));
        } finally {
          currentPageCleanups = null;
        }
      }

      disconnectedCallback() {
        this._cleanups.forEach((fn) => fn());
        this._cleanups = [];
        this.innerHTML = "";
      }
    },
  );

  return (props = {}) => {
    const el = document.createElement(tagName);
    el.setAttribute("params", JSON.stringify(props));
    return el;
  };
};

/**
 * Creates a custom web component with reactive properties
 * @param {string} tagName - Custom element tag name
 * @param {Function} setupFunction - Component setup function
 * @param {string[]} observedAttributes - Array of observed attributes
 */
const $c = (tagName, setupFunction, observedAttributes = []) => {
  if (customElements.get(tagName)) return;

  customElements.define(
    tagName,
    class extends HTMLElement {
      static get observedAttributes() {
        return observedAttributes;
      }

      constructor() {
        super();
        this._propertySignals = {};
        this.cleanupFunctions = [];
        observedAttributes.forEach((attr) => (this._propertySignals[attr] = $(undefined)));
      }

      connectedCallback() {
        const frozenChildren = [...this.childNodes];
        this.innerHTML = "";

        observedAttributes.forEach((attr) => {
          const initialValue = this.hasOwnProperty(attr) ? this[attr] : this.getAttribute(attr);

          Object.defineProperty(this, attr, {
            get: () => this._propertySignals[attr](),
            set: (value) => {
              const processedValue = value === "false" ? false : value === "" && attr !== "value" ? true : value;
              this._propertySignals[attr](processedValue);
            },
            configurable: true,
          });

          if (initialValue !== null && initialValue !== undefined) this[attr] = initialValue;
        });

        const context = {
          select: (selector) => this.querySelector(selector),
          slot: (name) =>
            frozenChildren.filter((node) => {
              const slotName = node.nodeType === 1 ? node.getAttribute("slot") : null;
              return name ? slotName === name : !slotName;
            }),
          emit: (name, detail) => this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })),
          host: this,
          onUnmount: (cleanupFn) => this.cleanupFunctions.push(cleanupFn),
        };

        const result = setupFunction(this._propertySignals, context);
        if (result instanceof Node) this.appendChild(result);
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (this[name] !== newValue) this[name] = newValue;
      }

      disconnectedCallback() {
        this.cleanupFunctions.forEach((cleanupFn) => cleanupFn());
        this.cleanupFunctions = [];
      }
    },
  );
};

/**
 * Ultra-simple fetch wrapper with optional loading signal
 * @param {string} url - Endpoint URL
 * @param {Object} data - Data to send (automatically JSON.stringify'd)
 * @param {Function} [loading] - Optional signal function to track loading state
 * @returns {Promise<Object|null>} Parsed JSON response or null on error
 */
const $f = async (url, data, loading) => {
  if (loading) loading(true);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn("Invalid JSON response");
      return null;
    }
  } catch (e) {
    return null;
  } finally {
    if (loading) loading(false);
  }
};

/**
 * Creates a router for hash-based navigation
 * @param {Array<{path: string|RegExp, component: Function}>} routes - Route configurations
 * @returns {HTMLDivElement} Router container element
 */
const $r = (routes) => {
  const getCurrentPath = () => window.location.hash.replace(/^#/, "") || "/";
  const container = document.createElement("div");
  container.style.display = "contents";

  const render = () => {
    const path = getCurrentPath();
    let matchedRoute = routes.find(r => r.path instanceof RegExp ? path.match(r.path) : r.path === path);
    let routeParams = {};
    
    if (matchedRoute?.path instanceof RegExp) {
      const m = path.match(matchedRoute.path);
      routeParams = m.groups || { id: m[1] };
    }

    const view = matchedRoute ? matchedRoute.component(routeParams) : Object.assign(document.createElement("h1"), { textContent: "404" });
    container.replaceChildren(view instanceof Node ? view : document.createTextNode(String(view ?? "")));
  };

  window.addEventListener("hashchange", render);
  render();
  return container;
};
$r.go = (path) => {
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  if (window.location.hash !== `#${targetPath}`) {
    window.location.hash = targetPath;
  }
};


/* Can customize the name of your functions */

$.effect = $e;
$.page = $p;
$.component = $c;
$.fetch = $f;
$.router = $r;
$.storage = $s;

if (typeof window !== "undefined") {
  window.$ = $;
}
export { $, html };
