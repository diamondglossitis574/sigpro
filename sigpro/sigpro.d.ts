/**
 * SigPro - Atomic Unified Reactive Engine
 * A lightweight, fine-grained reactivity system with built-in routing and plugin support.
 * 
 * @example
 * ```typescript
 * // Create a reactive signal
 * const count = $(0);
 * 
 * // Create a computed value
 * const double = $(() => count() * 2);
 * 
 * // Create reactive HTML
 * const app = div({ $class: () => count() > 5 ? 'high' : 'low' }, [
 *   h1("Counter Demo"),
 *   p("Count: ", () => count()),
 *   p("Double: ", () => double()),
 *   button({ onclick: () => count(count() + 1) }, "Increment")
 * ]);
 * 
 * // Mount to DOM
 * $.mount(app);
 * ```
 */
declare global {
  interface Window {
    /** Main SigPro instance */
    $: SigPro;
    /** HTML element creators (auto-generated from tags list) */
    div: typeof html;
    span: typeof html;
    p: typeof html;
    button: typeof html;
    h1: typeof html;
    h2: typeof html;
    h3: typeof html;
    ul: typeof html;
    ol: typeof html;
    li: typeof html;
    a: typeof html;
    label: typeof html;
    section: typeof html;
    nav: typeof html;
    main: typeof html;
    header: typeof html;
    footer: typeof html;
    input: typeof html;
    form: typeof html;
    img: typeof html;
    select: typeof html;
    option: typeof html;
    table: typeof html;
    thead: typeof html;
    tbody: typeof html;
    tr: typeof html;
    th: typeof html;
    td: typeof html;
    canvas: typeof html;
    video: typeof html;
    audio: typeof html;
  }

  /**
   * Reactive Signal - A reactive state container
   * @template T Type of the stored value
   */
  interface Signal<T> {
    /** Get the current value */
    (): T;
    /** Set a new value */
    (value: T): T;
    /** Update value based on previous value */
    (updater: (prev: T) => T): T;
  }

  /**
   * Computed Signal - A reactive derived value
   * @template T Type of the computed value
   */
  interface Computed<T> {
    /** Get the current computed value */
    (): T;
  }

  /**
   * Reactive Effect - A function that re-runs when dependencies change
   */
  type Effect = () => void;

  /**
   * HTML Content Types
   */
  type HtmlContent = 
    | string 
    | number 
    | boolean 
    | null 
    | undefined
    | Node 
    | HtmlContent[]
    | (() => string | number | Node | null | undefined);

  /**
   * HTML Attributes and Event Handlers
   */
  interface HtmlProps extends Record<string, any> {
    /** Two-way binding for input values */
    $value?: Signal<any> | ((val: any) => void);
    /** Two-way binding for checkbox/radio checked state */
    $checked?: Signal<boolean> | ((val: boolean) => void);
    /** Reactive class binding */
    $class?: string | (() => string);
    /** Reactive style binding */
    $style?: string | object | (() => string | object);
    /** Reactive attribute binding (any attribute can be prefixed with $) */
    [key: `$${string}`]: any;
    /** Standard event handlers */
    onclick?: (event: MouseEvent) => void;
    oninput?: (event: Event) => void;
    onchange?: (event: Event) => void;
    onsubmit?: (event: Event) => void;
    onkeydown?: (event: KeyboardEvent) => void;
    onkeyup?: (event: KeyboardEvent) => void;
    onfocus?: (event: FocusEvent) => void;
    onblur?: (event: FocusEvent) => void;
    onmouseover?: (event: MouseEvent) => void;
    onmouseout?: (event: MouseEvent) => void;
    [key: `on${string}`]: ((event: any) => void) | undefined;
  }

  /**
   * Route Configuration
   */
  interface Route {
    /** URL path pattern (supports :params and * wildcard) */
    path: string;
    /** Component to render (can be sync, async, or Promise) */
    component: ((params: Record<string, string>) => HTMLElement | Promise<HTMLElement>) | Promise<any> | HTMLElement;
  }

  /**
   * Router Instance
   */
  interface Router {
    /** Router container element */
    (routes: Route[]): HTMLElement;
    /** Programmatic navigation */
    go: (path: string) => void;
  }

  /**
   * Plugin System
   */
  interface Plugin {
    /**
     * Extend SigPro with custom functionality or load external scripts
     * @param source - Plugin function, script URL, or array of URLs
     * @returns SigPro instance (sync) or Promise (async loading)
     */
    (source: ((sigpro: SigPro) => void) | string | string[]): SigPro | Promise<SigPro>;
  }

  /**
   * Main SigPro Interface
   */
  interface SigPro {
    /**
     * Create a reactive Signal or Computed value
     * @template T Type of the value
     * @param initial - Initial value or computed function
     * @param key - Optional localStorage key for persistence
     * @returns Reactive signal or computed function
     * 
     * @example
     * ```typescript
     * // Signal with localStorage persistence
     * const count = $(0, 'app.count');
     * 
     * // Computed value
     * const double = $(() => count() * 2);
     * 
     * // Reactive effect (runs automatically)
     * $(() => console.log('Count changed:', count()));
     * ```
     */
    <T>(initial: T, key?: string): Signal<T>;
    <T>(computed: () => T, key?: string): Computed<T>;
    
    /**
     * Create reactive HTML elements with hyperscript syntax
     * @param tag - HTML tag name
     * @param props - Attributes, events, and reactive bindings
     * @param content - Child nodes or content
     * @returns Live DOM element with reactivity
     * 
     * @example
     * ```typescript
     * const name = $('World');
     * 
     * const element = $.html('div', 
     *   { class: 'greeting', $class: () => name().length > 5 ? 'long' : '' },
     *   [
     *     $.html('h1', 'Hello'),
     *     $.html('p', () => `Hello, ${name()}!`),
     *     $.html('input', {
     *       $value: name,
     *       placeholder: 'Enter your name'
     *     })
     *   ]
     * );
     * ```
     */
    html: typeof html;
    
    /**
     * Mount a component to the DOM
     * @param node - Component or element to mount
     * @param target - Target element or CSS selector (default: document.body)
     * 
     * @example
     * ```typescript
     * // Mount to body
     * $.mount(app);
     * 
     * // Mount to specific element
     * $.mount(app, '#app');
     * 
     * // Mount with component function
     * $.mount(() => div("Dynamic component"));
     * ```
     */
    mount: typeof mount;
    
    /**
     * Initialize a hash-based router
     * @param routes - Array of route configurations
     * @returns Router container element
     * 
     * @example
     * ```typescript
     * const routes = [
     *   { path: '/', component: Home },
     *   { path: '/user/:id', component: UserProfile },
     *   { path: '*', component: NotFound }
     * ];
     * 
     * const router = $.router(routes);
     * $.mount(router);
     * 
     * // Navigate programmatically
     * $.router.go('/user/42');
     * ```
     */
    router: Router;
    
    /**
     * Extend SigPro with plugins or load external scripts
     * @param source - Plugin function, script URL, or array of URLs
     * @returns SigPro instance or Promise
     * 
     * @example
     * ```typescript
     * // Load external library
     * await $.plugin('https://cdn.jsdelivr.net/npm/lodash/lodash.min.js');
     * 
     * // Register plugin
     * $.plugin(($) => {
     *   $.customMethod = () => console.log('Custom method');
     * });
     * 
     * // Load multiple scripts
     * await $.plugin(['lib1.js', 'lib2.js']);
     * ```
     */
    plugin: Plugin;
  }

  /**
   * Creates a reactive HTML element
   * @param tag - HTML tag name
   * @param props - Attributes and event handlers
   * @param content - Child content
   * @returns Live DOM element
   */
  function html(tag: string, props?: HtmlProps | HtmlContent, content?: HtmlContent): HTMLElement;

  /**
   * Mount a component to the DOM
   * @param node - Component or element to mount
   * @param target - Target element or CSS selector
   */
  function mount(node: HTMLElement | (() => HTMLElement), target?: HTMLElement | string): void;

  /**
   * Type-safe HTML element creators for common tags
   * 
   * @example
   * ```typescript
   * // Using tag functions directly
   * const myDiv = div({ class: 'container' }, [
   *   h1("Title"),
   *   p("Paragraph text"),
   *   button({ onclick: () => alert('Clicked!') }, "Click me")
   * ]);
   * ```
   */
  interface HtmlTagCreator {
    /**
     * Create HTML element with props and content
     * @param props - HTML attributes and event handlers
     * @param content - Child nodes or content
     * @returns HTMLElement
     */
    (props?: HtmlProps | HtmlContent, content?: HtmlContent): HTMLElement;
  }

  // Type-safe tag creators
  const div: HtmlTagCreator;
  const span: HtmlTagCreator;
  const p: HtmlTagCreator;
  const button: HtmlTagCreator;
  const h1: HtmlTagCreator;
  const h2: HtmlTagCreator;
  const h3: HtmlTagCreator;
  const ul: HtmlTagCreator;
  const ol: HtmlTagCreator;
  const li: HtmlTagCreator;
  const a: HtmlTagCreator;
  const label: HtmlTagCreator;
  const section: HtmlTagCreator;
  const nav: HtmlTagCreator;
  const main: HtmlTagCreator;
  const header: HtmlTagCreator;
  const footer: HtmlTagCreator;
  const input: HtmlTagCreator;
  const form: HtmlTagCreator;
  const img: HtmlTagCreator;
  const select: HtmlTagCreator;
  const option: HtmlTagCreator;
  const table: HtmlTagCreator;
  const thead: HtmlTagCreator;
  const tbody: HtmlTagCreator;
  const tr: HtmlTagCreator;
  const th: HtmlTagCreator;
  const td: HtmlTagCreator;
  const canvas: HtmlTagCreator;
  const video: HtmlTagCreator;
  const audio: HtmlTagCreator;
}

/**
 * Helper types for common use cases
 */
export namespace SigProTypes {
  /**
   * Extract the value type from a Signal
   */
  type SignalValue<T> = T extends Signal<infer U> ? U : never;

  /**
   * Extract the return type from a Computed
   */
  type ComputedValue<T> = T extends Computed<infer U> ? U : never;

  /**
   * Props for a component function
   */
  interface ComponentProps {
    children?: HtmlContent;
    [key: string]: any;
  }

  /**
   * Component function type
   */
  type Component<P extends ComponentProps = ComponentProps> = (props: P) => HTMLElement;

  /**
   * Async component type (for lazy loading)
   */
  type AsyncComponent = () => Promise<{ default: Component }>;
}

export {};

// Make sure $ is available globally
declare const $: SigPro;