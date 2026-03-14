// Global state for tracking the current reactive effect
let activeEffect = null;

// Queue for batched effect updates
const effectQueue = new Set();
let isFlushScheduled = false;

/**
 * Flushes all pending effects in the queue
 * Executes all queued jobs and clears the queue
 */
const flushEffectQueue = () => {
  isFlushScheduled = false;
  try {
    for (const effect of effectQueue) {
      effect.run();
    }
    effectQueue.clear();
  } catch (error) {
    console.error("SigPro Flush Error:", error);
  }
};

/**
 * Creates a reactive signal
 * @param {any} initialValue - Initial value or getter function
 * @returns {Function} Signal getter/setter function
 */
export const $ = (initialValue) => {
  const subscribers = new Set();

  if (typeof initialValue === "function") {
    // Computed signal case
    let isDirty = true;
    let cachedValue;

    const computedEffect = {
      dependencies: new Set(),
      cleanupHandlers: new Set(),
      markDirty: () => {
        if (!isDirty) {
          isDirty = true;
          subscribers.forEach((subscriber) => {
            if (subscriber.markDirty) subscriber.markDirty();
            effectQueue.add(subscriber);
          });
        }
      },
      run: () => {
        // Clear old dependencies
        computedEffect.dependencies.forEach((dependencySet) => dependencySet.delete(computedEffect));
        computedEffect.dependencies.clear();

        const previousEffect = activeEffect;
        activeEffect = computedEffect;
        try {
          cachedValue = initialValue();
        } finally {
          activeEffect = previousEffect;
          isDirty = false;
        }
      },
    };

    return () => {
      if (activeEffect) {
        subscribers.add(activeEffect);
        activeEffect.dependencies.add(subscribers);
      }
      if (isDirty) computedEffect.run();
      return cachedValue;
    };
  }

  // Regular signal case
  return (...args) => {
    if (args.length) {
      const nextValue = typeof args[0] === "function" ? args[0](initialValue) : args[0];
      if (!Object.is(initialValue, nextValue)) {
        initialValue = nextValue;
        subscribers.forEach((subscriber) => {
          if (subscriber.markDirty) subscriber.markDirty();
          effectQueue.add(subscriber);
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
};

/**
 * Creates a reactive effect that runs when dependencies change
 * @param {Function} effectFn - The effect function to run
 * @returns {Function} Cleanup function to stop the effect
 */
export const $effect = (effectFn) => {
  const effect = {
    dependencies: new Set(),
    cleanupHandlers: new Set(),
    run() {
      // Run cleanup handlers
      this.cleanupHandlers.forEach((handler) => handler());
      this.cleanupHandlers.clear();

      // Clear old dependencies
      this.dependencies.forEach((dependencySet) => dependencySet.delete(this));
      this.dependencies.clear();

      const previousEffect = activeEffect;
      activeEffect = this;
      try {
        const result = effectFn();
        if (typeof result === "function") this.cleanupFunction = result;
      } finally {
        activeEffect = previousEffect;
      }
    },
    stop() {
      this.cleanupHandlers.forEach((handler) => handler());
      this.dependencies.forEach((dependencySet) => dependencySet.delete(this));
      this.cleanupFunction?.();
    },
  };

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
export const $$ = (key, initialValue, storage = localStorage) => {
  // Load saved value
  const saved = storage.getItem(key);
  const signal = $(saved !== null ? JSON.parse(saved) : initialValue);

  // Auto-save on changes
  $effect(() => {
    const value = signal();
    if (value === undefined || value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, JSON.stringify(value));
    }
  });

  return signal;
};

/**
 * Tagged template literal for creating reactive HTML
 * @param {string[]} strings - Template strings
 * @param {...any} values - Dynamic values
 * @returns {DocumentFragment} Reactive document fragment
 */
export const html = (strings, ...values) => {
  const templateCache = html._templateCache ?? (html._templateCache = new WeakMap());

  /**
   * Gets a node by path from root
   * @param {Node} root - Root node
   * @param {number[]} path - Path indices
   * @returns {Node} Target node
   */
  const getNodeByPath = (root, path) => path.reduce((node, index) => node?.childNodes?.[index], root);

  /**
   * Applies reactive text content to a node
   * @param {Node} node - Target node
   * @param {any[]} values - Values to insert
   */
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

        let lastResult;
        $effect(() => {
          let result = typeof currentValue === "function" ? currentValue() : currentValue;
          if (result === lastResult) return;
          lastResult = result;

          if (typeof result !== "object" && !Array.isArray(result)) {
            const textNode = startMarker.nextSibling;
            if (textNode !== endMarker && textNode?.nodeType === 3) {
              textNode.textContent = result ?? "";
            } else {
              while (startMarker.nextSibling !== endMarker) parent.removeChild(startMarker.nextSibling);
              parent.insertBefore(document.createTextNode(result ?? ""), endMarker);
            }
            return;
          }

          // Handle arrays or objects
          while (startMarker.nextSibling !== endMarker) parent.removeChild(startMarker.nextSibling);

          const items = Array.isArray(result) ? result : [result];
          const fragment = document.createDocumentFragment();
          items.forEach((item) => {
            if (item == null || item === false) return;
            const nodeItem = item instanceof Node ? item : document.createTextNode(item);
            fragment.appendChild(nodeItem);
          });
          parent.insertBefore(fragment, endMarker);
        });
      }
    });
    node.remove();
  };

  // Get or create template from cache
  let cachedTemplate = templateCache.get(strings);
  if (!cachedTemplate) {
    const template = document.createElement("template");
    template.innerHTML = strings.join("{{part}}");

    const dynamicNodes = [];
    const treeWalker = document.createTreeWalker(template.content, 133); // NodeFilter.SHOW_ALL

    /**
     * Gets path indices for a node
     * @param {Node} node - Target node
     * @returns {number[]} Path indices
     */
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
        // Element node
        for (let i = 0; i < currentNode.attributes.length; i++) {
          const attribute = currentNode.attributes[i];
          if (attribute.value.includes("{{part}}")) {
            nodeInfo.parts.push({ name: attribute.name });
            isDynamic = true;
          }
        }
      } else if (currentNode.nodeType === 3 && currentNode.textContent.includes("{{part}}")) {
        // Text node
        isDynamic = true;
      }

      if (isDynamic) dynamicNodes.push(nodeInfo);
    }

    templateCache.set(strings, (cachedTemplate = { template, dynamicNodes }));
  }

  const fragment = cachedTemplate.template.content.cloneNode(true);
  let valueIndex = 0;

  // Get target nodes before applyTextContent modifies the DOM
  const targets = cachedTemplate.dynamicNodes.map((nodeInfo) => ({
    node: getNodeByPath(fragment, nodeInfo.path),
    info: nodeInfo,
  }));

  targets.forEach(({ node, info }) => {
    if (!node) return;

    if (info.type === 1) {
      // Element node
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

            // Debounce
            if (modifiers.some((m) => m.startsWith("debounce"))) {
              const ms = modifiers.find((m) => m.startsWith("debounce"))?.split(":")[1] || 300;
              clearTimeout(node._debounceTimer);
              node._debounceTimer = setTimeout(() => currentValue(e), ms);
              return;
            }

            // Once (auto-remover)
            if (modifiers.includes("once")) {
              node.removeEventListener(eventName, handlerWrapper);
            }

            currentValue(e);
          };

          node.addEventListener(eventName, handlerWrapper, {
            passive: modifiers.includes("passive"),
            capture: modifiers.includes("capture"),
          });

          // Cleanup
          if ($effect.onCleanup) {
            $effect.onCleanup(() => node.removeEventListener(eventName, handlerWrapper));
          }
        } else if (firstChar === ":") {
          // Two-way binding
          const propertyName = attributeName.slice(1);
          const eventType = node.type === "checkbox" || node.type === "radio" ? "change" : "input";

          $effect(() => {
            const value = typeof currentValue === "function" ? currentValue() : currentValue;
            if (node[propertyName] !== value) node[propertyName] = value;
          });

          node.addEventListener(eventType, () => {
            const value = eventType === "change" ? node.checked : node.value;
            if (typeof currentValue === "function") currentValue(value);
          });
        } else if (firstChar === "?") {
          // Boolean attribute
          const attrName = attributeName.slice(1);
          $effect(() => {
            const result = typeof currentValue === "function" ? currentValue() : currentValue;
            node.toggleAttribute(attrName, !!result);
          });
        } else if (firstChar === ".") {
          // Property binding
          const propertyName = attributeName.slice(1);
          $effect(() => {
            let result = typeof currentValue === "function" ? currentValue() : currentValue;
            node[propertyName] = result;
            if (result != null && typeof result !== "object" && typeof result !== "boolean") {
              node.setAttribute(propertyName, result);
            }
          });
        } else {
          // Regular attribute
          if (typeof currentValue === "function") {
            $effect(() => node.setAttribute(attributeName, currentValue()));
          } else {
            node.setAttribute(attributeName, currentValue);
          }
        }
      });
    } else if (info.type === 3) {
      // Text node
      const placeholderCount = node.textContent.split("{{part}}").length - 1;
      applyTextContent(node, values.slice(valueIndex, valueIndex + placeholderCount));
      valueIndex += placeholderCount;
    }
  });

  return fragment;
};

/**
 * Creates a custom web component with reactive properties
 * @param {string} tagName - Custom element tag name
 * @param {Function} setupFunction - Component setup function
 * @param {string[]} observedAttributes - Array of observed attributes
 */
export const $component = (tagName, setupFunction, observedAttributes = []) => {
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
export const $fetch = async (url, data, loading) => {
  if (loading) loading(true);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
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
export const $router = (routes) => {
  /**
   * Gets current path from hash
   * @returns {string} Current path
   */
  const getCurrentPath = () => window.location.hash.replace(/^#/, "") || "/";

  const currentPath = $(getCurrentPath());
  const container = document.createElement("div");
  container.style.display = "contents";

  window.addEventListener("hashchange", () => {
    const nextPath = getCurrentPath();
    if (currentPath() !== nextPath) currentPath(nextPath);
  });

  $effect(() => {
    const path = currentPath();
    let matchedRoute = null;
    let routeParams = {};

    for (const route of routes) {
      if (route.path instanceof RegExp) {
        const match = path.match(route.path);
        if (match) {
          matchedRoute = route;
          routeParams = match.groups || { id: match[1] };
          break;
        }
      } else if (route.path === path) {
        matchedRoute = route;
        break;
      }
    }

    const previousEffect = activeEffect;
    activeEffect = null;

    try {
      const view = matchedRoute
        ? matchedRoute.component(routeParams)
        : html`
            <h1>404</h1>
          `;

      container.replaceChildren(view instanceof Node ? view : document.createTextNode(view ?? ""));
    } finally {
      activeEffect = previousEffect;
    }
  });

  return container;
};

/**
 * Navigates to a specific route
 * @param {string} path - Target path
 */
$router.go = (path) => {
  const targetPath = path.startsWith("/") ? path : `/${path}`;
  if (window.location.hash !== `#${targetPath}`) window.location.hash = targetPath;
};

/**
 * Simple WebSocket wrapper with signals
 * @param {string} url - WebSocket URL
 * @param {Object} options - Auto-reconnect options
 * @returns {Object} WebSocket with reactive signals
 */
export const $ws = (url, options = {}) => {
  const {
    reconnect = true,
    maxReconnect = 5,
    reconnectInterval = 1000
  } = options;

  const status = $('disconnected');
  const messages = $([]);
  const error = $(null);
  
  let ws = null;
  let reconnectAttempts = 0;
  let reconnectTimer = null;

  const connect = () => {
    status('connecting');
    ws = new WebSocket(url);
    
    ws.onopen = () => {
      status('connected');
      reconnectAttempts = 0;
      error(null);
    };
    
    ws.onmessage = (e) => {
      messages([...messages(), e.data]);
    };
    
    ws.onerror = (err) => {
      error(err);
      status('error');
    };
    
    ws.onclose = () => {
      status('disconnected');
      
      if (reconnect && reconnectAttempts < maxReconnect) {
        reconnectTimer = setTimeout(() => {
          reconnectAttempts++;
          connect();
        }, reconnectInterval * Math.pow(2, reconnectAttempts));
      }
    };
  };

  const send = (data) => {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  };

  const close = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) {
      ws.close();
      ws = null;
    }
  };

  connect();

  if ($effect?.onCleanup) $e.onCleanup(close);

  return { status, messages, error, send, close };
};
