// index.js

// 1. Re-export all named core logic (signals, effects, html, etc.)
export * from './sigpro.js';

// 2. Import and re-export the Vite Router Plugin
// This allows users to import { sigproRouter } directly from the package
import sigproRouter from './SigProRouterPlugin/vite-plugin.sigpro.js';
export { sigproRouter };

// 3. Default export for the global namespace (optional)
// Combines core logic and the router plugin into a single object
import * as sigpro from './sigpro.js';
export default { ...sigpro, sigproRouter };
