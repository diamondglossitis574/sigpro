// index.js

// 1. Re-export all named core logic (signals, effects, html, etc.)
export * from './sigpro.js';

// 2. Import and re-export the Vite Router Plugin
// This allows users to import { sigproRouter } directly from the package
import sigproRouter from './sigpro-router-plugin.js';
export { sigproRouter };

// 3. Re-export UI components
// Users can import components like: import { Button, Input, Card } from 'sigpro';
export * from './UI/index.js';

// 4. Default export for the global namespace (optional)
// Combines core logic, router plugin, and UI components into a single object
import * as sigpro from './sigpro.js';
export default { ...sigpro, sigproRouter };
