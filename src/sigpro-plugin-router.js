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

  function filePathToUrl(relativePath) {
    let url = relativePath.replace(/\\/g, '/').replace(/\.jsx?$/, '');
    
    if (url === 'index') {
      return '/'; 
    }
    
    if (url.endsWith('/index')) {
      url = url.slice(0, -6);
    }
    
    url = url.replace(/\[([^\]]+)\]/g, ':$1');
    
    let finalPath = '/' + url.toLowerCase();
    
    return finalPath.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
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

        files = files.sort((a, b) => {
          const aRel = path.relative(pagesDir, a).replace(/\\/g, '/');
          const bRel = path.relative(pagesDir, b).replace(/\\/g, '/');
          
          const aDynamic = aRel.includes('[') || aRel.includes(':');
          const bDynamic = bRel.includes('[') || bRel.includes(':');

          if (aDynamic !== bDynamic) return aDynamic ? 1 : -1;

          return bRel.length - aRel.length;
        });

        let imports = '';
        let routeArray = 'export const routes = [\n';

        console.log('\n🚀 [SigPro Router] Routes generated:');

        files.forEach((fullPath, i) => {
          const importPath = fullPath.replace(/\\/g, '/');
          const relativePath = path.relative(pagesDir, fullPath).replace(/\\/g, '/');
          const varName = `Page_${i}`;
          
          let urlPath = filePathToUrl(relativePath);
          const isDynamic = urlPath.includes(':');
          
          imports += `import ${varName} from '${importPath}';\n`;
          
          console.log(`   ${isDynamic ? '🔗' : '📄'} ${urlPath.padEnd(30)} -> ${relativePath}`);
          
          routeArray += `  { path: '${urlPath}', component: ${varName} },\n`;
        });

        routeArray += '];';
        
        return `${imports}\n${routeArray}`;
      }
    }
  };
}