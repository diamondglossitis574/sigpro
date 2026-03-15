import fs from 'fs';
import path from 'path';

/**
 * SigPro Router Plugin for Vite
 * 
 * This plugin generates routes automatically based on the file structure in src/pages/
 * It creates a virtual module 'virtual:sigpro-routes' that exports a routes array
 * with all the detected pages and their corresponding components.
 * 
 * @returns {import('vite').Plugin} Vite plugin object
 */
export default function sigproRouter() {
  // Virtual module identifiers
  const VIRTUAL_MODULE_ID = 'virtual:sigpro-routes';
  const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

  /**
   * Recursively retrieves all JavaScript files from a directory
   * 
   * @param {string} directoryPath - The path to scan for files
   * @returns {string[]} Array of absolute paths to all .js files found
   */
  function getAllJavaScriptFiles(directoryPath) {
    let filesFound = [];
    
    // Return empty array if directory doesn't exist
    if (!fs.existsSync(directoryPath)) return filesFound;
    
    const directoryContents = fs.readdirSync(directoryPath);
    
    directoryContents.forEach(item => {
      const fullItemPath = path.resolve(directoryPath, item);
      const itemStats = fs.statSync(fullItemPath);
      
      if (itemStats && itemStats.isDirectory()) {
        // Recursively scan subdirectories
        filesFound = filesFound.concat(getAllJavaScriptFiles(fullItemPath));
      } else if (item.endsWith('.js')) {
        // Add JavaScript files to results
        filesFound.push(fullItemPath);
      }
    });
    
    return filesFound;
  }

  return {
    name: 'sigpro-router',

    /**
     * Resolves the virtual module ID to our internal ID
     * 
     * @param {string} importeeId - The module ID being imported
     * @returns {string|null} The resolved virtual module ID or null
     */
    resolveId(importeeId) {
      if (importeeId === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
    },

    /**
     * Generates the virtual module content with route definitions
     * 
     * @param {string} moduleId - The resolved module ID being loaded
     * @returns {string|null} Generated module code or null
     */
    load(moduleId) {
      if (moduleId === RESOLVED_VIRTUAL_MODULE_ID) {
        const PAGES_DIRECTORY = path.resolve(process.cwd(), 'src/pages');
        let pageFiles = getAllJavaScriptFiles(PAGES_DIRECTORY);

        /**
         * Sort files to prioritize routes:
         * 1. Static routes come before dynamic routes
         * 2. Shorter paths come first (more specific routes)
         */
        pageFiles = pageFiles.sort((fileA, fileB) => {
          const fileAHasDynamicParam = fileA.includes('[');
          const fileBHasDynamicParam = fileB.includes('[');
          
          if (fileAHasDynamicParam !== fileBHasDynamicParam) {
            return fileAHasDynamicParam ? 1 : -1;
          }
          return fileA.length - fileB.length;
        });

        let importStatements = '';
        let routeDefinitions = 'export const routes = [\n';

        console.log('\n🚀 [SigPro Router] Generated route map:');

        pageFiles.forEach((fullFilePath, index) => {
          // Calculate relative path from pages directory
          const relativeFilePath = path.relative(PAGES_DIRECTORY, fullFilePath).replace(/\\/g, '/');
          const fileNameWithoutExtension = relativeFilePath.replace('.js', '');
          const componentVariableName = `Page_${index}`;
          
          // Convert file path to URL path
          let urlPath = '/' + fileNameWithoutExtension.toLowerCase();
          if (urlPath.endsWith('/index')) urlPath = urlPath.replace('/index', '') || '/';

          // Detect if this is a dynamic route (contains [param])
          const isDynamicRoute = urlPath.includes('[') && urlPath.includes(']');
          let finalPathValue = `'${urlPath}'`;
          let parameterName = null;

          if (isDynamicRoute) {
            // Extract parameter name from brackets (e.g., from [id] extract 'id')
            const parameterMatch = urlPath.match(/\[([^\]]+)\]/);
            parameterName = parameterMatch ? parameterMatch[1] : 'id';

            /**
             * Convert dynamic route to RegExp with named capture groups
             * Example: /blog/[id] becomes new RegExp("^\\/blog\\/(?<id>[^/]+)$")
             * This allows accessing parameters via match.groups.parameterName
             */
            const regexPattern = urlPath
              .replace(/\//g, '\\/')
              .replace(/\[([^\]]+)\]/, '(?<$1>[^/]+)'); // Replace [id] with (?<id>[^/]+)
            
            finalPathValue = `new RegExp("^${regexPattern}$")`;
          }

          // Log route information to console
          console.log(`   ${isDynamicRoute ? '🔗' : '📄'} ${urlPath.padEnd(20)} -> ${relativeFilePath}`);

          // Generate import statement for this page component
          importStatements += `import ${componentVariableName} from './src/pages/${relativeFilePath}';\n`;
          
          // Generate route definition object
          routeDefinitions += `  { path: ${finalPathValue}, component: ${componentVariableName}, isDynamic: ${isDynamicRoute}, paramName: ${parameterName ? `'${parameterName}'` : 'null'} },\n`;
        });

        routeDefinitions += '];';
        
        // Return complete module code
        return `${importStatements}\n${routeDefinitions}`;
      }
    }
  };
}
