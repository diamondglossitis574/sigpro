/**
 * SigPro Plugins
 * Official plugins for SigPro reactive framework
 * 
 * @module sigpro/plugins
 */

import type { SigPro } from '../sigpro/sigpro';

/**
 * Plugin context passed to all plugins
 */
export interface PluginContext {
  $: SigPro;
}

/**
 * Base plugin interface
 */
export interface SigProPlugin {
  /** Plugin name for debugging */
  name: string;
  /** Plugin version */
  version?: string;
  /** Initialize plugin with SigPro instance */
  install: (context: PluginContext) => void | Promise<void>;
}

/**
 * UI Plugin - Creates reactive UI components
 * 
 * @example
 * ```javascript
 * import { UI } from 'sigpro/plugins';
 * 
 * $.plugin(UI);
 * 
 * // Now you can use UI components
 * const modal = UI.modal({
 *   title: 'Hello',
 *   content: 'This is a modal'
 * });
 * ```
 */
export const UI: SigProPlugin;

/**
 * Fetch Plugin - Reactive data fetching
 * 
 * @example
 * ```javascript
 * import { Fetch } from 'sigpro/plugins';
 * 
 * $.plugin(Fetch);
 * 
 * // Reactive data fetching
 * const users = $.fetch('/api/users');
 * const user = $.fetch(() => `/api/users/${userId()}`);
 * ```
 */
export const Fetch: SigProPlugin;

/**
 * Debug Plugin - Development tools and logging
 * 
 * @example
 * ```javascript
 * import { Debug } from 'sigpro/plugins';
 * 
 * $.plugin(Debug);
 * 
 * // Debug signals in console
 * $.debug(count); // Logs changes to console
 * ```
 */
export const Debug: SigProPlugin;

/**
 * Plugin options for each plugin
 */
export namespace PluginOptions {
  interface UIOptions {
    /** Prefix for CSS classes */
    classPrefix?: string;
    /** Default animation duration */
    animationDuration?: number;
  }

  interface FetchOptions {
    /** Base URL for all requests */
    baseURL?: string;
    /** Default headers */
    headers?: Record<string, string>;
    /** Timeout in milliseconds */
    timeout?: number;
  }

  interface DebugOptions {
    /** Enable verbose logging */
    verbose?: boolean;
    /** Log to console */
    logToConsole?: boolean;
    /** Enable time travel debugging */
    timeTravel?: boolean;
  }
}