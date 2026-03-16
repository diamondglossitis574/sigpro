// plugins/sigpro-plugin-router.js
import fs from 'fs';
import path from 'path';

export default function sigproRouter() {
  const virtualModuleId = 'virtual:sigpro-routes';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const fullPath = path.resolve(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getFiles(fullPath));
      } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(fullPath);
      }
    });
    return results;
  }

  // Convierte path de archivo a URL con :params
  function filePathToUrl(relativePath) {
    // Remover extensión .js
    let url = relativePath.replace(/\.jsx?$/, '');
    
    // Convertir [param] a :param
    url = url.replace(/\[([^\]]+)\]/g, ':$1');
    
    // Index files become parent path
    if (url.endsWith('/index')) {
      url = url.slice(0, -6); // Remove '/index'
    }
    
    // Ensure leading slash
    return '/' + url.toLowerCase();
  }

  return {
    name: 'sigpro-router',
    resolveId(id) {
      if (id === virtualModuleId) return resolvedVirtualModuleId;
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        const pagesDir = path.resolve(process.cwd(), 'src/pages');
        let files = getFiles(pagesDir);

        // Sort: static routes first, then dynamic (more specific first)
        files = files.sort((a, b) => {
          const aPath = path.relative(pagesDir, a);
          const bPath = path.relative(pagesDir, b);
          const aDepth = aPath.split(path.sep).length;
          const bDepth = bPath.split(path.sep).length;
          
          // Deeper paths first (more specific)
          if (aDepth !== bDepth) return bDepth - aDepth;
          
          // Static before dynamic
          const aDynamic = aPath.includes('[');
          const bDynamic = bPath.includes('[');
          if (aDynamic !== bDynamic) return aDynamic ? 1 : -1;
          
          // Alphabetical
          return aPath.localeCompare(bPath);
        });

        let imports = '';
        let routeArray = 'export const routes = [\n';

        console.log('\n🚀 [SigPro Router] Routes generated:');

        files.forEach((fullPath, i) => {
          const relativePath = path.relative(pagesDir, fullPath).replace(/\\/g, '/');
          const varName = `Page_${i}`;
          
          // Generate URL path from file structure
          let urlPath = filePathToUrl(relativePath);
          
          // Check if it's dynamic (contains ':')
          const isDynamic = urlPath.includes(':');
          
          imports += `import ${varName} from '${fullPath}';\n`;
          
          console.log(`   ${isDynamic ? '🔗' : '📄'} ${urlPath.padEnd(30)} -> ${relativePath}`);
          
          routeArray += `  { path: '${urlPath}', component: ${varName} },\n`;
        });

        routeArray += '];';
        
        return `${imports}\n${routeArray}`;
      }
    }
  };
}
